from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.ai import (
    FullGenerationPlanSchema, RefinePostPromptSchema,
    AIInsightSchema, AIReportSchema
)

class GeneratedVisualResult(BaseModel):
    provider: str
    model_name: str
    prompt: str
    negative_prompt: Optional[str] = None
    media_url: str
    width: int
    height: int
    aspect_ratio: str
    file_size_bytes: int
    mime_type: str
    raw_response: Optional[Dict[str, Any]] = None

class LLMProvider(ABC):
    @abstractmethod
    async def generate_campaign_plan(
        self,
        brief: str,
        primary_language: str = "bilingual",
        target_audience: Optional[str] = None,
        key_objectives: Optional[str] = None,
        prior_insights: Optional[List[Dict[str, Any]]] = None
    ) -> FullGenerationPlanSchema:
        """Generates campaign strategy and 3 distinct platform adaptations (native Bengali + English)."""
        pass

    @abstractmethod
    async def refine_post(
        self,
        platform: str,
        original_copy: str,
        original_prompt: str,
        human_feedback: str
    ) -> RefinePostPromptSchema:
        """Refines a post based on explicit human feedback."""
        pass

    @abstractmethod
    async def generate_insights_from_metrics(
        self,
        campaign_title: str,
        posts_with_metrics: List[Dict[str, Any]]
    ) -> List[AIInsightSchema]:
        """Synthesizes evidence-backed insights citing post IDs and numbers."""
        pass

    @abstractmethod
    async def generate_weekly_report(
        self,
        reporting_period: str,
        campaigns_data: List[Dict[str, Any]]
    ) -> AIReportSchema:
        """Generates structured weekly report with post ID evidence citations."""
        pass


class VisualProvider(ABC):
    @abstractmethod
    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        negative_prompt: Optional[str] = None
    ) -> GeneratedVisualResult:
        """Generates visual asset using hosted image generation API."""
        pass
