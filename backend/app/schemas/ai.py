from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import PlatformType, Language

class CampaignStrategySchema(BaseModel):
    overall_theme: str = Field(..., description="Central creative theme connecting all platforms")
    core_hook: str = Field(..., description="The main attention-grabbing concept")
    emotional_resonance: str = Field(..., description="Target emotional tone (e.g. nostalgic, thrilling, celebratory)")
    creative_direction: str = Field(..., description="High-level creative narrative guiding copy and visuals")
    target_audience_takeaway: str = Field(..., description="Key message the audience must remember")

class PlatformStrategySchema(BaseModel):
    platform: PlatformType = Field(..., description="Target channel: instagram, youtube, or x_twitter")
    platform_objective: str = Field(..., description="Platform-specific goal (e.g., discovery, community discussion, viral share)")
    audience_persona_adaptation: str = Field(..., description="How this channel's demographic is specifically addressed")
    tone_and_voice: str = Field(..., description="Tailored voice (e.g. conversational Bengali, punchy hook, cinematic)")
    visual_concept: str = Field(..., description="Detailed description of the visual scene to be rendered")
    visual_prompt_for_ai: str = Field(..., description="Production-ready prompt tailored for AI image generation (Pixazo/Flux)")
    negative_visual_prompt: Optional[str] = Field("blurry, low quality, distorted text, watermark, cropped subject", description="Negative prompt")
    recommended_aspect_ratio: str = Field("1:1", description="Platform compliant aspect ratio: 1:1 for Instagram, 16:9 for YouTube, 16:9 or 1:1 for X")
    
    # NATIVE LANGUAGE REQUIREMENT: Native Bengali or Native English, never mechanical translation
    language: Language = Field(Language.BENGALI, description="Native generation language")
    copy_headline: Optional[str] = Field(None, description="Optional catchy title or headline (e.g., YouTube title)")
    copy_primary: str = Field(..., description="Natively generated social copy with cultural nuance, slang, and rhythm")
    copy_secondary: Optional[str] = Field(None, description="Optional secondary text or translation reference if requested")
    hashtags: List[str] = Field(default_factory=list, description="Platform-appropriate hashtags respecting platform conventions")
    cta: str = Field(..., description="Channel-tailored Call To Action")
    reasoning: Optional[str] = Field(None, description="Why this content is uniquely suited to this platform")

class FullGenerationPlanSchema(BaseModel):
    campaign_strategy: CampaignStrategySchema
    platform_plans: List[PlatformStrategySchema]

class RefinePostPromptSchema(BaseModel):
    platform: PlatformType
    original_copy: str
    original_prompt: str
    human_feedback: str
    new_copy_primary: str
    new_visual_prompt: Optional[str] = None
    new_cta: Optional[str] = None
    new_hashtags: Optional[List[str]] = None

class AIInsightSchema(BaseModel):
    title: str
    summary: str
    category: str = "creative_strategy"
    evidence_post_ids: List[str] = Field(..., description="Traceable Post IDs supporting this exact insight")
    metrics_evidence: Dict[str, Any] = Field(..., description="Supporting performance metrics numbers")
    recommendation_for_next_brief: str = Field(..., description="Actionable instruction to inject into the next campaign brief")

class AIReportSchema(BaseModel):
    title: str
    reporting_period: str
    narrative_summary: str
    cross_platform_analysis: Dict[str, Any]
    evidence_citations: List[Dict[str, Any]] = Field(..., description="Every factual claim linked to post IDs and numbers")
    strategic_recommendations: List[str]
