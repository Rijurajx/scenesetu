from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict

class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    platform: str
    asset_type: str
    provider: str
    model_name: str
    prompt: str
    public_url: str
    width: int
    height: int
    aspect_ratio: str
    file_size_bytes: int
    mime_type: str
    created_at: datetime

class ValidationRuleCheck(BaseModel):
    rule: str
    passed: bool
    message: str
    expected: Any
    actual: Any

class ValidationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    post_id: str
    status: str
    rules_checked: List[ValidationRuleCheck]
    error_summary: Optional[str] = None
    validated_at: datetime

class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    post_id: str
    decision: str
    reviewer_name: str
    feedback: Optional[str] = None
    reviewed_at: datetime

class ApprovalActionRequest(BaseModel):
    reviewer_name: str = Field("human_operator", description="Name/role of reviewer")
    feedback: Optional[str] = Field(None, description="Optional feedback or rejection reason")

class ScheduleRequest(BaseModel):
    scheduled_time: datetime = Field(..., description="UTC ISO timestamp when content should be published")

class ScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    post_id: str
    scheduled_time: datetime
    status: str
    created_at: datetime

class PublicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    post_id: str
    platform: str
    status: str
    external_post_id: str
    external_url: str
    published_at: datetime

class RefinePostRequest(BaseModel):
    refinement_instruction: str = Field(..., min_length=3, description="Human instruction on how to refine/regenerate this post")

class PlatformPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campaign_id: str
    generation_run_id: str
    asset_id: Optional[str] = None
    parent_post_id: Optional[str] = None
    platform: str
    language: str
    title: Optional[str] = None
    copy_primary: str
    copy_secondary: Optional[str] = None
    hashtags: List[str] = []
    cta: str
    status: str
    iteration_number: int
    refinement_instruction: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    asset: Optional[AssetResponse] = None
    validation_results: List[ValidationResponse] = []
    approvals: List[ApprovalResponse] = []
    schedule: Optional[ScheduleResponse] = None
    publication: Optional[PublicationResponse] = None
