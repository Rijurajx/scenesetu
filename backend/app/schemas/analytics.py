from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class MetricCreate(BaseModel):
    post_id: str = Field(..., description="Target platform post ID")
    impressions: int = Field(..., ge=0)
    reach: int = Field(..., ge=0)
    likes: int = Field(..., ge=0)
    comments: int = Field(..., ge=0)
    shares: int = Field(..., ge=0)
    clicks: int = Field(..., ge=0)
    video_views: Optional[int] = Field(0, ge=0)
    watch_time_seconds: Optional[float] = Field(0.0, ge=0)

class MetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campaign_id: str
    post_id: str
    platform: str
    impressions: int
    reach: int
    likes: int
    comments: int
    shares: int
    clicks: int
    video_views: Optional[int] = 0
    watch_time_seconds: Optional[float] = 0.0
    engagement_rate: float
    recorded_at: datetime

class LikeForLikePostComparison(BaseModel):
    post_id: str
    platform: str
    copy_snippet: str
    visual_aspect_ratio: Optional[str] = None
    media_url: Optional[str] = None
    status: str
    metrics: Optional[MetricResponse] = None

class LikeForLikeComparisonResponse(BaseModel):
    campaign_id: str
    campaign_title: str
    concept_theme: str
    posts: List[LikeForLikePostComparison]
    winning_platform_by_engagement: Optional[str] = None
    comparison_summary: str

class InsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campaign_id: str
    title: str
    summary: str
    category: str
    evidence_post_ids: List[str]
    metrics_evidence: Optional[Dict[str, Any]] = None
    recommendation_for_next_brief: str
    is_applied_to_future_brief: bool
    created_at: datetime

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campaign_id: Optional[str] = None
    title: str
    reporting_period: str
    narrative_summary: str
    cross_platform_analysis: Optional[Dict[str, Any]] = None
    evidence_citations: Optional[List[Dict[str, Any]]] = None
    strategic_recommendations: Optional[List[str]] = None
    created_at: datetime
