from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, ConfigDict

class GenerationTriggerRequest(BaseModel):
    refinement_instruction: Optional[str] = Field(None, description="Optional refinement direction when regenerating")
    prior_insight_ids: Optional[list[str]] = Field(None, description="Explicit past insight IDs to feed into this generation")

class GenerationRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    campaign_id: str
    run_number: int
    status: str
    brief_snapshot: str
    strategy_payload: Optional[Any] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
