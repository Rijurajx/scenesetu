from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.entities import Campaign, GenerationRun, PlatformPost
from app.schemas.campaign import CampaignCreate, CampaignResponse
from app.schemas.generation import GenerationTriggerRequest, GenerationRunResponse
from app.services.orchestrator import GenerationOrchestrator

router = APIRouter(prefix="/campaigns", tags=["Campaigns & Content Briefs"])

@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new campaign from a single content brief.
    Supports closed-loop prior_insight_ids injection.
    """
    campaign = Campaign(
        title=payload.title,
        brief=payload.brief,
        target_audience=payload.target_audience,
        key_objectives=payload.key_objectives,
        primary_language=payload.primary_language.value,
        prior_insight_ids=payload.prior_insight_ids or [],
        status="active"
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return CampaignResponse(
        id=campaign.id,
        title=campaign.title,
        brief=campaign.brief,
        target_audience=campaign.target_audience,
        key_objectives=campaign.key_objectives,
        primary_language=campaign.primary_language,
        prior_insight_ids=campaign.prior_insight_ids or [],
        status=campaign.status,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
        posts=[]
    )

@router.get("", response_model=List[CampaignResponse])
async def list_campaigns(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Lists campaigns ordered by most recent, with their posts and assets."""
    stmt = (
        select(Campaign)
        .order_by(Campaign.created_at.desc())
        .offset(offset)
        .limit(limit)
        .options(
            selectinload(Campaign.posts).selectinload(PlatformPost.asset),
            selectinload(Campaign.posts).selectinload(PlatformPost.validation_results),
            selectinload(Campaign.posts).selectinload(PlatformPost.approvals),
            selectinload(Campaign.posts).selectinload(PlatformPost.publication),
            selectinload(Campaign.posts).selectinload(PlatformPost.schedule),
            selectinload(Campaign.posts).selectinload(PlatformPost.metrics),
        )
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/{campaign_id}")
async def get_campaign_detail(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Fetches full campaign detail with all runs, posts, assets, and validation results."""
    stmt = (
        select(Campaign)
        .where(Campaign.id == campaign_id)
        .options(
            selectinload(Campaign.generation_runs),
            selectinload(Campaign.posts).selectinload(PlatformPost.asset),
            selectinload(Campaign.posts).selectinload(PlatformPost.validation_results),
            selectinload(Campaign.posts).selectinload(PlatformPost.approvals),
            selectinload(Campaign.posts).selectinload(PlatformPost.publication),
            selectinload(Campaign.posts).selectinload(PlatformPost.schedule),
            selectinload(Campaign.posts).selectinload(PlatformPost.metrics),
            selectinload(Campaign.insights)
        )
    )
    res = await db.execute(stmt)
    campaign = res.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return {
        "id": campaign.id,
        "title": campaign.title,
        "brief": campaign.brief,
        "target_audience": campaign.target_audience,
        "key_objectives": campaign.key_objectives,
        "primary_language": campaign.primary_language,
        "prior_insight_ids": campaign.prior_insight_ids,
        "status": campaign.status,
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
        "generation_runs_count": len(campaign.generation_runs),
        "posts": campaign.posts,
        "insights": campaign.insights
    }

@router.post("/{campaign_id}/generate", status_code=status.HTTP_200_OK)
async def trigger_campaign_generation(
    campaign_id: str,
    payload: Optional[GenerationTriggerRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    CRITICAL VERTICAL SLICE (Phase 6):
    Triggers end-to-end content generation pipeline:
    Brief -> AI Strategy -> 3 Platform Strategies -> Visual Generation -> Validation -> PENDING_REVIEW.
    """
    refinement = payload.refinement_instruction if payload else None
    prior_insights = payload.prior_insight_ids if payload else None
    aspect_ratios = payload.platform_aspect_ratios if payload else None
    text_limits = payload.text_limits if payload else None

    try:
        run = await GenerationOrchestrator.run_campaign_generation(
            db=db,
            campaign_id=campaign_id,
            refinement_instruction=refinement,
            prior_insight_ids=prior_insights,
            platform_aspect_ratios=aspect_ratios,
            text_limits=text_limits
        )
        return {
            "status": "success",
            "message": "Content generation and validation pipeline executed.",
            "generation_run_id": run.id,
            "run_status": run.status,
            "posts_generated": len(run.posts),
            "posts": run.posts
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation pipeline error: {str(e)}")

@router.post("/{campaign_id}/send-to-review")
async def send_campaign_to_review(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Universal review trigger: marks all campaign posts as pending_review
    and readies the entire campaign for the Review Gate.
    """
    stmt = (
        select(Campaign)
        .where(Campaign.id == campaign_id)
        .options(
            selectinload(Campaign.posts).selectinload(PlatformPost.asset),
            selectinload(Campaign.posts).selectinload(PlatformPost.validation_results)
        )
    )
    res = await db.execute(stmt)
    campaign = res.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    for post in campaign.posts:
        if post.status != "approved":
            post.status = "pending_review"

    await db.commit()
    return {
        "status": "success",
        "message": f"Campaign '{campaign.title}' sent to Review Gate.",
        "campaign_id": campaign.id,
        "posts_count": len(campaign.posts)
    }

@router.post("/{campaign_id}/send-to-studio")
async def send_campaign_to_studio(
    campaign_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Sends campaign back to AI Multi-Platform Studio for editing, regeneration, or adjustments.
    """
    stmt = (
        select(Campaign)
        .where(Campaign.id == campaign_id)
        .options(
            selectinload(Campaign.posts).selectinload(PlatformPost.asset)
        )
    )
    res = await db.execute(stmt)
    campaign = res.scalar_one_or_none()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    for post in campaign.posts:
        if post.status in ("rejected", "pending_review"):
            post.status = "draft"

    await db.commit()
    return {
        "status": "success",
        "message": f"Campaign '{campaign.title}' returned to AI Multi-Platform Studio.",
        "campaign_id": campaign.id,
        "posts_count": len(campaign.posts)
    }
