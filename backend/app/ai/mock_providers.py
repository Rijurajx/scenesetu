from typing import List, Optional, Dict, Any
from app.ai.base import LLMProvider, VisualProvider, GeneratedVisualResult
from app.schemas.ai import (
    FullGenerationPlanSchema, CampaignStrategySchema, PlatformStrategySchema,
    RefinePostPromptSchema, AIInsightSchema, AIReportSchema
)
from app.models.enums import PlatformType, Language

class MockLLMProvider(LLMProvider):
    async def generate_campaign_plan(
        self,
        brief: str,
        primary_language: str = "bilingual",
        target_audience: Optional[str] = None,
        key_objectives: Optional[str] = None,
        prior_insights: Optional[List[Dict[str, Any]]] = None
    ) -> FullGenerationPlanSchema:
        campaign_strategy = CampaignStrategySchema(
            overall_theme="মহাপ্রলয়ের রহস্য (Mystery of the Ancient Cataclysm)",
            core_hook="যে সত্য শতাব্দীর পর শতাব্দী ধরে লুকিয়ে রাখা হয়েছিল, আজ তা প্রকাশ পাবে।",
            emotional_resonance="রহস্য, শিহরণ ও রোমাঞ্চ (Thrilling suspense and cinematic intrigue)",
            creative_direction="Cinematic dark noir aesthetics blended with rich Bengal heritage storytelling.",
            target_audience_takeaway="hoichoi is the ultimate destination for intelligent, culturally rooted thriller content."
        )

        instagram_plan = PlatformStrategySchema(
            platform=PlatformType.INSTAGRAM,
            platform_objective="Visual engagement, comment debates, and aesthetic reel/feed immersion",
            audience_persona_adaptation="Bengali youth and cinephiles who appreciate visual drama and mood",
            tone_and_voice="Intriguing, emotional, conversational Bengali with evocative metaphors",
            visual_concept="A misty twilight alley in North Kolkata, vintage streetlamp casting golden rim light on a shadowed detective.",
            visual_prompt_for_ai="Cinematic photography of an enigmatic detective in vintage Kolkata, misty rain, golden streetlamps, 8k resolution, photorealistic, dramatic film lighting",
            negative_visual_prompt="blurry, cartoon, low contrast, oversaturated",
            recommended_aspect_ratio="1:1",
            language=Language.BENGALI,
            copy_headline=None,
            copy_primary=(
                "রহস্য যেখানে শেষ হয়, সেখান থেকেই আসল গল্পের শুরু... 🌧️\n\n"
                "উত্তর কলকাতার পুরনো গলির প্রতিটি ধূলিকণায় লুকিয়ে আছে এক অজানা অতীত। "
                "আপনি কি প্রস্তুত সেই সত্যের মুখোমুখি হতে?\n\n"
                "hoichoi-এর আসন্ন অরিজিনাল সিরিজ খুব শীঘ্রই আসছে। চোখ রাখুন আমাদের পাতায়!"
            ),
            copy_secondary="The darkest secrets are buried where no one dares to look. Coming soon on hoichoi.",
            hashtags=["hoichoi", "BengaliOriginals", "KolkataNoir", "NewWebSeries", "BanglaThriller"],
            cta="কমেন্টে জানান, আপনি কি আসল রহস্যের সংকেত ধরতে পেরেছেন? 👇",
            reasoning="Instagram thrives on atmospheric visual mood and open-ended curiosity prompts."
        )

        youtube_plan = PlatformStrategySchema(
            platform=PlatformType.YOUTUBE,
            platform_objective="Deep viewer immersion, teaser click-through, and community discussion",
            audience_persona_adaptation="Content consumers looking for high production value and storyline hints",
            tone_and_voice="Cinematic, suspense-building, dramatic narrative pacing",
            visual_concept="Wide 16:9 cinematic shot of a detective entering an abandoned colonial mansion at dawn.",
            visual_prompt_for_ai="Wide cinematic 16:9 thumbnail, abandoned heritage colonial mansion in Bengal, heavy morning mist, dramatic light beam, anamorphic lens flare",
            negative_visual_prompt="blurry, pixelated, distorted perspective",
            recommended_aspect_ratio="16:9",
            language=Language.BENGALI,
            copy_headline="অরণ্যের প্রাচীন প্রবাদ | Official Teaser Announcement | hoichoi Originals",
            copy_primary=(
                "একটি বন্ধ দরজা, এক শতাব্দী প্রাচীন ডায়েরি, আর কিছু না-বলা কথা।\n\n"
                "যখন ইতিহাস আর বর্তমানের সীমারেখা মুছে যায়, তখন কাকে বিশ্বাস করবেন? "
                "hoichoi নিয়ে আসছে এই বছরের সবচেয়ে বহুপ্রতীক্ষিত রহস্য সিরিজ।\n\n"
                "পুরো ট্রেলার প্রকাশ পাবে আগামী শুক্রবার। এখনই চ্যানেল সাবস্ক্রাইব করে বেল আইকনটি প্রেস করে রাখুন!"
            ),
            copy_secondary=None,
            hashtags=["hoichoi", "BanglaCinema", "OfficialTeaser", "NewRelease"],
            cta="ভিডিওটি লাইক ও শেয়ার করুন এবং সাবস্ক্রাইব করে সঙ্গে থাকুন!",
            reasoning="YouTube demands a strong search-friendly title and narrative context in the description."
        )

        x_plan = PlatformStrategySchema(
            platform=PlatformType.X_TWITTER,
            platform_objective="Fast real-time speculation, quote tweets, and viral curiosity",
            audience_persona_adaptation="Active digital conversationalists and fast microbloggers",
            tone_and_voice="Crisp, sharp, cryptic, thought-provoking",
            visual_concept="A close-up of a vintage pocket watch stopped at 3:17 with a blood-stained cipher.",
            visual_prompt_for_ai="Macro photography of an antique pocket watch stopped at 3:17, old parchment cipher, moody chiaroscuro lighting, 8k",
            negative_visual_prompt="blurry, text, watermark",
            recommended_aspect_ratio="16:9",
            language=Language.BENGALI,
            copy_headline=None,
            # Strict short copy under 200 chars to guarantee <= 280 total with hashtags and CTA
            copy_primary="৩:১৭ মিনিটে ঘড়িটা থেমে গিয়েছিল কেন? সত্য কি আসলেই লুকিয়ে রাখা যায়? উত্তর আসছে খুব শীঘ্রই।",
            copy_secondary=None,
            hashtags=["hoichoi", "BanglaNoir"],
            cta="আপনার ধারণা কী? Quote Tweet করুন।",
            reasoning="Twitter requires punchy brevity under 280 chars to trigger instant quote discussions."
        )

        return FullGenerationPlanSchema(
            campaign_strategy=campaign_strategy,
            platform_plans=[instagram_plan, youtube_plan, x_plan]
        )

    async def refine_post(
        self,
        platform: str,
        original_copy: str,
        original_prompt: str,
        human_feedback: str
    ) -> RefinePostPromptSchema:
        return RefinePostPromptSchema(
            platform=PlatformType(platform),
            original_copy=original_copy,
            original_prompt=original_prompt,
            human_feedback=human_feedback,
            new_copy_primary=f"[পরিমার্জিত / Refined] {original_copy[:100]}... (সংশোধন: {human_feedback})",
            new_visual_prompt=f"{original_prompt}, modified according to: {human_feedback}",
            new_cta="নতুন আপডেট দেখতে এখনই hoichoi অ্যাপে যান!",
            new_hashtags=["hoichoi", "RefinedRelease", "Bangla"]
        )

    async def generate_insights_from_metrics(
        self,
        campaign_title: str,
        posts_with_metrics: List[Dict[str, Any]]
    ) -> List[AIInsightSchema]:
        post_ids = [p.get("id") or p.get("post_id") for p in posts_with_metrics]
        evidence_ids = [pid for pid in post_ids if pid][:2]
        
        return [
            AIInsightSchema(
                title="Conversational Bengali Hooks Outperformed English CTAs by 42%",
                summary="Posts utilizing native Bengali colloquial questions generated significantly higher comment velocity and saves than generic promotional announcements.",
                category="creative_strategy",
                evidence_post_ids=evidence_ids or ["mock_post_1", "mock_post_2"],
                metrics_evidence={"average_engagement_lift": "42%", "top_post_id": evidence_ids[0] if evidence_ids else "mock_1"},
                recommendation_for_next_brief="Prioritize native colloquial Bengali opening questions over declarative promotional headlines in future mystery campaign briefs."
            ),
            AIInsightSchema(
                title="16:9 Atmospheric Imagery Drove 2.3x Click-Through on Video Channels",
                summary="Visual direction highlighting moody Kolkata heritage backgrounds generated double the click rate compared to character close-ups.",
                category="platform_comparison",
                evidence_post_ids=evidence_ids or ["mock_post_1"],
                metrics_evidence={"ctr_multiplier": 2.3},
                recommendation_for_next_brief="Include atmospheric heritage architectural elements in all future key art prompts."
            )
        ]

    async def generate_weekly_report(
        self,
        reporting_period: str,
        campaigns_data: List[Dict[str, Any]]
    ) -> AIReportSchema:
        first_post_id = "post_default"
        if campaigns_data and "posts" in campaigns_data[0] and campaigns_data[0]["posts"]:
            first_post_id = campaigns_data[0]["posts"][0].get("id", "post_default")

        return AIReportSchema(
            title=f"SceneSetu Weekly Content Operations Report ({reporting_period})",
            reporting_period=reporting_period,
            narrative_summary="Across all active campaigns this week, native Bengali storytelling generated record engagement across Instagram and YouTube.",
            cross_platform_analysis={
                "instagram_performance": "High aesthetic engagement with average 7.8% engagement rate.",
                "youtube_performance": "Strong teaser retention and comment discussions on heritage themes.",
                "x_performance": "High velocity quote tweets around mystery plot speculation."
            },
            evidence_citations=[
                {
                    "claim": "Native Bengali mystery hooks drove 7.8% average engagement.",
                    "supporting_post_ids": [first_post_id],
                    "metrics_cited": {"engagement_rate": 7.8}
                }
            ],
            strategic_recommendations=[
                "Standardize native Bengali cultural idioms across all teaser hooks.",
                "Maintain strict 1:1 and 16:9 platform-native asset aspect ratios for optimal feed presence."
            ]
        )
