import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.db.session import Base
from app.models.entities import Campaign, GenerationRun, PlatformPost, Asset, Metric, Insight
from app.models.enums import PostStatus, Language
from app.schemas.analytics import MetricCreate
from app.services.analytics import AnalyticsService
from app.services.intelligence import ContentIntelligenceService

@pytest.fixture
async def async_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session

    await engine.dispose()

@pytest.mark.asyncio
async def test_analytics_ingestion_and_like_for_like_comparison(async_db: AsyncSession):
    # 1. Create campaign with 3 platform posts
    campaign = Campaign(title="Cross-Platform Test", brief="Testing cross-platform comparison")
    async_db.add(campaign)
    await async_db.flush()

    run = GenerationRun(campaign_id=campaign.id, brief_snapshot=campaign.brief)
    async_db.add(run)
    await async_db.flush()

    ig_post = PlatformPost(
        campaign_id=campaign.id, generation_run_id=run.id,
        platform="instagram", language=Language.BENGALI.value,
        copy_primary="Instagram caption", cta="Visit", hashtags=["hoichoi"]
    )
    yt_post = PlatformPost(
        campaign_id=campaign.id, generation_run_id=run.id,
        platform="youtube", language=Language.BENGALI.value,
        copy_primary="YouTube description", cta="Subscribe", hashtags=["hoichoi"],
        title="YouTube Teaser Title"
    )
    x_post = PlatformPost(
        campaign_id=campaign.id, generation_run_id=run.id,
        platform="x_twitter", language=Language.BENGALI.value,
        copy_primary="X tweet", cta="Reply", hashtags=["hoichoi"]
    )
    async_db.add_all([ig_post, yt_post, x_post])
    await async_db.commit()

    # 2. Ingest metrics
    m1 = await AnalyticsService.ingest_metric(async_db, MetricCreate(
        post_id=ig_post.id, impressions=10000, reach=8000, likes=600, comments=100, shares=50, clicks=150
    ))
    m2 = await AnalyticsService.ingest_metric(async_db, MetricCreate(
        post_id=yt_post.id, impressions=20000, reach=15000, likes=1200, comments=200, shares=80, clicks=300
    ))
    # Engagement rate: ((600+100+50+150)/10000)*100 = 9.0%
    assert m1.engagement_rate == 9.0

    # 3. Like-for-like comparison
    comp = await AnalyticsService.get_like_for_like_comparison(async_db, campaign.id)
    assert comp.campaign_id == campaign.id
    assert len(comp.posts) == 3
    assert comp.winning_platform_by_engagement in ("instagram", "youtube")

    # 4. Evidence-backed AI insights
    insights = await ContentIntelligenceService.generate_campaign_insights(async_db, campaign.id)
    assert len(insights) >= 1
    for ins in insights:
        assert len(ins.evidence_post_ids) > 0 # Must cite evidence post IDs!
        assert ins.recommendation_for_next_brief != "" # Closed loop action item!

    # 5. Closed-loop feedback retrieval for next brief
    feedbacks = await ContentIntelligenceService.get_feedback_insights_for_next_brief(async_db, limit=5)
    assert len(feedbacks) >= 1
    assert feedbacks[0].recommendation_for_next_brief != ""
