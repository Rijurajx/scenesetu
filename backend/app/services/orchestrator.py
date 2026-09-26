from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.models.enums import (
    GenerationRunStatus, PostStatus, ValidationStatus, PlatformType, Language
)
from app.models.entities import (
    Campaign, GenerationRun, Asset, PlatformPost, ValidationResult, Insight
)
from app.schemas.ai import FullGenerationPlanSchema, PlatformStrategySchema
from app.ai.factory import get_llm_provider, get_visual_provider
from app.validators.engine import ValidationEngine

def utcnow():
    return datetime.now(timezone.utc)

class GenerationOrchestrator:
    @classmethod
    async def run_campaign_generation(
        cls,
        db: AsyncSession,
        campaign_id: str,
        refinement_instruction: Optional[str] = None,
        prior_insight_ids: Optional[List[str]] = None
    ) -> GenerationRun:
        """
        Executes the critical vertical slice:
        Brief -> AI Campaign Strategy -> 3 Platform Strategies -> Visual Generation
        -> Deterministic Validation -> PENDING_REVIEW / FAILED -> DB Persistence.
        """
        # 1. Fetch Campaign
        stmt = select(Campaign).where(Campaign.id == campaign_id)
        res = await db.execute(stmt)
        campaign = res.scalar_one_or_none()
        if not campaign:
            raise ValueError(f"Campaign with ID {campaign_id} not found.")

        # 2. Fetch prior insights for the Closed-Loop Feedback
        insight_ids_to_use = prior_insight_ids or campaign.prior_insight_ids or []
        prior_insights_data = []
        if insight_ids_to_use:
            insight_stmt = select(Insight).where(Insight.id.in_(insight_ids_to_use))
            insight_res = await db.execute(insight_stmt)
            insights = insight_res.scalars().all()
            prior_insights_data = [
                {
                    "id": ins.id,
                    "title": ins.title,
                    "summary": ins.summary,
                    "category": ins.category,
                    "recommendation_for_next_brief": ins.recommendation_for_next_brief
                }
                for ins in insights
            ]

        # 3. Create GenerationRun in GENERATING state
        # Count existing runs
        count_stmt = select(GenerationRun).where(GenerationRun.campaign_id == campaign_id)
        count_res = await db.execute(count_stmt)
        run_number = len(count_res.scalars().all()) + 1

        run = GenerationRun(
            campaign_id=campaign_id,
            run_number=run_number,
            status=GenerationRunStatus.GENERATING.value,
            brief_snapshot=campaign.brief
        )
        db.add(run)
        await db.commit()
        await db.refresh(run)

        llm = get_llm_provider()
        visual_provider = get_visual_provider()

        try:
            # 4. Generate Campaign Strategy & Platform Plans
            logger.info(f"Generating campaign plan via LLM for campaign {campaign_id} (run {run.id})")
            brief_to_send = campaign.brief
            if refinement_instruction:
                brief_to_send += f"\n\nUSER REFINEMENT INSTRUCTION:\n{refinement_instruction}"

            plan: FullGenerationPlanSchema = await llm.generate_campaign_plan(
                brief=brief_to_send,
                primary_language=campaign.primary_language,
                target_audience=campaign.target_audience,
                key_objectives=campaign.key_objectives,
                prior_insights=prior_insights_data
            )

            run.strategy_payload = plan.model_dump()
            run.status = GenerationRunStatus.VALIDATING.value
            await db.commit()

            all_valid = True

            # 5. Process each platform plan (Instagram, YouTube, X)
            for p_plan in plan.platform_plans:
                platform_name = p_plan.platform.value

                # 5a. Visual Generation via Hosted Provider
                logger.info(f"Generating visual asset for {platform_name} with prompt: {p_plan.visual_prompt_for_ai[:60]}...")
                visual_result = await visual_provider.generate_image(
                    prompt=p_plan.visual_prompt_for_ai,
                    aspect_ratio=p_plan.recommended_aspect_ratio,
                    negative_prompt=p_plan.negative_visual_prompt
                )

                # 5b. Persist Asset record
                asset = Asset(
                    generation_run_id=run.id,
                    platform=platform_name,
                    asset_type="image",
                    provider=visual_result.provider,
                    model_name=visual_result.model_name,
                    prompt=visual_result.prompt,
                    negative_prompt=visual_result.negative_prompt,
                    storage_path=visual_result.media_url,
                    public_url=visual_result.media_url,
                    width=visual_result.width,
                    height=visual_result.height,
                    aspect_ratio=visual_result.aspect_ratio,
                    file_size_bytes=visual_result.file_size_bytes,
                    mime_type=visual_result.mime_type
                )
                db.add(asset)
                await db.flush()

                # 5c. Run Deterministic Platform Validation
                validation_out = ValidationEngine.validate_post(
                    platform=platform_name,
                    copy_primary=p_plan.copy_primary,
                    cta=p_plan.cta,
                    hashtags=p_plan.hashtags,
                    title=p_plan.copy_headline,
                    asset_aspect_ratio=visual_result.aspect_ratio,
                    asset_file_size=visual_result.file_size_bytes,
                    asset_mime_type=visual_result.mime_type
                )

                post_status = (
                    PostStatus.PENDING_REVIEW.value
                    if validation_out.status == ValidationStatus.PASSED
                    else PostStatus.FAILED.value
                )
                if validation_out.status != ValidationStatus.PASSED:
                    all_valid = False

                # 5d. Persist PlatformPost
                post = PlatformPost(
                    campaign_id=campaign_id,
                    generation_run_id=run.id,
                    asset_id=asset.id,
                    platform=platform_name,
                    language=p_plan.language.value,
                    title=p_plan.copy_headline,
                    copy_primary=p_plan.copy_primary,
                    copy_secondary=p_plan.copy_secondary,
                    hashtags=p_plan.hashtags,
                    cta=p_plan.cta,
                    status=post_status,
                    iteration_number=1
                )
                db.add(post)
                await db.flush()

                # 5e. Persist ValidationResult attached to post
                val_result = ValidationResult(
                    post_id=post.id,
                    status=validation_out.status.value,
                    rules_checked=[check.model_dump() for check in validation_out.checks],
                    error_summary=validation_out.error_summary
                )
                db.add(val_result)

            # 6. Finalize GenerationRun status
            run.status = GenerationRunStatus.READY_FOR_REVIEW.value if all_valid else GenerationRunStatus.INVALID.value
            run.completed_at = utcnow()
            await db.commit()

            # Reload with all relations
            stmt_reload = (
                select(GenerationRun)
                .where(GenerationRun.id == run.id)
                .options(
                    selectinload(GenerationRun.posts).selectinload(PlatformPost.asset),
                    selectinload(GenerationRun.posts).selectinload(PlatformPost.validation_results),
                    selectinload(GenerationRun.assets)
                )
            )
            reloaded = await db.execute(stmt_reload)
            return reloaded.scalar_one()

        except Exception as e:
            logger.error(f"Generation run {run.id} failed: {e}", exc_info=True)
            run.status = GenerationRunStatus.FAILED.value
            run.error_message = str(e)
            run.completed_at = utcnow()
            await db.commit()
            raise

    @classmethod
    async def refine_single_post(
        cls,
        db: AsyncSession,
        post_id: str,
        refinement_instruction: str
    ) -> PlatformPost:
        """
        Executes Discard-and-Retry / Refinement Loop (Phase 10):
        Human rejects -> Provides feedback -> AI regenerates -> Deterministic Validation -> PENDING_REVIEW.
        Preserves complete lineage with parent_post_id and iteration_number.
        """
        stmt = (
            select(PlatformPost)
            .where(PlatformPost.id == post_id)
            .options(selectinload(PlatformPost.asset))
        )
        res = await db.execute(stmt)
        orig_post = res.scalar_one_or_none()
        if not orig_post:
            raise ValueError(f"Post with ID {post_id} not found.")

        # Ensure post is not already published
        if orig_post.status == PostStatus.PUBLISHED.value:
            raise ValueError("Cannot refine an already published post.")

        llm = get_llm_provider()
        visual_provider = get_visual_provider()

        orig_prompt = orig_post.asset.prompt if orig_post.asset else "No prompt"
        refinement_data = await llm.refine_post(
            platform=orig_post.platform,
            original_copy=orig_post.copy_primary,
            original_prompt=orig_prompt,
            human_feedback=refinement_instruction
        )

        # Generate new asset if prompt refined
        new_asset = orig_post.asset
        if refinement_data.new_visual_prompt and refinement_data.new_visual_prompt != orig_prompt:
            aspect_ratio = orig_post.asset.aspect_ratio if orig_post.asset else "1:1"
            vis_res = await visual_provider.generate_image(
                prompt=refinement_data.new_visual_prompt,
                aspect_ratio=aspect_ratio
            )
            new_asset = Asset(
                generation_run_id=orig_post.generation_run_id,
                platform=orig_post.platform,
                asset_type="image",
                provider=vis_res.provider,
                model_name=vis_res.model_name,
                prompt=vis_res.prompt,
                negative_prompt=vis_res.negative_prompt,
                storage_path=vis_res.media_url,
                public_url=vis_res.media_url,
                width=vis_res.width,
                height=vis_res.height,
                aspect_ratio=vis_res.aspect_ratio,
                file_size_bytes=vis_res.file_size_bytes,
                mime_type=vis_res.mime_type
            )
            db.add(new_asset)
            await db.flush()

        # Deterministic validation
        val_out = ValidationEngine.validate_post(
            platform=orig_post.platform,
            copy_primary=refinement_data.new_copy_primary,
            cta=refinement_data.new_cta or orig_post.cta,
            hashtags=refinement_data.new_hashtags or orig_post.hashtags,
            title=orig_post.title,
            asset_aspect_ratio=new_asset.aspect_ratio if new_asset else None,
            asset_file_size=new_asset.file_size_bytes if new_asset else None,
            asset_mime_type=new_asset.mime_type if new_asset else None
        )

        new_status = (
            PostStatus.PENDING_REVIEW.value
            if val_out.status == ValidationStatus.PASSED
            else PostStatus.FAILED.value
        )

        # Mark original post as rejected
        orig_post.status = PostStatus.REJECTED.value

        # Create refined post with incremented iteration
        refined_post = PlatformPost(
            campaign_id=orig_post.campaign_id,
            generation_run_id=orig_post.generation_run_id,
            asset_id=new_asset.id if new_asset else None,
            parent_post_id=orig_post.id,
            platform=orig_post.platform,
            language=orig_post.language,
            title=orig_post.title,
            copy_primary=refinement_data.new_copy_primary,
            copy_secondary=orig_post.copy_secondary,
            hashtags=refinement_data.new_hashtags or orig_post.hashtags,
            cta=refinement_data.new_cta or orig_post.cta,
            status=new_status,
            iteration_number=orig_post.iteration_number + 1,
            refinement_instruction=refinement_instruction
        )
        db.add(refined_post)
        await db.flush()

        val_result = ValidationResult(
            post_id=refined_post.id,
            status=val_out.status.value,
            rules_checked=[check.model_dump() for check in val_out.checks],
            error_summary=val_out.error_summary
        )
        db.add(val_result)
        await db.commit()

        # Reload with relations
        stmt_reload = (
            select(PlatformPost)
            .where(PlatformPost.id == refined_post.id)
            .options(
                selectinload(PlatformPost.asset),
                selectinload(PlatformPost.validation_results),
                selectinload(PlatformPost.approvals),
                selectinload(PlatformPost.schedule),
                selectinload(PlatformPost.publication)
            )
        )
        res_reload = await db.execute(stmt_reload)
        return res_reload.scalar_one()
