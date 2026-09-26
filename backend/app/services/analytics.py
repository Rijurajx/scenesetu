from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.models.entities import Campaign, PlatformPost, Metric
from app.schemas.analytics import (
    MetricCreate, LikeForLikePostComparison, LikeForLikeComparisonResponse, MetricResponse
)

def utcnow():
    return datetime.now(timezone.utc)

class AnalyticsService:
    @classmethod
    async def ingest_metric(
        cls,
        db: AsyncSession,
        data: MetricCreate
    ) -> Metric:
        """
        Ingests performance metrics for a specific post.
        Preserves strict relationship: Campaign -> Post -> Metrics.
        """
        stmt = (
            select(PlatformPost)
            .where(PlatformPost.id == data.post_id)
            .options(selectinload(PlatformPost.campaign))
        )
        res = await db.execute(stmt)
        post = res.scalar_one_or_none()
        if not post:
            raise ValueError(f"Post with ID {data.post_id} not found.")

        # Compute engagement rate: ((likes + comments + shares + clicks) / impressions) * 100
        impressions = max(data.impressions, 1)
        eng_total = data.likes + data.comments + data.shares + data.clicks
        eng_rate = round((eng_total / impressions) * 100, 2)

        # Check existing metric for post
        exist_stmt = select(Metric).where(Metric.post_id == data.post_id)
        exist_res = await db.execute(exist_stmt)
        metric = exist_res.scalar_one_or_none()

        if metric:
            metric.impressions = data.impressions
            metric.reach = data.reach
            metric.likes = data.likes
            metric.comments = data.comments
            metric.shares = data.shares
            metric.clicks = data.clicks
            metric.video_views = data.video_views
            metric.watch_time_seconds = data.watch_time_seconds
            metric.engagement_rate = eng_rate
            metric.recorded_at = utcnow()
        else:
            metric = Metric(
                campaign_id=post.campaign_id,
                post_id=post.id,
                platform=post.platform,
                impressions=data.impressions,
                reach=data.reach,
                likes=data.likes,
                comments=data.comments,
                shares=data.shares,
                clicks=data.clicks,
                video_views=data.video_views,
                watch_time_seconds=data.watch_time_seconds,
                engagement_rate=eng_rate,
                recorded_at=utcnow()
            )
            db.add(metric)

        await db.commit()
        await db.refresh(metric)
        logger.info(f"Ingested metrics for post {data.post_id} ({post.platform}): Eng Rate = {eng_rate}%")
        return metric

    @classmethod
    async def get_like_for_like_comparison(
        cls,
        db: AsyncSession,
        campaign_id: str
    ) -> LikeForLikeComparisonResponse:
        """
        Cross-Platform Like-for-Like Comparison (Phase 15):
        Compares adaptations of the SAME content concept side-by-side across channels,
        not just siloed platform totals.
        """
        stmt = (
            select(Campaign)
            .where(Campaign.id == campaign_id)
            .options(
                selectinload(Campaign.posts).selectinload(PlatformPost.asset),
                selectinload(Campaign.posts).selectinload(PlatformPost.metrics)
            )
        )
        res = await db.execute(stmt)
        campaign = res.scalar_one_or_none()
        if not campaign:
            raise ValueError(f"Campaign with ID {campaign_id} not found.")

        # Find latest iteration for each platform
        latest_posts_by_platform = {}
        for p in campaign.posts:
            if p.platform not in latest_posts_by_platform or p.iteration_number > latest_posts_by_platform[p.platform].iteration_number:
                latest_posts_by_platform[p.platform] = p

        comparisons: List[LikeForLikePostComparison] = []
        best_platform: Optional[str] = None
        best_eng_rate: float = -1.0

        for platform, post in latest_posts_by_platform.items():
            metric_data = None
            if post.metrics:
                m = post.metrics[-1]
                metric_data = MetricResponse.model_validate(m)
                if m.engagement_rate > best_eng_rate:
                    best_eng_rate = m.engagement_rate
                    best_platform = platform

            comparisons.append(
                LikeForLikePostComparison(
                    post_id=post.id,
                    platform=post.platform,
                    copy_snippet=(post.copy_primary[:100] + "...") if len(post.copy_primary) > 100 else post.copy_primary,
                    visual_aspect_ratio=post.asset.aspect_ratio if post.asset else None,
                    media_url=post.asset.public_url if post.asset else None,
                    status=post.status,
                    metrics=metric_data
                )
            )

        summary = (
            f"Comparing {len(comparisons)} platform adaptations for campaign '{campaign.title}'. "
            + (f"Winner: {best_platform.upper()} with {best_eng_rate}% engagement rate." if best_platform else "No performance metrics ingested yet.")
        )

        return LikeForLikeComparisonResponse(
            campaign_id=campaign.id,
            campaign_title=campaign.title,
            concept_theme=campaign.brief[:100],
            posts=comparisons,
            winning_platform_by_engagement=best_platform,
            comparison_summary=summary
        )
