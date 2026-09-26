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
  FileText,
  SlidersHorizontal,
  Crop,
  Sliders
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const BriefForm: React.FC = () => {
  const {
    priorInsightsForBrief,
    selectedPriorInsightIds,
    setSelectedPriorInsightIds,
    refreshCampaigns,
    setActiveCampaignId,
    setActiveTab,
    triggerGeneration,
  } = useCampaign();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState<Language>("bilingual");
  const [keyObjectives, setKeyObjectives] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Platform Aspect Ratio Controls (Defaults: IG 1:1, YT 16:9, X 16:9)
  const [instagramAspect, setInstagramAspect] = useState<string>("1:1");
  const [youtubeAspect, setYoutubeAspect] = useState<string>("16:9");
  const [xAspect, setXAspect] = useState<string>("16:9");

  // Optional Text / Word / Character Limits (Flexible by default)
  const [enableTextLimits, setEnableTextLimits] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<"none" | "concise" | "standard" | "storytelling" | "custom">("none");
  const [maxWords, setMaxWords] = useState<string>("");
  const [maxChars, setMaxChars] = useState<string>("");
  const [showFieldLimits, setShowFieldLimits] = useState<boolean>(false);
  const [igMaxWords, setIgMaxWords] = useState<string>("");
  const [ytTitleMaxChars, setYtTitleMaxChars] = useState<string>("");
  const [ytDescMaxWords, setYtDescMaxWords] = useState<string>("");
  const [xMaxChars, setXMaxChars] = useState<string>("");

  const handleSelectPreset = (preset: "none" | "concise" | "standard" | "storytelling") => {
    setActivePreset(preset);
    if (preset === "none") {
      setEnableTextLimits(false);
      setMaxWords("");
      setMaxChars("");
      setIgMaxWords("");
      setYtTitleMaxChars("");
      setYtDescMaxWords("");
      setXMaxChars("");
    } else if (preset === "concise") {
      setEnableTextLimits(true);
      setMaxWords("60");
      setMaxChars("260");
      setIgMaxWords("60");
      setYtTitleMaxChars("70");
      setYtDescMaxWords("80");
      setXMaxChars("180");
    } else if (preset === "standard") {
      setEnableTextLimits(true);
      setMaxWords("120");
      setMaxChars("550");
      setIgMaxWords("120");
      setYtTitleMaxChars("90");
      setYtDescMaxWords("140");
      setXMaxChars("220");
    } else if (preset === "storytelling") {
      setEnableTextLimits(true);
      setMaxWords("220");
      setMaxChars("1200");
      setIgMaxWords("220");
      setYtTitleMaxChars("100");
      setYtDescMaxWords("250");
      setXMaxChars("260");
    }
  };

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

      const aspectRatios = {
        instagram: instagramAspect,
        youtube: youtubeAspect,
        x_twitter: xAspect,
      };

      const hasAnyLimits = enableTextLimits || Boolean(
        maxWords || maxChars || igMaxWords || ytTitleMaxChars || ytDescMaxWords || xMaxChars
      );

      const textLimits = hasAnyLimits ? {
        max_words: maxWords ? parseInt(maxWords, 10) : undefined,
        max_characters: maxChars ? parseInt(maxChars, 10) : undefined,
        instagram_max_words: igMaxWords ? parseInt(igMaxWords, 10) : (maxWords ? parseInt(maxWords, 10) : undefined),
        youtube_title_max_chars: ytTitleMaxChars ? parseInt(ytTitleMaxChars, 10) : undefined,
        youtube_max_words: ytDescMaxWords ? parseInt(ytDescMaxWords, 10) : (maxWords ? parseInt(maxWords, 10) : undefined),
        x_max_chars: xMaxChars ? parseInt(xMaxChars, 10) : (maxChars ? Math.min(parseInt(maxChars, 10), 280) : undefined),
      } : undefined;

      // Automatically trigger generation with user-selected aspect ratios and text constraints
      await triggerGeneration(undefined, newCampaign.id, aspectRatios, textLimits);
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

        {/* Platform Aspect Ratio Controls */}
        <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#222222] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-zinc-200">
              <Crop className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                Visual Aspect Ratio Controls (Platform Defaults Preserved)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Flux Schnell Hosted Rendering</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Instagram Dropdown */}
            <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-zinc-300 text-xs font-medium">
                <InstagramIcon className="w-3.5 h-3.5 text-white" />
                <span>Instagram Framing</span>
              </div>
              <select
                value={instagramAspect}
                onChange={(e) => setInstagramAspect(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="1:1">1:1 (Square Feed - Default)</option>
                <option value="4:5">4:5 (Vertical Portrait Feed)</option>
                <option value="9:16">9:16 (Story / Reel)</option>
                <option value="16:9">16:9 (Landscape Banner)</option>
              </select>
            </div>

            {/* YouTube Dropdown */}
            <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-zinc-300 text-xs font-medium">
                <YouTubeIcon className="w-3.5 h-3.5 text-white" />
                <span>YouTube Framing</span>
              </div>
              <select
                value={youtubeAspect}
                onChange={(e) => setYoutubeAspect(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="16:9">16:9 (Cinematic Thumbnail - Default)</option>
                <option value="1:1">1:1 (Community Square Post)</option>
                <option value="9:16">9:16 (Shorts Vertical)</option>
              </select>
            </div>

            {/* X / Twitter Dropdown */}
            <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-zinc-300 text-xs font-medium">
                <XTwitterIcon className="w-3.5 h-3.5 text-white" />
                <span>X / Twitter Framing</span>
              </div>
              <select
                value={xAspect}
                onChange={(e) => setXAspect(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="16:9">16:9 (Wide Summary Card - Default)</option>
                <option value="1:1">1:1 (Square Photo Post)</option>
                <option value="4:5">4:5 (Tall Feed Card)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Optional Text / Character / Word Limit Controls */}
        <div className="p-4 rounded-xl bg-[#0E0E0E] border border-[#222222] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-zinc-200">
              <SlidersHorizontal className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider">
                Copy Length & Word Limit Parameters
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-[#141414] p-1 rounded-lg border border-[#262626] text-[11px] font-mono">
              <button
                type="button"
                onClick={() => handleSelectPreset("none")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  !enableTextLimits && activePreset === "none"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Flexible Pacing (Default)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnableTextLimits(true);
                  if (activePreset === "none") {
                    handleSelectPreset("concise");
                  }
                }}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  enableTextLimits
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Enforce Brand Caps
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            By default, SceneSetu crafts native bilingual copy respecting each platform's natural pacing. Select a preset or specify exact caps below to programmatically enforce rigid character or word boundaries across all generated posts.
          </p>

          {/* Quick Presets Bar */}
          <div className="pt-2 border-t border-[#1C1C1C] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-mono">Quick Brand Presets:</span>
              {enableTextLimits && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                  Caps Active: {maxWords ? `Max ${maxWords} words` : ""}{maxChars ? ` • Max ${maxChars} chars` : ""}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectPreset("concise")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  enableTextLimits && activePreset === "concise"
                    ? "bg-[#181818] border-white text-white shadow-md ring-1 ring-white/30"
                    : "bg-[#121212] border-[#222222] hover:border-[#383838] text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Concise</span>
                  <span className="text-[10px] font-mono text-zinc-400">~60 words</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  High-tempo punchy hooks (under 260 chars)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("standard")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  enableTextLimits && activePreset === "standard"
                    ? "bg-[#181818] border-white text-white shadow-md ring-1 ring-white/30"
                    : "bg-[#121212] border-[#222222] hover:border-[#383838] text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Standard</span>
                  <span className="text-[10px] font-mono text-zinc-400">~120 words</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Balanced context & hashtags (under 550 chars)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("storytelling")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  enableTextLimits && activePreset === "storytelling"
                    ? "bg-[#181818] border-white text-white shadow-md ring-1 ring-white/30"
                    : "bg-[#121212] border-[#222222] hover:border-[#383838] text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Storytelling</span>
                  <span className="text-[10px] font-mono text-zinc-400">~220 words</span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Long-form narrative drama (under 1200 chars)
                </span>
              </button>
            </div>

            {/* Custom Inputs with auto-activate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Global Word Cap (Max Words Per Copy)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={maxWords}
                  onChange={(e) => {
                    setMaxWords(e.target.value);
                    setEnableTextLimits(true);
                    setActivePreset("custom");
                  }}
                  placeholder="e.g. 60 words"
                  className="w-full bg-[#141414] border border-[#282828] focus:border-white rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Global Character Cap (Max Characters Per Copy)
                </label>
                <input
                  type="number"
                  min="30"
                  max="5000"
                  value={maxChars}
                  onChange={(e) => {
                    setMaxChars(e.target.value);
                    setEnableTextLimits(true);
                    setActivePreset("custom");
                  }}
                  placeholder="e.g. 260 characters"
                  className="w-full bg-[#141414] border border-[#282828] focus:border-white rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Per-Platform / Field Custom Overrides */}
            <div className="pt-2 border-t border-[#1F1F1F]">
              <button
                type="button"
                onClick={() => setShowFieldLimits(!showFieldLimits)}
                className="flex items-center space-x-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>{showFieldLimits ? "▾ Hide Platform-Specific Caps" : "▸ Show Platform-Specific Overrides (Instagram, YouTube, X)"}</span>
              </button>

              {showFieldLimits && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3"
                >
                  <div className="p-2.5 rounded bg-[#121212] border border-[#242424] space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      Instagram Caption Word Cap
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="2000"
                      value={igMaxWords}
                      onChange={(e) => {
                        setIgMaxWords(e.target.value);
                        setEnableTextLimits(true);
                        setActivePreset("custom");
                      }}
                      placeholder="e.g. 60 words"
                      className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-white rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded bg-[#121212] border border-[#242424] space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      YouTube Title Char Cap (Strict Max: 100)
                    </span>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={ytTitleMaxChars}
                      onChange={(e) => {
                        setYtTitleMaxChars(e.target.value);
                        setEnableTextLimits(true);
                        setActivePreset("custom");
                      }}
                      placeholder="e.g. 70 chars"
                      className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-white rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded bg-[#121212] border border-[#242424] space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      YouTube Description Word Cap
                    </span>
                    <input
                      type="number"
                      min="20"
                      max="2000"
                      value={ytDescMaxWords}
                      onChange={(e) => {
                        setYtDescMaxWords(e.target.value);
                        setEnableTextLimits(true);
                        setActivePreset("custom");
                      }}
                      placeholder="e.g. 120 words"
                      className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-white rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 rounded bg-[#121212] border border-[#242424] space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 block">
                      X (Twitter) Post Char Cap (Strict Max: 280)
                    </span>
                    <input
                      type="number"
                      min="20"
                      max="280"
                      value={xMaxChars}
                      onChange={(e) => {
                        setXMaxChars(e.target.value);
                        setEnableTextLimits(true);
                        setActivePreset("custom");
                      }}
                      placeholder="e.g. 200 chars"
                      className="w-full bg-[#181818] border border-[#2E2E2E] focus:border-white rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
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
