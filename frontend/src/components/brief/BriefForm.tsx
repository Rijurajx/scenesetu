"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, Language, Insight } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  Compass,
  Check,
  Lightbulb,
  FileText
} from "lucide-react";

export const BriefForm: React.FC = () => {
  const {
    priorInsightsForBrief,
    selectedPriorInsightIds,
    setSelectedPriorInsightIds,
    refreshCampaigns,
    setActiveCampaignId,
    setActiveTab,
  } = useCampaign();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState<Language>("bilingual");
  const [keyObjectives, setKeyObjectives] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template pre-fills for realistic judging demos
  const loadTemplate = (type: "kolkata_noir" | "durga_puja" | "cyber_thriller") => {
    switch (type) {
      case "kolkata_noir":
        setTitle("অরণ্যের প্রাচীন প্রবাদ (Ancient Riddle of the Forest)");
        setBrief(
          "A celebrated detective investigates a locked-room heirloom robbery in a misty North Kolkata mansion. A vintage 1940s watch holds a cipher pointing toward the Sundarbans. Gritty, rain-soaked noir atmosphere, intense character motives, and high psychological suspense."
        );
        setTargetAudience("Bengali OTT thriller enthusiasts, mystery lovers, youth & adult audiences (18-40)");
        setLanguage("bilingual");
        setKeyObjectives("Generate high anticipation, spark theories in comments, and drive trailer clicks");
        break;
      case "durga_puja":
        setTitle("উৎসবের অন্তরালে (Behind the Festivities)");
        setBrief(
          "An emotional family reunion drama during Durga Puja in rural Bengal. Hidden family secrets, lost heritage, and reconciliation unfold over the five days from Sasthi to Dashami against traditional dhak rhythms and kaash flowers."
        );
        setTargetAudience("Family audiences, Bengali diaspora, drama viewers across Kolkata and abroad");
        setLanguage("bengali");
        setKeyObjectives("Evoke nostalgic emotional resonance, family sharing, and community engagement");
        break;
      case "cyber_thriller":
        setTitle("এনক্রিপ্টেড: কলকাতা (Encrypted: Kolkata)");
        setBrief(
          "A high-speed cyber thriller where a freelance ethical hacker in Salt Lake Sector V discovers a massive data syndicate threatening the city's power grid during a thunderstorm. Fast pacing, neon visuals, cutting-edge jargon mixed with authentic Bengali slang."
        );
        setTargetAudience("Tech-savvy youth, fast-paced thriller fans, OTT subscribers (16-30)");
        setLanguage("bilingual");
        setKeyObjectives("Maximize fast-paced swipe engagement, click-throughs, and instant shares");
        break;
    }
  };

  const toggleInsight = (id: string) => {
    if (selectedPriorInsightIds.includes(id)) {
      setSelectedPriorInsightIds(selectedPriorInsightIds.filter((item) => item !== id));
    } else {
      setSelectedPriorInsightIds([...selectedPriorInsightIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const newCampaign = await api.createCampaign({
        title,
        brief,
        target_audience: targetAudience || undefined,
        primary_language: language,
        key_objectives: keyObjectives || undefined,
        prior_insight_ids:
          selectedPriorInsightIds.length > 0 ? selectedPriorInsightIds : undefined,
      });

      await refreshCampaigns();
      setActiveCampaignId(newCampaign.id);
      setActiveTab("studio");
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Compass className="w-3.5 h-3.5 text-white" />
          <span>Step 1: Campaign Brief Ingestion</span>
        </div>
        <h1 className="text-2xl font-normal text-white tracking-tight">
          Create AI Content Operations Brief
        </h1>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Enter a single content brief in Bengali or English. SceneSetu’s AI Engine will construct an integrated campaign strategy, author native bilingual copy, generate hosted visual assets, and enforce deterministic platform validation.
        </p>
      </div>

      {/* Preset Quick Starters */}
      <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[#1F1F1F]">
        <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider block mb-2.5">
          Quick Start Demonstration Briefs (One-Click Pre-fill):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.button
            whileHover={{ y: -2 }}
            type="button"
            onClick={() => loadTemplate("kolkata_noir")}
            className="text-left p-3 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-zinc-500 transition-all group cursor-pointer"
          >
            <span className="text-xs font-medium text-zinc-200 block group-hover:text-white transition-colors">
              🔍 অরণ্যের প্রাচীন প্রবাদ
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Kolkata noir mystery • Bilingual • 1940s watch clue
            </span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            type="button"
            onClick={() => loadTemplate("durga_puja")}
            className="text-left p-3 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-zinc-500 transition-all group cursor-pointer"
          >
            <span className="text-xs font-medium text-zinc-200 block group-hover:text-white transition-colors">
              🪔 উৎসবের অন্তরালে
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Durga Puja drama • Native Bengali • Heritage mansion
            </span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            type="button"
            onClick={() => loadTemplate("cyber_thriller")}
            className="text-left p-3 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-zinc-500 transition-all group cursor-pointer"
          >
            <span className="text-xs font-medium text-zinc-200 block group-hover:text-white transition-colors">
              ⚡ এনক্রিপ্টেড (Encrypted)
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Modern Cyber thriller • Punchy hooks • Neon Kolkata
            </span>
          </motion.button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-[#0A0A0A] p-6 rounded-xl border border-[#1E1E1E]">
        {error && (
          <div className="p-3 rounded-lg bg-white/5 border border-white/20 text-zinc-200 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
            Campaign Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. নিশীথ রাতের ডাক (Midnight Call)"
            className="w-full bg-[#121212] border border-[#242424] rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
            Single Content Brief / Synopsis
          </label>
          <textarea
            required
            rows={5}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe the series, premise, key hooks, character motivations, atmosphere, or release details in Bengali or English..."
            className="w-full bg-[#121212] border border-[#242424] rounded-lg p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Native Bengali input (বাংলা) is natively processed by SceneSetu without machine translation shortcuts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Bengali OTT subscribers, youth 18-35"
              className="w-full bg-[#121212] border border-[#242424] rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
              Language Preference
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-[#121212] border border-[#242424] rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
            >
              <option value="bilingual">Bilingual (Native Bengali Primary + English Secondary)</option>
              <option value="bengali">Pure Native Bengali (বাংলা)</option>
              <option value="english">Native English</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
            Primary Campaign Objective
          </label>
          <input
            type="text"
            value={keyObjectives}
            onChange={(e) => setKeyObjectives(e.target.value)}
            placeholder="e.g. Maximize mystery engagement, comment velocity, and app installs"
            className="w-full bg-[#121212] border border-[#242424] rounded-lg px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            {selectedPriorInsightIds.length > 0 && (
              <span className="text-white font-mono text-[11px]">
                ✓ {selectedPriorInsightIds.length} historical insight(s) attached
              </span>
            )}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 font-medium text-xs sm:text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>{isSubmitting ? "Orchestrating Pipeline..." : "Generate Multi-Platform Campaign"}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </motion.button>
        </div>
      </form>

      {/* THE CLOSED LOOP: Past Insights Injection Panel (Positioned cleanly at the BOTTOM) */}
      {priorInsightsForBrief.length > 0 && (
        <div className="p-5 rounded-xl bg-[#0C0C0C] border border-white/15 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <Lightbulb className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                The Closed Loop: Inject Past Campaign Insights
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {priorInsightsForBrief.length} Available Insight(s)
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Select empirical performance recommendations from previous campaigns to feed directly into this brief's strategy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {priorInsightsForBrief.map((insight: Insight) => {
              const isSelected = selectedPriorInsightIds.includes(insight.id);
              return (
                <div
                  key={insight.id}
                  onClick={() => toggleInsight(insight.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between space-x-2 ${
                    isSelected
                      ? "bg-white/10 border-white text-white shadow-sm"
                      : "bg-[#141414] border-[#242424] text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  <div>
                    <span className="font-medium block mb-0.5">{insight.title}</span>
                    <span className="text-[11px] text-zinc-400 line-clamp-2">
                      💡 {insight.recommendation_for_next_brief}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected
                        ? "bg-white border-white text-black"
                        : "border-zinc-600 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
