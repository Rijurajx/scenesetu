import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.models.enums import (
    PlatformType, PostStatus, PublicationStatus, ScheduleStatus, ApprovalDecision
)
from app.models.entities import PlatformPost, Approval, Schedule, Publication
from app.validators.engine import ValidationEngine

def utcnow():
    return datetime.now(timezone.utc)

class MockPlatformPublisher:
    @classmethod
    def publish_to_instagram(cls, post: PlatformPost) -> Dict[str, Any]:
        mock_id = f"ig_{uuid.uuid4().hex[:10]}"
        return {
            "external_post_id": mock_id,
            "external_url": f"https://instagram.com/p/{mock_id}",
            "payload_snapshot": {
                "caption": post.copy_primary,
                "hashtags": post.hashtags,
                "cta": post.cta,
                "asset_url": post.asset.public_url if post.asset else None
            }
        }

    @classmethod
    def publish_to_youtube(cls, post: PlatformPost) -> Dict[str, Any]:
        mock_id = f"yt_{uuid.uuid4().hex[:11]}"
        return {
            "external_post_id": mock_id,
            "external_url": f"https://youtube.com/community/{mock_id}",
            "payload_snapshot": {
                "title": post.title,
                "description": post.copy_primary,
                "hashtags": post.hashtags,
                "cta": post.cta,
                "thumbnail_url": post.asset.public_url if post.asset else None
            }
        }

    @classmethod
    def publish_to_x(cls, post: PlatformPost) -> Dict[str, Any]:
        mock_id = f"x_{uuid.uuid4().hex[:12]}"
        return {
            "external_post_id": mock_id,
            "external_url": f"https://x.com/hoichoi/status/{mock_id}",
            "payload_snapshot": {
                "text": f"{post.copy_primary}\n\n{post.cta}",
                "hashtags": post.hashtags,
                "media_url": post.asset.public_url if post.asset else None
            }
        }


