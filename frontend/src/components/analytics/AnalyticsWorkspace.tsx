"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, LikeForLikeComparisonResponse, LikeForLikePostComparison } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Trophy,
  ArrowRight,
  Zap,
  Sparkles,
  Layers
} from "lucide-react";

export const AnalyticsWorkspace: React.FC = () => {
  const { activeCampaign, refreshCampaigns, setActiveTab } = useCampaign();

  const [comparison, setComparison] = useState<LikeForLikeComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeCampaign) {
      api.getComparison(activeCampaign.id)
        .then(setComparison)
        .catch(() => setComparison(null));
    }
  }, [activeCampaign]);

  const handleSeedMetrics = async () => {
    if (!activeCampaign) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await api.seedMetrics(activeCampaign.id);
      await refreshCampaigns();
      const updated = await api.getComparison(activeCampaign.id);
      setComparison(updated);
      setMessage(res.message);
    } catch (err: any) {
      setMessage(`Error seeding metrics: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeCampaign) {
    return (
      <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
        <p className="text-xs text-zinc-400">Select an active campaign first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
            <span>Step 5: Cross-Platform Performance Intelligence</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Like-For-Like Concept Comparison
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Strict judging rule: Compare adaptations of the exact same content concept side-by-side rather than disconnected silo totals.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeedMetrics}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-zinc-200 border border-[#2B2B2B] text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>{isLoading ? "Ingesting..." : "Simulate / Seed Metrics"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("insights")}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium cursor-pointer shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Generate AI Insights</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </motion.button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-[#141414] border border-white/20 text-xs font-mono text-zinc-200">
          {message}
        </div>
      )}

      {/* Comparison Overview Banner */}
      {comparison && (
        <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-medium block">
              Core Creative Concept
            </span>
            <p className="text-sm font-medium text-white">{activeCampaign.title}</p>
            <p className="text-xs text-zinc-400 mt-1">{comparison.comparison_summary}</p>
          </div>

          {comparison.winning_platform_by_engagement && (
            <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-lg bg-[#141414] border border-white/20 shrink-0">
              <Trophy className="w-4 h-4 text-white" />
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Top Performing Platform
                </span>
                <span className="text-xs font-medium text-white capitalize">
                  {comparison.winning_platform_by_engagement.replace("_", " ")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparison?.posts.map((post: LikeForLikePostComparison) => {
          const m = post.metrics;
          const mediaUrl = api.getMediaUrl(post.media_url);
          const isWinner = comparison.winning_platform_by_engagement === post.platform;

          return (
            <motion.div
              key={post.post_id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`bg-[#0C0C0C] rounded-xl border flex flex-col justify-between overflow-hidden transition-all shadow-lg ${
                isWinner ? "border-white" : "border-[#1E1E1E]"
              }`}
            >
              <div>
                {/* Header */}
                <div className="p-3.5 bg-[#111111] border-b border-[#1A1A1A] flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-zinc-200 tracking-wide">
                    {post.platform.replace("_", " ")} Adaptation
                  </span>
                  {isWinner && (
                    <span className="text-[10px] font-mono font-medium text-black bg-white px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Trophy className="w-3 h-3 text-black" />
                      <span>LEADER</span>
                    </span>
                  )}
                </div>

                {/* Media Preview */}
                <div className="h-40 bg-black flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]">
                  {mediaUrl ? (
                    <img src={mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-500 text-xs">Media preview</span>
                  )}
                </div>

                {/* Copy snippet */}
                <div className="p-4 border-b border-[#1A1A1A]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                    Platform Content Hook
                  </span>
                  <p className="text-xs text-zinc-300 line-clamp-2 italic">
                    "{post.copy_snippet}"
                  </p>
                </div>

                {/* Performance Metrics Table */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
                    <span className="text-xs text-zinc-400 flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                      <span>Engagement Rate</span>
                    </span>
                    <span className="text-sm font-medium text-white font-mono">
                      {m ? `${m.engagement_rate}%` : "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-[#141414] border border-[#222222]">
                      <span className="text-[10px] font-mono text-zinc-500 block">Impressions</span>
                      <span className="font-medium text-zinc-200 font-mono">
                        {m ? m.impressions.toLocaleString() : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141414] border border-[#222222]">
                      <span className="text-[10px] font-mono text-zinc-500 block">Reach</span>
                      <span className="font-medium text-zinc-200 font-mono">
                        {m ? m.reach.toLocaleString() : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141414] border border-[#222222]">
                      <span className="text-[10px] font-mono text-zinc-500 block">Likes</span>
                      <span className="font-medium text-zinc-200 font-mono">
                        {m ? m.likes.toLocaleString() : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141414] border border-[#222222]">
                      <span className="text-[10px] font-mono text-zinc-500 block">Comments</span>
                      <span className="font-medium text-zinc-200 font-mono">
                        {m ? m.comments.toLocaleString() : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141414] border border-[#222222]">
                      <span className="text-[10px] font-mono text-zinc-500 block">Shares</span>
                      <span className="font-medium text-zinc-200 font-mono">
                        {m ? m.shares.toLocaleString() : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#141414] border border-[#222222]">
                      <span className="text-[10px] font-mono text-zinc-500 block">Clicks</span>
                      <span className="font-medium text-zinc-200 font-mono">
                        {m ? m.clicks.toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111111] border-t border-[#1A1A1A] text-center text-[10px] text-zinc-500 font-mono">
                Post Ref: {post.post_id}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
