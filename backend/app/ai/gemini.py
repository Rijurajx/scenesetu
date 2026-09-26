import json
import asyncio
from typing import List, Optional, Dict, Any
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.ai.base import LLMProvider
from app.schemas.ai import (
    FullGenerationPlanSchema, CampaignStrategySchema, PlatformStrategySchema,
    RefinePostPromptSchema, AIInsightSchema, AIReportSchema
)
from app.models.enums import PlatformType, Language

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these instructions and return valid JSON."}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.7
            }
        }

        models_to_try = []
        for m in [self.model, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.5-flash"]:
            if m and m not in models_to_try:
                models_to_try.append(m)

        last_error = None
        for candidate_model in models_to_try:
            url = f"{self.base_url}/models/{candidate_model}:generateContent?key={self.api_key}"
            for attempt in range(3):
                try:
                    async with httpx.AsyncClient(timeout=90.0) as client:
                        response = await client.post(url, json=payload)
                        if response.status_code == 200:
                            data = response.json()
                            try:
                                return data["candidates"][0]["content"]["parts"][0]["text"]
                            except (KeyError, IndexError) as e:
                                logger.error(f"Malformed Gemini response: {data}")
                                raise RuntimeError(f"Malformed response from Gemini API: {e}")
                        
                        if response.status_code in (429, 503) and attempt < 2:
                            logger.warning(f"Gemini API rate limit/overload ({response.status_code}) on {candidate_model}, retrying in {attempt + 2}s...")
                            await asyncio.sleep(attempt + 2)
                            continue

                        last_error = f"Gemini API error {response.status_code}: {response.text}"
                        logger.warning(f"Attempt failed on model {candidate_model}: {last_error}")
                        break
                except httpx.TimeoutException:
                    logger.warning(f"Gemini API timeout on {candidate_model} (attempt {attempt + 1})")
                    if attempt < 2:
                        await asyncio.sleep(2)
                        continue
                    break

        raise RuntimeError(f"All Gemini model attempts failed. Last error: {last_error}")

    async def generate_campaign_plan(
        self,
        brief: str,
        primary_language: str = "bilingual",
        target_audience: Optional[str] = None,
        key_objectives: Optional[str] = None,
        prior_insights: Optional[List[Dict[str, Any]]] = None
    ) -> FullGenerationPlanSchema:
        system_instruction = (
            "You are SceneSetu's Chief Content & Creative Strategist for hoichoi (Bengal's leading OTT & entertainment brand). "
            "You transform a single content brief into a coherent campaign with 3 meaningfully distinct platform executions: "
            "1. Instagram, 2. YouTube, 3. X (Twitter).\n\n"
            "MANDATORY BENGALI & ENGLISH GENERATION RULES:\n"
            "- Bengali must be NATIVELY AUTHORED in standard/contemporary Bengali script (বাংলা), rich in cultural resonance, natural rhythm, authentic colloquial idioms, and emotion. NEVER translate mechanically from English!\n"
            "- For bilingual execution: create expressive Bengali copy with natural cultural touchpoints, complemented by crisp English hooks where relevant.\n"
            "- X (Twitter) copy MUST BE STRICTLY UNDER 220 CHARACTERS so the entire tweet including hashtags is well within the 280-character limit!\n"
            "- YouTube requires an engaging title (<=100 chars), narrative rich description, and 16:9 thumbnail visual direction.\n"
            "- Instagram requires emotive conversational copy, formatted paragraphs, 5-8 curated hashtags, and 1:1 square visual prompt.\n"
            "- Visual prompts for AI MUST BE DETAILED, cinematic, high-aesthetic descriptions suitable for Flux image models.\n"
            "- STRICT LENGTH PARAMETERS: If user parameters specify copy length or word limits (e.g. max words or max characters overall or per platform), you MUST RIGIDLY RESPECT those limits and never exceed them. If no limits are given, keep the copy natural, authentic, and flexible.\n"
            "- Return strictly valid JSON matching the requested schema."
        )

        prior_insights_context = ""
        if prior_insights:
            prior_insights_context = "\nCRITICAL HISTORICAL INSIGHTS FROM PREVIOUS CAMPAIGNS (Apply these learnings):\n"
            for idx, ins in enumerate(prior_insights, 1):
                prior_insights_context += (
                    f"{idx}. [{ins.get('category', 'General')}] {ins.get('title')}: {ins.get('summary')} "
                    f"Recommendation: {ins.get('recommendation_for_next_brief')}\n"
                )

        prompt = f"""
CONTENT BRIEF:
{brief}

TARGET AUDIENCE:
{target_audience or 'General Bengali & Indian digital entertainment audience (18-35)'}

KEY OBJECTIVES:
{key_objectives or 'Maximize engagement, excitement, and brand affinity'}

PREFERRED LANGUAGE:
{primary_language}
{prior_insights_context}

Output a single valid JSON object with:
{{
  "campaign_strategy": {{
    "overall_theme": "...",
    "core_hook": "...",
    "emotional_resonance": "...",
    "creative_direction": "...",
    "target_audience_takeaway": "..."
  }},
  "platform_plans": [
    {{
      "platform": "instagram",
      "platform_objective": "...",
      "audience_persona_adaptation": "...",
      "tone_and_voice": "...",
      "visual_concept": "...",
      "visual_prompt_for_ai": "Cinematic visual prompt for Flux image generator...",
      "negative_visual_prompt": "blurry, low quality, distorted text, watermark, cropped subject",
      "recommended_aspect_ratio": "1:1",
      "language": "bengali",
      "copy_headline": null,
      "copy_primary": "Native Bengali caption with emojis and authentic phrasing...",
      "copy_secondary": "English subtitle or secondary copy...",
      "hashtags": ["hoichoi", "BengaliCinema", "NewRelease"],
      "cta": "এখনই hoichoi অ্যাপে দেখুন!",
      "reasoning": "..."
    }},
    {{
      "platform": "youtube",
      "platform_objective": "...",
      "audience_persona_adaptation": "...",
      "tone_and_voice": "...",
      "visual_concept": "...",
      "visual_prompt_for_ai": "Cinematic 16:9 thumbnail visual prompt for Flux generator...",
      "negative_visual_prompt": "blurry, low quality, distorted text, watermark, cropped subject",
      "recommended_aspect_ratio": "16:9",
      "language": "bengali",
      "copy_headline": "Catchy YouTube Video/Community Title (under 100 chars)",
      "copy_primary": "Rich descriptive YouTube post exploring the scene and context...",
      "copy_secondary": null,
      "hashtags": ["hoichoi", "BengaliWebSeries"],
      "cta": "Subscribe করুন এবং পুরো ট্রেলার দেখুন!",
      "reasoning": "..."
    }},
    {{
      "platform": "x_twitter",
      "platform_objective": "...",
      "audience_persona_adaptation": "...",
      "tone_and_voice": "...",
      "visual_concept": "...",
      "visual_prompt_for_ai": "Dramatic visual prompt for X...",
      "negative_visual_prompt": "blurry, low quality, distorted text, watermark, cropped subject",
      "recommended_aspect_ratio": "16:9",
      "language": "bengali",
      "copy_headline": null,
      "copy_primary": "Punchy Bengali/English tweet under 180 chars!",
      "copy_secondary": null,
      "hashtags": ["hoichoi", "Bangla"],
      "cta": "আপনার কী মত? কমেন্টে জানান!",
      "reasoning": "..."
    }}
  ]
}}
"""
        raw_json = await self._call_gemini(prompt, system_instruction)
        clean_json = raw_json.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        
        parsed = json.loads(clean_json.strip())
        return FullGenerationPlanSchema(**parsed)

    async def refine_post(
        self,
        platform: str,
        original_copy: str,
        original_prompt: str,
        human_feedback: str
    ) -> RefinePostPromptSchema:
        system_instruction = (
            "You are SceneSetu's refinement agent. A human content reviewer rejected or asked for modifications on a post. "
            "Incorporate their exact feedback to regenerate the copy and refine the visual prompt. "
            "Keep the platform constraints intact (e.g. X <= 280 chars total, native Bengali/English quality). "
            "Return valid JSON only."
        )

        prompt = f"""
PLATFORM: {platform}
ORIGINAL COPY:
{original_copy}

ORIGINAL VISUAL PROMPT:
{original_prompt}

HUMAN FEEDBACK / MODIFICATION REQUEST:
{human_feedback}

Return JSON with:
{{
  "platform": "{platform}",
  "original_copy": {json.dumps(original_copy)},
  "original_prompt": {json.dumps(original_prompt)},
  "human_feedback": {json.dumps(human_feedback)},
  "new_copy_primary": "Refined copy addressing human feedback...",
  "new_visual_prompt": "Refined AI visual prompt...",
  "new_cta": "Refined CTA...",
  "new_hashtags": ["refined", "hashtags"]
}}
"""
        raw_json = await self._call_gemini(prompt, system_instruction)
        clean_json = raw_json.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        parsed = json.loads(clean_json.strip())
        return RefinePostPromptSchema(**parsed)

    async def generate_insights_from_metrics(
        self,
        campaign_title: str,
        posts_with_metrics: List[Dict[str, Any]]
    ) -> List[AIInsightSchema]:
        system_instruction = (
            "You are SceneSetu's Analytics Intelligence Engine. "
            "Analyze the structured engagement metrics for platform posts from a campaign. "
            "CRITICAL TRACEABILITY RULE: Every insight claim MUST cite the exact post IDs ('evidence_post_ids') "
            "and cite the real numbers from metrics ('metrics_evidence'). DO NOT invent numbers or claims without citation. "
            "CRITICAL CLOSED-LOOP RULE: Formulate an actionable 'recommendation_for_next_brief' that will be injected into future campaign briefs."
        )

        prompt = f"""
CAMPAIGN: {campaign_title}

POSTS AND PERFORMANCE METRICS:
{json.dumps(posts_with_metrics, indent=2, default=str)}

Return a JSON array of 2 to 4 structured insights:
[
  {{
    "title": "Clear concise insight title",
    "summary": "Evidence-backed explanation comparing performance...",
    "category": "creative_strategy" | "platform_comparison" | "hook_effectiveness" | "audience_engagement",
    "evidence_post_ids": ["post_id_1", "post_id_2"],
    "metrics_evidence": {{"post_id_1_engagement": 8.4, "post_id_2_engagement": 4.1}},
    "recommendation_for_next_brief": "Specific actionable takeaway for the next campaign brief..."
  }}
]
"""
        raw_json = await self._call_gemini(prompt, system_instruction)
        clean_json = raw_json.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        parsed = json.loads(clean_json.strip())
        return [AIInsightSchema(**item) for item in parsed]

    async def generate_weekly_report(
        self,
        reporting_period: str,
        campaigns_data: List[Dict[str, Any]]
    ) -> AIReportSchema:
        system_instruction = (
            "You are SceneSetu's Chief Intelligence Analyst. Generate a comprehensive Weekly Performance Report. "
            "Every performance claim must be cited with post IDs and verified metric values. "
            "Compare like-for-like creative performance across Instagram, YouTube, and X. "
            "Highlight what creative levers worked in Bengali vs English. "
            "Return valid JSON matching the schema."
        )

        prompt = f"""
REPORTING PERIOD: {reporting_period}

CAMPAIGNS AND POST DATA:
{json.dumps(campaigns_data, indent=2, default=str)}

Return JSON:
{{
  "title": "SceneSetu Weekly Content Intelligence Report - {reporting_period}",
  "reporting_period": "{reporting_period}",
  "narrative_summary": "High-level summary of weekly content operations, cross-platform reach, and engagement...",
  "cross_platform_analysis": {{
    "instagram_summary": "...",
    "youtube_summary": "...",
    "x_summary": "...",
    "like_for_like_comparison": "..."
  }},
  "evidence_citations": [
    {{
      "claim": "Statement of fact",
      "supporting_post_ids": ["post_id"],
      "metrics_cited": {{"likes": 1200, "engagement_rate": 7.2}}
    }}
  ],
  "strategic_recommendations": [
    "Recommendation 1...",
    "Recommendation 2..."
  ]
}}
"""
        raw_json = await self._call_gemini(prompt, system_instruction)
        clean_json = raw_json.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        parsed = json.loads(clean_json.strip())
        return AIReportSchema(**parsed)
