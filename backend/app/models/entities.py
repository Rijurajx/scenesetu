import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any
from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from app.models.enums import (
    PlatformType, AssetType, Language, GenerationRunStatus,
    PostStatus, ValidationStatus, ApprovalDecision, ScheduleStatus, PublicationStatus
)

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def generate_uuid() -> str:
    return str(uuid.uuid4())


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    brief: Mapped[str] = mapped_column(Text, nullable=False)
    target_audience: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_objectives: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    primary_language: Mapped[str] = mapped_column(String(50), default=Language.BILINGUAL.value)
    prior_insight_ids: Mapped[Optional[Any]] = mapped_column(JSON, default=list) # Cites insights consumed
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    generation_runs: Mapped[List["GenerationRun"]] = relationship("GenerationRun", back_populates="campaign", cascade="all, delete-orphan")
    posts: Mapped[List["PlatformPost"]] = relationship("PlatformPost", back_populates="campaign", cascade="all, delete-orphan")
    metrics: Mapped[List["Metric"]] = relationship("Metric", back_populates="campaign", cascade="all, delete-orphan")
    insights: Mapped[List["Insight"]] = relationship("Insight", back_populates="campaign", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="campaign")


class GenerationRun(Base):
    __tablename__ = "generation_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    campaign_id: Mapped[str] = mapped_column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    run_number: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(50), default=GenerationRunStatus.PENDING.value)
    brief_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    strategy_payload: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="generation_runs")
    assets: Mapped[List["Asset"]] = relationship("Asset", back_populates="generation_run", cascade="all, delete-orphan")
    posts: Mapped[List["PlatformPost"]] = relationship("PlatformPost", back_populates="generation_run", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    generation_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("generation_runs.id", ondelete="CASCADE"), nullable=False)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(50), default=AssetType.IMAGE.value)
    provider: Mapped[str] = mapped_column(String(100), default="pixazo")
    model_name: Mapped[str] = mapped_column(String(100), default="flux-schnell")
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    negative_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    public_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    aspect_ratio: Mapped[str] = mapped_column(String(20), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    mime_type: Mapped[str] = mapped_column(String(100), default="image/png")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    generation_run: Mapped["GenerationRun"] = relationship("GenerationRun", back_populates="assets")
    posts: Mapped[List["PlatformPost"]] = relationship("PlatformPost", back_populates="asset")


class PlatformPost(Base):
    __tablename__ = "platform_posts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    campaign_id: Mapped[str] = mapped_column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    generation_run_id: Mapped[str] = mapped_column(String(36), ForeignKey("generation_runs.id", ondelete="CASCADE"), nullable=False)
    asset_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    parent_post_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("platform_posts.id", ondelete="SET NULL"), nullable=True)

    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    language: Mapped[str] = mapped_column(String(50), default=Language.BENGALI.value)
    
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    copy_primary: Mapped[str] = mapped_column(Text, nullable=False) # Natively generated text
    copy_secondary: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Optional secondary language
    hashtags: Mapped[Any] = mapped_column(JSON, default=list)
    cta: Mapped[str] = mapped_column(String(500), nullable=False)

    status: Mapped[str] = mapped_column(String(50), default=PostStatus.DRAFT.value)
    iteration_number: Mapped[int] = mapped_column(Integer, default=1)
    refinement_instruction: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="posts")
    generation_run: Mapped["GenerationRun"] = relationship("GenerationRun", back_populates="posts")
    asset: Mapped[Optional["Asset"]] = relationship("Asset", back_populates="posts")
    validation_results: Mapped[List["ValidationResult"]] = relationship("ValidationResult", back_populates="post", cascade="all, delete-orphan")
    approvals: Mapped[List["Approval"]] = relationship("Approval", back_populates="post", cascade="all, delete-orphan")
    schedule: Mapped[Optional["Schedule"]] = relationship("Schedule", back_populates="post", uselist=False, cascade="all, delete-orphan")
    publication: Mapped[Optional["Publication"]] = relationship("Publication", back_populates="post", uselist=False, cascade="all, delete-orphan")
    metrics: Mapped[List["Metric"]] = relationship("Metric", back_populates="post", cascade="all, delete-orphan")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    post_id: Mapped[str] = mapped_column(String(36), ForeignKey("platform_posts.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # passed or failed
    rules_checked: Mapped[Any] = mapped_column(JSON, default=list) # [{rule, passed, actual, expected, message}]
    error_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    validated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    post: Mapped["PlatformPost"] = relationship("PlatformPost", back_populates="validation_results")


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    post_id: Mapped[str] = mapped_column(String(36), ForeignKey("platform_posts.id", ondelete="CASCADE"), nullable=False)
    decision: Mapped[str] = mapped_column(String(50), nullable=False) # approved or rejected
    reviewer_name: Mapped[str] = mapped_column(String(100), default="human_operator")
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    post: Mapped["PlatformPost"] = relationship("PlatformPost", back_populates="approvals")


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    post_id: Mapped[str] = mapped_column(String(36), ForeignKey("platform_posts.id", ondelete="CASCADE"), unique=True, nullable=False)
    scheduled_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=ScheduleStatus.SCHEDULED.value)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    post: Mapped["PlatformPost"] = relationship("PlatformPost", back_populates="schedule")


class Publication(Base):
    __tablename__ = "publications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    post_id: Mapped[str] = mapped_column(String(36), ForeignKey("platform_posts.id", ondelete="CASCADE"), unique=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default=PublicationStatus.PUBLISHED.value)
    external_post_id: Mapped[str] = mapped_column(String(255), nullable=False)
    external_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    payload_snapshot: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    post: Mapped["PlatformPost"] = relationship("PlatformPost", back_populates="publication")


class Metric(Base):
    __tablename__ = "metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    campaign_id: Mapped[str] = mapped_column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    post_id: Mapped[str] = mapped_column(String(36), ForeignKey("platform_posts.id", ondelete="CASCADE"), nullable=False)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    
    impressions: Mapped[int] = mapped_column(Integer, default=0)
    reach: Mapped[int] = mapped_column(Integer, default=0)
    likes: Mapped[int] = mapped_column(Integer, default=0)
    comments: Mapped[int] = mapped_column(Integer, default=0)
    shares: Mapped[int] = mapped_column(Integer, default=0)
    clicks: Mapped[int] = mapped_column(Integer, default=0)
    video_views: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=0)
    watch_time_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0.0)
    engagement_rate: Mapped[float] = mapped_column(Float, default=0.0)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="metrics")
    post: Mapped["PlatformPost"] = relationship("PlatformPost", back_populates="metrics")


class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    campaign_id: Mapped[str] = mapped_column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="creative_strategy")
    
    # Evidence traceability: EXACT post IDs and concrete numbers
    evidence_post_ids: Mapped[Any] = mapped_column(JSON, default=list) # List[str]
    metrics_evidence: Mapped[Optional[Any]] = mapped_column(JSON, default=dict)
    
    # The Closed Loop: Recommendations fed into next brief
    recommendation_for_next_brief: Mapped[str] = mapped_column(Text, nullable=False)
    is_applied_to_future_brief: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="insights")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    campaign_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    reporting_period: Mapped[str] = mapped_column(String(100), nullable=False)
    narrative_summary: Mapped[str] = mapped_column(Text, nullable=False)
    cross_platform_analysis: Mapped[Optional[Any]] = mapped_column(JSON, default=dict)
    evidence_citations: Mapped[Optional[Any]] = mapped_column(JSON, default=list) # mappings of claims -> [post_ids, metrics]
    strategic_recommendations: Mapped[Optional[Any]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    # Relationships
    campaign: Mapped[Optional["Campaign"]] = relationship("Campaign", back_populates="reports")
