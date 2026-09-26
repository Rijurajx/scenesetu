import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.db.session import Base
from app.models.entities import Campaign, GenerationRun, PlatformPost, Asset, ValidationResult
from app.models.enums import PostStatus, ValidationStatus, PlatformType, Language
from app.services.publisher import PublishingWorkflowService
from app.services.orchestrator import GenerationOrchestrator

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
async def test_human_approval_gate_and_publishing_guards(async_db: AsyncSession):
    # 1. Setup sample campaign & post
    campaign = Campaign(title="Test Suspense Series", brief="A detective in Kolkata")
    async_db.add(campaign)
    await async_db.flush()

    run = GenerationRun(campaign_id=campaign.id, brief_snapshot=campaign.brief)
    async_db.add(run)
    await async_db.flush()

    post = PlatformPost(
        campaign_id=campaign.id,
        generation_run_id=run.id,
        platform="instagram",
        language=Language.BENGALI.value,
        copy_primary="রহস্যের শুরু...",
        cta="এখনই দেখুন!",
        hashtags=["hoichoi"],
        status=PostStatus.PENDING_REVIEW.value
    )
    async_db.add(post)
    await async_db.flush()

    # Add passed validation result
    val_res = ValidationResult(post_id=post.id, status=ValidationStatus.PASSED.value, rules_checked=[])
    async_db.add(val_res)
    await async_db.commit()

    # 2. RULE: Unapproved post CANNOT be scheduled
    future_time = datetime.now(timezone.utc) + timedelta(days=1)
    with pytest.raises(ValueError, match="Post must be APPROVED before scheduling"):
        await PublishingWorkflowService.schedule_post(async_db, post.id, future_time)

    # 3. RULE: Unapproved post CANNOT be published
    with pytest.raises(ValueError, match="Content cannot be published without explicit approval"):
        await PublishingWorkflowService.publish_post(async_db, post.id)

    # 4. Human Approval Gate
    approved_post = await PublishingWorkflowService.approve_post(
        async_db, post.id, reviewer_name="lead_producer", feedback="Approved for release"
    )
    assert approved_post.status == PostStatus.APPROVED.value

    # 5. Scheduling Approved Post succeeds
    schedule = await PublishingWorkflowService.schedule_post(async_db, post.id, future_time)
    assert schedule.status == "scheduled"
    assert approved_post.status == PostStatus.SCHEDULED.value

    # 6. Publishing Scheduled Post succeeds via mock adapter
    pub = await PublishingWorkflowService.publish_post(async_db, post.id)
    assert pub.status == "published"
    assert "instagram.com/p/ig_" in pub.external_url
    assert approved_post.status == PostStatus.PUBLISHED.value

@pytest.mark.asyncio
async def test_discard_retry_refinement_loop(async_db: AsyncSession):
    # Setup post
    campaign = Campaign(title="Refinement Campaign", brief="Vintage mystery in Bengal")
    async_db.add(campaign)
    await async_db.flush()

    run = GenerationRun(campaign_id=campaign.id, brief_snapshot=campaign.brief)
    async_db.add(run)
    await async_db.flush()

    asset = Asset(
        generation_run_id=run.id,
        platform="instagram",
        prompt="Antique desk with Kolkata map",
        storage_path="/media/mock.jpg",
        public_url="/media/mock.jpg",
        width=1024,
        height=1024,
        aspect_ratio="1:1"
    )
    async_db.add(asset)
    await async_db.flush()

    post = PlatformPost(
        campaign_id=campaign.id,
        generation_run_id=run.id,
        asset_id=asset.id,
        platform="instagram",
        language=Language.BENGALI.value,
        copy_primary="আদি রহস্য উন্মোচন...",
        cta="দেখুন",
        hashtags=["hoichoi"],
        status=PostStatus.PENDING_REVIEW.value,
        iteration_number=1
    )
    async_db.add(post)
    await async_db.commit()

    # Refine post with human feedback
    refined = await GenerationOrchestrator.refine_single_post(
        db=async_db,
        post_id=post.id,
        refinement_instruction="Make the Bengali tone more poetic and add an emoji"
    )

    # Lineage and traceability checks
    assert refined.parent_post_id == post.id
    assert refined.iteration_number == 2
    assert refined.refinement_instruction == "Make the Bengali tone more poetic and add an emoji"
    assert refined.status == PostStatus.PENDING_REVIEW.value