class PublishingWorkflowService:
    @classmethod
    async def approve_post(
        cls,
        db: AsyncSession,
        post_id: str,
        reviewer_name: str = "human_operator",
        feedback: Optional[str] = None
    ) -> PlatformPost:
        """
        Human Approval Gate (Phase 9):
        Enforces: VALIDATED / PENDING_REVIEW -> APPROVED.
        """
        stmt = (
            select(PlatformPost)
            .where(PlatformPost.id == post_id)
            .options(
                selectinload(PlatformPost.asset),
                selectinload(PlatformPost.validation_results),
                selectinload(PlatformPost.approvals),
                selectinload(PlatformPost.schedule),
                selectinload(PlatformPost.publication)
            )
        )
        res = await db.execute(stmt)
        post = res.scalar_one_or_none()
        if not post:
            raise ValueError(f"Post with ID {post_id} not found.")

        # Check if post has passed validation
        has_passed_validation = any(
            v.status == "passed" for v in post.validation_results
        )
        if not has_passed_validation:
            raise ValueError("Cannot approve a post that has not passed deterministic platform validation.")

        approval = Approval(
            post_id=post.id,
            decision=ApprovalDecision.APPROVED.value,
            reviewer_name=reviewer_name,
            feedback=feedback
        )
        db.add(approval)
        post.status = PostStatus.APPROVED.value
        await db.commit()

        stmt_reload = (
            select(PlatformPost)
            .where(PlatformPost.id == post.id)
            .options(
                selectinload(PlatformPost.asset),
                selectinload(PlatformPost.validation_results),
                selectinload(PlatformPost.approvals),
                selectinload(PlatformPost.schedule),
                selectinload(PlatformPost.publication)
            )
        )
        res_reload = await db.execute(stmt_reload)
        logger.info(f"Post {post.id} ({post.platform}) APPROVED by {reviewer_name}")
        return res_reload.scalar_one()

    @classmethod
    async def reject_post(
        cls,
        db: AsyncSession,
        post_id: str,
        reviewer_name: str = "human_operator",
        feedback: Optional[str] = None
    ) -> PlatformPost:
        """
        Human Rejection Gate:
        Enforces: PENDING_REVIEW -> REJECTED.
        """
        stmt = (
            select(PlatformPost)
            .where(PlatformPost.id == post_id)
            .options(
                selectinload(PlatformPost.asset),
                selectinload(PlatformPost.validation_results),
                selectinload(PlatformPost.approvals),
                selectinload(PlatformPost.schedule),
                selectinload(PlatformPost.publication)
            )
        )
        res = await db.execute(stmt)
        post = res.scalar_one_or_none()
        if not post:
            raise ValueError(f"Post with ID {post_id} not found.")

        if post.status == PostStatus.PUBLISHED.value:
            raise ValueError("Cannot reject an already published post.")

        approval = Approval(
            post_id=post.id,
            decision=ApprovalDecision.REJECTED.value,
            reviewer_name=reviewer_name,
            feedback=feedback or "Rejected by reviewer"
        )
        db.add(approval)
        post.status = PostStatus.REJECTED.value
        await db.commit()

        stmt_reload = (
            select(PlatformPost)
            .where(PlatformPost.id == post.id)
            .options(
                selectinload(PlatformPost.asset),
                selectinload(PlatformPost.validation_results),
                selectinload(PlatformPost.approvals),
                selectinload(PlatformPost.schedule),
                selectinload(PlatformPost.publication)
            )
        )
        res_reload = await db.execute(stmt_reload)
        logger.info(f"Post {post.id} ({post.platform}) REJECTED by {reviewer_name}")
        return res_reload.scalar_one()

    @classmethod
    async def schedule_post(
        cls,
        db: AsyncSession,
        post_id: str,
        scheduled_time: datetime
    ) -> Schedule:
        """
        Scheduling (Phase 13):
        Strict constraint: ONLY APPROVED POSTS CAN BE SCHEDULED.
        """
        stmt = select(PlatformPost).where(PlatformPost.id == post_id)
        res = await db.execute(stmt)
        post = res.scalar_one_or_none()
        if not post:
            raise ValueError(f"Post with ID {post_id} not found.")

        if post.status != PostStatus.APPROVED.value:
            raise ValueError(f"Post must be APPROVED before scheduling. Current status: {post.status}")

        # Check existing schedule
        sched_stmt = select(Schedule).where(Schedule.post_id == post_id)
        sched_res = await db.execute(sched_stmt)
        schedule = sched_res.scalar_one_or_none()

        if schedule:
            schedule.scheduled_time = scheduled_time
            schedule.status = ScheduleStatus.SCHEDULED.value
        else:
            schedule = Schedule(
                post_id=post.id,
                scheduled_time=scheduled_time,
                status=ScheduleStatus.SCHEDULED.value
            )
            db.add(schedule)

        post.status = PostStatus.SCHEDULED.value
        await db.commit()
        await db.refresh(schedule)
        logger.info(f"Post {post.id} scheduled for {scheduled_time}")
        return schedule

    @classmethod
    async def publish_post(
        cls,
        db: AsyncSession,
        post_id: str
    ) -> Publication:
        """
        Mock Publishing (Phase 12):
        Strict constraint: ONLY APPROVED OR SCHEDULED POSTS CAN BE PUBLISHED.
        Validates platform constraints before accepting publish.
        """
        stmt = (
            select(PlatformPost)
            .where(PlatformPost.id == post_id)
            .options(
                selectinload(PlatformPost.asset),
                selectinload(PlatformPost.publication),
                selectinload(PlatformPost.schedule)
            )
        )
        res = await db.execute(stmt)
        post = res.scalar_one_or_none()
        if not post:
            raise ValueError(f"Post with ID {post_id} not found.")

        if post.status not in (PostStatus.APPROVED.value, PostStatus.SCHEDULED.value):
            raise ValueError(
                f"Content cannot be published without explicit approval. Current status is {post.status}."
            )

        # Deterministic check before publication
        val_check = ValidationEngine.validate_post(
            platform=post.platform,
            copy_primary=post.copy_primary,
            cta=post.cta,
            hashtags=post.hashtags,
            title=post.title,
            asset_aspect_ratio=post.asset.aspect_ratio if post.asset else None,
            asset_file_size=post.asset.file_size_bytes if post.asset else None,
            asset_mime_type=post.asset.mime_type if post.asset else None
        )
        if val_check.status.value != "passed":
            post.status = PostStatus.FAILED.value
            await db.commit()
            raise ValueError(f"Publisher rejected post due to validation failure: {val_check.error_summary}")

        # Execute Mock Channel Adapter
        platform_normalized = post.platform.lower().strip()
        if platform_normalized == PlatformType.INSTAGRAM.value:
            pub_result = MockPlatformPublisher.publish_to_instagram(post)
        elif platform_normalized == PlatformType.YOUTUBE.value:
            pub_result = MockPlatformPublisher.publish_to_youtube(post)
        elif platform_normalized in (PlatformType.X_TWITTER.value, "twitter", "x"):
            pub_result = MockPlatformPublisher.publish_to_x(post)
        else:
            raise ValueError(f"Unknown platform: {post.platform}")

        # Persist Publication
        if post.publication:
            publication = post.publication
            publication.status = PublicationStatus.PUBLISHED.value
            publication.external_post_id = pub_result["external_post_id"]
            publication.external_url = pub_result["external_url"]
            publication.payload_snapshot = pub_result["payload_snapshot"]
            publication.published_at = utcnow()
        else:
            publication = Publication(
                post_id=post.id,
                platform=post.platform,
                status=PublicationStatus.PUBLISHED.value,
                external_post_id=pub_result["external_post_id"],
                external_url=pub_result["external_url"],
                payload_snapshot=pub_result["payload_snapshot"],
                published_at=utcnow()
            )
            db.add(publication)

        # Update post status and schedule
        post.status = PostStatus.PUBLISHED.value
        if post.schedule:
            post.schedule.status = ScheduleStatus.COMPLETED.value

        await db.commit()
        await db.refresh(publication)
        logger.info(f"Post {post.id} published to {post.platform}: {publication.external_url}")
        return publication
