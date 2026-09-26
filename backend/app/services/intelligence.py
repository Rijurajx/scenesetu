from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.models.entities import Campaign, PlatformPost, Metric, Insight, Report
from app.schemas.analytics import InsightResponse, ReportResponse
from app.ai.factory import get_llm_provider

def utcnow():
    return datetime.now(timezone.utc)

class ContentIntelligenceService:
    @classmethod
    async def generate_campaign_insights(
        cls,
        db: AsyncSession,
        campaign_id: str
    ) -> List[Insight]:
        """
        AI Insight Engine (Phase 16):
        Uses Gemini to reason over structured performance metrics.
        CRITICAL RULE: Evidence must be linked to concrete post IDs and numbers.
        """
        stmt = (
            select(Campaign)
            .where(Campaign.id == campaign_id)
            .options(
                selectinload(Campaign.posts).selectinload(PlatformPost.metrics),
                selectinload(Campaign.posts).selectinload(PlatformPost.asset)
            )
        )
        res = await db.execute(stmt)
        campaign = res.scalar_one_or_none()
        if not campaign:
            raise ValueError(f"Campaign with ID {campaign_id} not found.")

        # Prepare structured post + metrics payload
        posts_with_metrics = []
        for post in campaign.posts:
            metric_info = {}
            if post.metrics:
                m = post.metrics[-1]
                metric_info = {
                    "impressions": m.impressions,
                    "likes": m.likes,
                    "comments": m.comments,
                    "shares": m.shares,
                    "clicks": m.clicks,
                    "engagement_rate": m.engagement_rate
                }
            posts_with_metrics.append({
                "id": post.id,
                "platform": post.platform,
                "language": post.language,
                "copy_snippet": post.copy_primary[:140],
                "cta": post.cta,
                "hashtags": post.hashtags,
                "status": post.status,
                "aspect_ratio": post.asset.aspect_ratio if post.asset else None,
                "metrics": metric_info
            })

        llm = get_llm_provider()
        logger.info(f"Generating structured AI insights for campaign {campaign.title}")
        structured_insights = await llm.generate_insights_from_metrics(
            campaign_title=campaign.title,
            posts_with_metrics=posts_with_metrics
        )

        persisted_insights = []
        for s_ins in structured_insights:
            insight_entity = Insight(
                campaign_id=campaign.id,
                title=s_ins.title,
                summary=s_ins.summary,
                category=s_ins.category,
                evidence_post_ids=s_ins.evidence_post_ids,
                metrics_evidence=s_ins.metrics_evidence,
                recommendation_for_next_brief=s_ins.recommendation_for_next_brief,
                is_applied_to_future_brief=False,
                created_at=utcnow()
            )
            db.add(insight_entity)
            persisted_insights.append(insight_entity)

        await db.commit()
        for ins in persisted_insights:
            await db.refresh(ins)

        logger.info(f"Generated and persisted {len(persisted_insights)} evidence-backed insights.")
        return persisted_insights

    @classmethod
    async def generate_weekly_report(
        cls,
        db: AsyncSession,
        reporting_period: str = "Week 38 - 2026",
        campaign_id: Optional[str] = None
    ) -> Report:
        """
        Weekly Report Generation (Phase 17):
        Cites post IDs for every factual claim.
        """
        # Fetch active campaigns with posts and metrics
        query = select(Campaign).options(
            selectinload(Campaign.posts).selectinload(PlatformPost.metrics),
            selectinload(Campaign.insights)
        )
        if campaign_id:
            query = query.where(Campaign.id == campaign_id)

        res = await db.execute(query)
        campaigns = res.scalars().all()

        campaigns_data = []
        for c in campaigns:
            c_posts = []
            for p in c.posts:
                last_metric = p.metrics[-1] if p.metrics else None
                c_posts.append({
                    "id": p.id,
                    "platform": p.platform,
                    "engagement_rate": last_metric.engagement_rate if last_metric else 0.0,
                    "likes": last_metric.likes if last_metric else 0
                })
            campaigns_data.append({
                "campaign_id": c.id,
                "campaign_title": c.title,
                "brief": c.brief,
                "posts": c_posts
            })

        llm = get_llm_provider()
        report_schema = await llm.generate_weekly_report(
            reporting_period=reporting_period,
            campaigns_data=campaigns_data
        )

        report_entity = Report(
            campaign_id=campaign_id or (campaigns[0].id if campaigns else None),
            title=report_schema.title,
            reporting_period=report_schema.reporting_period,
            narrative_summary=report_schema.narrative_summary,
            cross_platform_analysis=report_schema.cross_platform_analysis,
            evidence_citations=report_schema.evidence_citations,
            strategic_recommendations=report_schema.strategic_recommendations,
            created_at=utcnow()
        )
        db.add(report_entity)
        await db.commit()
        await db.refresh(report_entity)
        logger.info(f"Generated Weekly Report: {report_entity.id} - {report_entity.title}")
        return report_entity

    @classmethod
    async def get_feedback_insights_for_next_brief(
        cls,
        db: AsyncSession,
        limit: int = 5
    ) -> List[Insight]:
        """
        The Closed Loop Feedback Engine (Phase 18):
        Retrieves top actionable recommendations from past campaigns
        to be displayed in the UI and automatically injected into new brief creation!
        """
        stmt = (
            select(Insight)
            .order_by(Insight.created_at.desc())
            .limit(limit)
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())
