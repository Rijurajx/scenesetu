"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, LikeForLikeComparisonResponse, LikeForLikePostComparison } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Trophy,
  ArrowRight,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  Radio,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  MousePointerClick
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const AnalyticsWorkspace: React.FC = () => {
  const { campaigns, activeCampaignId, setActiveCampaignId, refreshCampaigns, setActiveTab } =
    useCampaign();

  const [comparisons, setComparisons] = useState<Record<string, LikeForLikeComparisonResponse | null>>({});
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [collapsedCampaigns, setCollapsedCampaigns] = useState<Record<string, boolean>>({});

  const toggleCampaignCollapse = (campaignId: string) => {
    setCollapsedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  // Load comparison metrics for all campaigns
  const fetchAllComparisons = async () => {
    if (!campaigns || campaigns.length === 0) return;
    const entries: Record<string, LikeForLikeComparisonResponse | null> = {};
    for (const c of campaigns) {
      try {
        const comp = await api.getComparison(c.id);
        entries[c.id] = comp;
      } catch {
        entries[c.id] = null;
      }
    }
    setComparisons(entries);
  };

  useEffect(() => {
    fetchAllComparisons();
  }, [campaigns]);

  const handleSeedMetrics = async (campaignId: string) => {
    setLoadingCampaignId(campaignId);
    setMessage(null);
    try {
      const res = await api.seedMetrics(campaignId);
      await refreshCampaigns();
      const updated = await api.getComparison(campaignId);
      setComparisons((prev) => ({ ...prev, [campaignId]: updated }));
      setMessage(res.message);
    } catch (err: any) {
      setMessage(`Error seeding metrics: ${err.message}`);
    } finally {
      setLoadingCampaignId(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <InstagramIcon className="w-4 h-4 text-pink-400" />;
      case "youtube":
        return <YouTubeIcon className="w-4 h-4 text-red-500" />;
      case "x_twitter":
      case "x":
      case "twitter":
        return <XTwitterIcon className="w-4 h-4 text-white" />;
      default:
        return <Radio className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "Instagram";
      case "youtube":
        return "YouTube";
      case "x_twitter":
      case "x":
      case "twitter":
        return "X";
      default:
        return platform;
    }
  };

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0C0C0C] rounded-2xl border border-[#1E1E1E]">
        <BarChart3 className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
        <h3 className="text-sm font-medium text-zinc-300">No Campaigns Available</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Create and generate a campaign in Step 1 (Generate Campaigns) to start reviewing analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            Strict editorial rule: Only posts published via Channel Adapter stream live into Analytics. Adaptations of the same concept are compared side-by-side.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
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
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-[#141414] border border-white/20 text-xs font-mono text-zinc-200 flex items-center justify-between"
        >
          <span>{message}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-zinc-500 hover:text-white text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Campaign List with Collapsible Dropdown Layout */}
      <div className="space-y-5">
        {campaigns.map((camp) => {
          const isActive = activeCampaignId === camp.id;
          const isExpanded = !collapsedCampaigns[camp.id];
          const comp = comparisons[camp.id];

          const publishedPosts = (camp.posts || []).filter((p) => p.status === "published");
          const comparisonPosts = comp?.posts || [];
          const isSeeding = loadingCampaignId === camp.id;

          return (
            <div
              key={camp.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-[#0C0C0C] ${
                isActive ? "border-white/30 shadow-xl shadow-black/60" : "border-[#1E1E1E]"
              }`}
            >
              {/* Campaign Collapsible Accordion Header */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#181818] bg-[#0E0E0E]">
                <div
                  onClick={() => {
                    setActiveCampaignId(camp.id);
                    toggleCampaignCollapse(camp.id);
                  }}
                  className="cursor-pointer flex items-start space-x-3.5 flex-1 select-none"
                >
                  <button
                    type="button"
                    className="mt-0.5 p-2 rounded-lg bg-[#181818] hover:bg-[#242424] border border-[#2B2B2B] text-zinc-300 hover:text-white shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-medium text-white tracking-tight">
                        {camp.title}
                      </h2>
                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-medium">
                          ACTIVE
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/20 font-medium">
                        {publishedPosts.length} Published Post{publishedPosts.length === 1 ? "" : "s"} in Analytics
                      </span>
                      {comp?.winning_platform_by_engagement && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 font-medium flex items-center space-x-1">
                          <Trophy className="w-2.5 h-2.5 text-amber-300" />
                          <span>Winner: {getPlatformLabel(comp.winning_platform_by_engagement)}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1 max-w-2xl font-sans">
                      Brief: {camp.brief}
                    </p>
                  </div>
                </div>

                {/* Campaign Header Quick Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  {publishedPosts.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSeedMetrics(camp.id)}
                      disabled={isSeeding}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] text-zinc-200 border border-[#2E2E2E] text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                      title="Seed realistic engagement numbers for the published posts"
                    >
                      <Zap className={`w-3.5 h-3.5 text-white ${isSeeding ? "animate-spin" : ""}`} />
                      <span>{isSeeding ? "Ingesting..." : "Simulate Metrics"}</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Collapsible Campaign Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-6"
                  >
                    {/* If NO published posts in this campaign */}
                    {publishedPosts.length === 0 ? (
                      <div className="p-10 text-center bg-[#090909] rounded-xl border border-[#1C1C1C]">
                        <Radio className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <h4 className="text-xs font-medium text-zinc-300">
                          No Published Posts Yet for this Campaign
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                          Only posts published via Channel Adapter in Step 4 (Publisher) go to the Analytics section.
                          Publish one or more posts to start streaming live performance comparisons.
                        </p>
                        <button
                          onClick={() => {
                            setActiveCampaignId(camp.id);
                            setActiveTab("publisher");
                          }}
                          className="mt-3.5 px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium cursor-pointer flex items-center space-x-1.5 mx-auto"
                        >
                          <Send className="w-3.5 h-3.5 text-black" />
                          <span>Go to Publisher</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Comparison Overview Banner */}
                        {comp && (
                          <div className="p-4 sm:p-5 rounded-xl bg-[#090909] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-medium block">
                                Core Concept Strategy
                              </span>
                              <p className="text-sm font-medium text-white">{camp.title}</p>
                              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                {comp.comparison_summary}
                              </p>
                            </div>

                            {comp.winning_platform_by_engagement && (
                              <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-[#141414] border border-amber-500/30 shrink-0">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <div>
                                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                                    Winning Platform
                                  </span>
                                  <span className="text-sm font-medium text-white capitalize">
                                    {getPlatformLabel(comp.winning_platform_by_engagement)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Side-by-Side Comparison Cards (Strictly for published posts) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {comparisonPosts.map((post: LikeForLikePostComparison) => {
                            const m = post.metrics;
                            const mediaUrl = api.getMediaUrl(post.media_url);
                            const isWinner =
                              comp?.winning_platform_by_engagement?.toLowerCase() ===
                              post.platform.toLowerCase();

                            return (
                              <motion.div
                                key={post.post_id}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-[#0A0A0A] rounded-xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                                  isWinner
                                    ? "border-amber-500/50 ring-1 ring-amber-500/20"
                                    : "border-[#1E1E1E]"
                                }`}
                              >
                                <div>
                                  {/* Card Header */}
                                  <div className="p-3 bg-[#111111] border-b border-[#1A1A1A] flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {getPlatformIcon(post.platform)}
                                      <span className="font-mono text-xs uppercase text-zinc-200 tracking-wide font-medium">
                                        {getPlatformLabel(post.platform)}
                                      </span>
                                    </div>
                                    {isWinner && (
                                      <span className="text-[10px] font-mono font-medium text-black bg-amber-400 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                        <Trophy className="w-3 h-3 text-black" />
                                        <span>LEADER</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Media Preview */}
                                  <div className="h-40 bg-black flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]">
                                    {mediaUrl ? (
                                      <img
                                        src={mediaUrl}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-zinc-500 text-xs">Media preview</span>
                                    )}
                                  </div>

                                  {/* Copy Hook Snippet */}
                                  <div className="p-3.5 border-b border-[#181818] bg-[#0E0E0E]">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                                      Platform Copy Hook
                                    </span>
                                    <p className="text-xs text-zinc-300 line-clamp-2 italic leading-relaxed">
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
                                      <span className="text-sm font-semibold text-white font-mono">
                                        {m ? `${m.engagement_rate}%` : "—"}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 rounded bg-[#121212] border border-[#202020]">
                                        <span className="text-[10px] font-mono text-zinc-500 block">
                                          Impressions
                                        </span>
                                        <span className="font-medium text-zinc-200 font-mono">
                                          {m ? m.impressions.toLocaleString() : "—"}
                                        </span>
                                      </div>

                                      <div className="p-2 rounded bg-[#121212] border border-[#202020]">
                                        <span className="text-[10px] font-mono text-zinc-500 block">
                                          Reach
                                        </span>
                                        <span className="font-medium text-zinc-200 font-mono">
                                          {m ? m.reach.toLocaleString() : "—"}
                                        </span>
                                      </div>

                                      <div className="p-2 rounded bg-[#121212] border border-[#202020]">
                                        <span className="text-[10px] font-mono text-zinc-500 block">
                                          Likes
                                        </span>
                                        <span className="font-medium text-zinc-200 font-mono">
                                          {m ? m.likes.toLocaleString() : "—"}
                                        </span>
                                      </div>

                                      <div className="p-2 rounded bg-[#121212] border border-[#202020]">
                                        <span className="text-[10px] font-mono text-zinc-500 block">
                                          Comments
                                        </span>
                                        <span className="font-medium text-zinc-200 font-mono">
                                          {m ? m.comments.toLocaleString() : "—"}
                                        </span>
                                      </div>

                                      <div className="p-2 rounded bg-[#121212] border border-[#202020]">
                                        <span className="text-[10px] font-mono text-zinc-500 block">
                                          Shares
                                        </span>
                                        <span className="font-medium text-zinc-200 font-mono">
                                          {m ? m.shares.toLocaleString() : "—"}
                                        </span>
                                      </div>

                                      <div className="p-2 rounded bg-[#121212] border border-[#202020]">
                                        <span className="text-[10px] font-mono text-zinc-500 block">
                                          Clicks
                                        </span>
                                        <span className="font-medium text-zinc-200 font-mono">
                                          {m ? m.clicks.toLocaleString() : "—"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-[#101010] border-t border-[#181818] text-center text-[10px] text-zinc-500 font-mono">
                                  Ref: {post.post_id}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
