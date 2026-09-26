"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api } from "@/lib/api";
import {
  Sliders,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const StudioWorkspace: React.FC = () => {
  const {
    activeCampaign,
    isGenerating,
    generationProgress,
    setActiveTab,
    triggerGeneration,
  } = useCampaign();

  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const posts = activeCampaign?.posts || [];
  const strategy = activeCampaign?.strategy;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <InstagramIcon className="w-4 h-4 text-white" />;
      case "youtube":
        return <YouTubeIcon className="w-4 h-4 text-white" />;
      case "x_twitter":
      case "twitter":
        return <XTwitterIcon className="w-4 h-4 text-white" />;
      default:
        return <Layers className="w-4 h-4 text-white" />;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "Instagram";
      case "youtube":
        return "YouTube Community";
      case "x_twitter":
        return "X (Twitter)";
      default:
        return platform;
    }
  };

  const filteredPosts =
    selectedPlatform === "all"
      ? posts
      : posts.filter((p) => p.platform === selectedPlatform);

  if (!activeCampaign) {
    return (
      <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
        <Sliders className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-zinc-300">No Active Campaign</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Create a campaign brief first or select an existing campaign to inspect generated creative assets.
        </p>
        <button
          onClick={() => setActiveTab("brief")}
          className="mt-4 px-5 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
        >
          Go to Brief Creation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Title and Regenerate Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>Step 2: AI Multi-Platform Studio</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            {activeCampaign.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
            Brief: {activeCampaign.brief}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerGeneration()}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1E1E1E] border border-[#2B2B2B] text-zinc-200 text-xs font-medium transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Regenerating..." : "Regenerate Run"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("review")}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Proceed to Human Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Live Generation Progress Banner */}
      {isGenerating && (
        <div className="p-4 rounded-xl bg-[#121212] border border-white/20 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <div>
              <span className="text-xs font-mono font-medium text-white uppercase tracking-wider block">
                AI Generation Pipeline Running
              </span>
              <span className="text-xs text-zinc-300">{generationProgress}</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Strategy Synthesis Card */}
      {strategy && (
        <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] space-y-3">
          <div className="flex items-center space-x-2 text-white">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              AI Creative Strategy Blueprint
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
              <span className="text-zinc-500 font-mono uppercase tracking-wider block text-[10px] mb-1">
                Central Theme
              </span>
              <p className="font-normal text-zinc-200">{strategy.overall_theme}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
              <span className="text-zinc-500 font-mono uppercase tracking-wider block text-[10px] mb-1">
                Core Hook
              </span>
              <p className="font-normal text-zinc-200">{strategy.core_hook}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
              <span className="text-zinc-500 font-mono uppercase tracking-wider block text-[10px] mb-1">
                Emotional Resonance
              </span>
              <p className="font-normal text-zinc-200">{strategy.emotional_resonance}</p>
            </div>
          </div>

          {strategy.creative_direction && (
            <p className="text-xs text-zinc-400 italic pt-1 border-t border-[#1C1C1C]">
              "Direction: {strategy.creative_direction}"
            </p>
          )}
        </div>
      )}

      {/* Platform Filter Tabs (Pure Monochrome Pill Buttons) */}
      <div className="flex items-center space-x-2 border-b border-[#1E1E1E] pb-3">
        <span className="text-xs text-zinc-400 mr-2 font-mono">Platform:</span>
        <button
          onClick={() => setSelectedPlatform("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            selectedPlatform === "all"
              ? "bg-white text-black"
              : "bg-[#121212] border border-[#242424] text-zinc-400 hover:text-white"
          }`}
        >
          All (3 Platforms)
        </button>
        <button
          onClick={() => setSelectedPlatform("instagram")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
            selectedPlatform === "instagram"
              ? "bg-white text-black"
              : "bg-[#121212] border border-[#242424] text-zinc-400 hover:text-white"
          }`}
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>Instagram</span>
        </button>
        <button
          onClick={() => setSelectedPlatform("youtube")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
            selectedPlatform === "youtube"
              ? "bg-white text-black"
              : "bg-[#121212] border border-[#242424] text-zinc-400 hover:text-white"
          }`}
        >
          <YouTubeIcon className="w-3.5 h-3.5" />
          <span>YouTube</span>
        </button>
        <button
          onClick={() => setSelectedPlatform("x_twitter")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
            selectedPlatform === "x_twitter"
              ? "bg-white text-black"
              : "bg-[#121212] border border-[#242424] text-zinc-400 hover:text-white"
          }`}
        >
          <XTwitterIcon className="w-3.5 h-3.5" />
          <span>X (Twitter)</span>
        </button>
      </div>

      {/* 3 Distinct Platform Adaptations Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
          <p className="text-xs text-zinc-400">
            No posts generated for this campaign yet. Click "Regenerate Run" above to trigger AI generation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const mediaUrl = api.getMediaUrl(post.asset?.public_url);
            const valPassed = post.validation_results?.some((v) => v.status === "passed");

            return (
              <motion.div
                key={post.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] flex flex-col justify-between overflow-hidden hover:border-[#333333] transition-all shadow-lg group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between bg-[#111111]">
                    <div className="flex items-center space-x-2.5">
                      {getPlatformIcon(post.platform)}
                      <span className="font-medium text-xs text-white">
                        {getPlatformLabel(post.platform)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                          valPassed
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-black text-zinc-400 border border-dashed border-zinc-600"
                        }`}
                      >
                        {valPassed ? "QC: PASSED" : "QC: FAILED"}
                      </span>
                    </div>
                  </div>

                  {/* Media Visual Asset Preview */}
                  <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]">
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt={post.asset?.prompt || "AI generated visual"}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-500 text-xs">
                        <ImageIcon className="w-8 h-8 mb-1.5 opacity-50 text-white" />
                        <span>Rendering AI Visual...</span>
                      </div>
                    )}
                    {post.asset?.aspect_ratio && (
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 bg-black/80 text-zinc-300 rounded border border-white/15">
                        {post.asset.aspect_ratio} • {post.asset.width}x{post.asset.height}
                      </span>
                    )}
                  </div>

                  {/* Copy & Platform Tailoring */}
                  <div className="p-4 space-y-3">
                    {post.title && (
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-0.5">
                          YouTube Title (SEO)
                        </span>
                        <h4 className="font-medium text-xs text-zinc-100 line-clamp-2">
                          {post.title}
                        </h4>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                          Native Copy ({post.language})
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {post.copy_primary.length} chars
                          {post.platform === "x_twitter" && " / 280"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans line-clamp-6 bg-[#141414] p-3 rounded-lg border border-[#222222]">
                        {post.copy_primary}
                      </p>
                    </div>

                    {/* Secondary translation or context if present */}
                    {post.copy_secondary && (
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-0.5">
                          Secondary Context / Translation
                        </span>
                        <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                          {post.copy_secondary}
                        </p>
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono text-zinc-300 bg-[#161616] px-2 py-0.5 rounded border border-[#2A2A2A]"
                          >
                            #{tag.replace("#", "")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Call To Action */}
                    <div className="pt-2 border-t border-[#1A1A1A] flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        CTA:
                      </span>
                      <span className="font-medium text-white text-right text-[11px]">
                        {post.cta}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-[#111111] border-t border-[#1A1A1A] flex items-center justify-between text-xs">
                  <span className={`capitalize font-mono text-[10px] px-2 py-0.5 rounded ${
                    post.status === "approved"
                      ? "text-white bg-white/10 border border-white/20"
                      : post.status === "rejected"
                      ? "text-zinc-400 border border-dashed border-zinc-700"
                      : "text-zinc-300 bg-white/5 border border-white/10"
                  }`}>
                    {post.status.replace("_", " ")}
                  </span>

                  <button
                    onClick={() => setActiveTab("review")}
                    className="flex items-center space-x-1 text-zinc-300 hover:text-white text-xs font-medium px-3 py-1 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#2E2E2E] transition-colors cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
