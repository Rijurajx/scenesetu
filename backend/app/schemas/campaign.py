from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import Language
from app.schemas.post import PlatformPostResponse

class CampaignCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Campaign title")
    brief: str = Field(..., min_length=10, description="The content brief in English or Bengali")
    target_audience: Optional[str] = Field(None, description="Target demographic, audience context")
    key_objectives: Optional[str] = Field(None, description="Primary campaign goals")
    primary_language: Language = Field(Language.BILINGUAL, description="Language preference: Bengali, English, or Bilingual")
    prior_insight_ids: Optional[List[str]] = Field(default_factory=list, description="IDs of past insights to incorporate into generation")

class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    brief: str
    target_audience: Optional[str] = None
    key_objectives: Optional[str] = None
    primary_language: str
    prior_insight_ids: Optional[List[str]] = []
    status: str
    created_at: datetime
    updated_at: datetime
    posts: Optional[List[PlatformPostResponse]] = []
