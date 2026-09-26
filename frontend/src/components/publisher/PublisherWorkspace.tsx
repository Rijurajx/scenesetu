"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, SocialAdapter } from "@/lib/api";
import {
  Send,
  Calendar,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Zap,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Layers,
  Plug
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const PublisherWorkspace: React.FC = () => {
  const { campaigns, activeCampaignId, setActiveCampaignId, refreshCampaigns, setActiveTab } =
    useCampaign();

  const [adapters, setAdapters] = useState<SocialAdapter[]>([]);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [unpublishingPostId, setUnpublishingPostId] = useState<string | null>(null);
  const [scheduledTimes, setScheduledTimes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [collapsedCampaigns, setCollapsedCampaigns] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    api.listAdapters().then(setAdapters).catch(() => {});
  }, []);

  const getMatchingAdapter = (platform: string) => {
    return adapters.find(
      (a) => a.platform.toLowerCase() === platform.toLowerCase() && a.is_active
    );
  };

  const toggleCampaignCollapse = (campaignId: string) => {
    setCollapsedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

  const handlePublish = async (postId: string) => {
    setPublishingPostId(postId);
    setMessage(null);
    try {
      const pub = await api.publishPost(postId);
      await refreshCampaigns();
      setMessage(`✓ Published live to platform adapter: ${pub.external_post_id}. Post is now streaming in Analytics!`);
    } catch (err: any) {
      setMessage(`Publish failed: ${err.message}`);
    } finally {
      setPublishingPostId(null);
    }
  };

  const handleUnpublish = async (postId: string) => {
    setUnpublishingPostId(postId);
    setMessage(null);
    try {
      await api.unpublishPost(postId);
      await refreshCampaigns();
      setMessage("✓ Post unpublished. Reverted to approved status and removed from live analytics.");
    } catch (err: any) {
      setMessage(`Unpublish failed: ${err.message}`);
    } finally {
      setUnpublishingPostId(null);
    }
  };

  const handleSchedule = async (postId: string) => {
    const time = scheduledTimes[postId];
    if (!time) {
      setMessage("Please pick a scheduled publication timestamp first.");
      return;
    }

    try {
      await api.schedulePost(postId, new Date(time).toISOString());
      await refreshCampaigns();
      setMessage(`Scheduled post for ${new Date(time).toLocaleString()}`);
    } catch (err: any) {
      setMessage(`Scheduling error: ${err.message}`);
    }
  };

  const handleSeedMetrics = async (campaignId: string) => {
    try {
      const res = await api.seedMetrics(campaignId);
      setMessage(res.message);
      await refreshCampaigns();
    } catch (err: any) {
      setMessage(`Error seeding metrics: ${err.message}`);
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
        <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
        <h3 className="text-sm font-medium text-zinc-300">No Campaigns Available</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Create and generate a campaign in Step 1 (Generate Campaigns) to start publishing.
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
            <Send className="w-3.5 h-3.5 text-white" />
            <span>Step 4: Scheduling & Multi-Platform Command Publisher</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Publisher Control Center
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dispatches approved assets through your personal social adapters (Webhooks, X API, Instagram Graph API). Falls back to simulator if no personal adapter is configured. Only published posts stream into Analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("adapters")}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#161616] hover:bg-[#222222] text-zinc-300 hover:text-white border border-[#2B2B2B] text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
          >
            <Plug className="w-3.5 h-3.5 text-zinc-400" />
            <span>Adapters ({adapters.filter((a) => a.is_active).length} Active)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("analytics")}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium cursor-pointer shadow-md transition-all whitespace-nowrap shrink-0"
          >
            <span>Cross-Platform Analytics</span>
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

          const campPosts = camp.posts || [];
          const approvedOrPublishedPosts = campPosts.filter(
            (p) => p.status === "approved" || p.status === "scheduled" || p.status === "published"
          );
          const publishedPosts = campPosts.filter((p) => p.status === "published");
          const approvedReadyPosts = campPosts.filter((p) => p.status === "approved");
          const unapprovedCount = campPosts.filter(
            (p) => p.status !== "approved" && p.status !== "published"
          ).length;

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
                      {publishedPosts.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{publishedPosts.length} Live on Platform</span>
                        </span>
                      )}
                      {approvedReadyPosts.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                          {approvedReadyPosts.length} Ready to Publish
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-zinc-400 border border-[#2B2B2B] uppercase">
                        {camp.status.replace("_", " ")}
                      </span>
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
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#161616] hover:bg-[#202020] text-zinc-200 border border-[#2E2E2E] text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap"
                      title="Seed realistic engagement numbers for the published posts"
                    >
                      <Zap className="w-3.5 h-3.5 text-white" />
                      <span>Simulate Metrics</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Collapsible Campaign Posts Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-4"
                  >
                    {/* Unapproved Posts Alert */}
                    {unapprovedCount > 0 && (
                      <div className="p-3 rounded-xl bg-[#121212] border border-white/15 flex items-center justify-between text-xs text-zinc-300">
                        <div className="flex items-center space-x-2">
                          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                          <span>
                            {unapprovedCount} post(s) currently awaiting Human Editorial Review in Step 3 and blocked from publishing.
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveCampaignId(camp.id);
                            setActiveTab("review");
                          }}
                          className="font-medium underline ml-2 hover:text-white cursor-pointer whitespace-nowrap"
                        >
                          Review Gate →
                        </button>
                      </div>
                    )}

                    {approvedOrPublishedPosts.length === 0 ? (
                      <div className="p-10 text-center bg-[#090909] rounded-xl border border-[#1C1C1C]">
                        <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <h4 className="text-xs font-medium text-zinc-300">No Approved Posts Ready for this Campaign</h4>
                        <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                          Posts must be approved in the Review Gate before they enter the publishing queue.
                        </p>
                        <button
                          onClick={() => {
                            setActiveCampaignId(camp.id);
                            setActiveTab("review");
                          }}
                          className="mt-3 px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium cursor-pointer"
                        >
                          Open Review Gate
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {approvedOrPublishedPosts.map((post) => {
                          const isPublished = post.status === "published";
                          const isScheduled = post.status === "scheduled";
                          const mediaUrl = api.getMediaUrl(post.asset?.public_url);
                          const isPublishing = publishingPostId === post.id;
                          const isUnpublishing = unpublishingPostId === post.id;
                          const matchingAdapter = getMatchingAdapter(post.platform);

                          return (
                            <motion.div
                              key={post.id}
                              whileHover={{ y: -2 }}
                              transition={{ duration: 0.2 }}
                              className={`bg-[#0A0A0A] rounded-xl border flex flex-col justify-between overflow-hidden shadow-lg transition-colors ${
                                isPublished ? "border-emerald-500/40" : "border-[#1E1E1E]"
                              }`}
                            >
                              <div>
                                {/* Post Card Header */}
                                <div className="p-3 bg-[#111111] border-b border-[#1A1A1A] flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    {getPlatformIcon(post.platform)}
                                    <span className="font-mono text-xs uppercase tracking-wide text-zinc-200 font-medium">
                                      {getPlatformLabel(post.platform)}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                                      isPublished
                                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1"
                                        : isScheduled
                                        ? "bg-amber-950/50 text-amber-300 border border-amber-500/30"
                                        : "bg-white/10 text-white border border-white/20"
                                    }`}
                                  >
                                    {isPublished && <CheckCircle2 className="w-2.5 h-2.5" />}
                                    <span>{post.status.toUpperCase()}</span>
                                  </span>
                                </div>

                                {/* Adapter Routing Badge */}
                                <div className="px-3.5 py-1.5 bg-[#0D0D0D] border-b border-[#181818] flex items-center justify-between text-[10px] font-mono">
                                  {matchingAdapter ? (
                                    <div className="flex items-center space-x-1.5 text-emerald-400">
                                      <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                                      <span className="truncate">
                                        Live: {matchingAdapter.adapter_name} ({matchingAdapter.config_type.toUpperCase()})
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-1.5 text-zinc-500">
                                      <Plug className="w-3 h-3 text-zinc-500 shrink-0" />
                                      <span>Fallback Simulator</span>
                                    </div>
                                  )}
                                  <span className="text-zinc-600 text-[9px] uppercase">
                                    {matchingAdapter ? "Real API" : "Simulated"}
                                  </span>
                                </div>

                                {/* Media Thumbnail */}
                                <div className="h-44 bg-black flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]">
                                  {mediaUrl ? (
                                    <img
                                      src={mediaUrl}
                                      alt="Thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-zinc-500 text-xs">No media asset</span>
                                  )}
                                </div>

                                {/* Post Body Snippet */}
                                <div className="p-4 space-y-2.5">
                                  {post.title && (
                                    <h4 className="font-medium text-xs text-white line-clamp-1">
                                      {post.title}
                                    </h4>
                                  )}
                                  <p className="text-xs text-zinc-300 line-clamp-3 bg-[#121212] p-2.5 rounded border border-[#202020] leading-relaxed">
                                    {post.copy_primary}
                                  </p>

                                  {/* Publication metadata when published */}
                                  {isPublished && post.publication && (
                                    <div className="p-2.5 rounded-lg bg-[#141414] border border-[#242424] text-[11px] space-y-1">
                                      <div className="flex items-center justify-between text-zinc-300 font-medium">
                                        <span className="text-zinc-500 font-mono text-[10px]">
                                          Dispatch Ref:
                                        </span>
                                        <span className="font-mono text-zinc-300 truncate max-w-[170px]">
                                          {post.publication.external_post_id}
                                        </span>
                                      </div>
                                      <a
                                        href={post.publication.external_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center space-x-1 text-zinc-300 hover:text-white hover:underline"
                                      >
                                        <span className="truncate">
                                          {post.publication.external_url}
                                        </span>
                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions Footer */}
                              <div className="p-3.5 bg-[#101010] border-t border-[#181818] space-y-2.5">
                                {!isPublished ? (
                                  <div className="space-y-2">
                                    {/* Optional Schedule Picker */}
                                    <div className="flex items-center space-x-1.5">
                                      <input
                                        type="datetime-local"
                                        value={scheduledTimes[post.id] || ""}
                                        onChange={(e) =>
                                          setScheduledTimes((prev) => ({
                                            ...prev,
                                            [post.id]: e.target.value,
                                          }))
                                        }
                                        className="flex-1 bg-[#161616] border border-[#262626] rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-white font-mono"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSchedule(post.id)}
                                        className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#252525] text-zinc-200 text-xs rounded border border-[#2C2C2C] font-mono cursor-pointer"
                                      >
                                        Schedule
                                      </button>
                                    </div>

                                    {/* Publish via Channel Adapter */}
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => handlePublish(post.id)}
                                      disabled={isPublishing}
                                      className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 font-medium text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                                    >
                                      <Radio className="w-3.5 h-3.5 text-black" />
                                      <span>
                                        {isPublishing
                                          ? "Dispatching Adapter..."
                                          : matchingAdapter
                                          ? `Publish via ${matchingAdapter.adapter_name}`
                                          : `Publish via Channel Adapter`}
                                      </span>
                                    </motion.button>
                                  </div>
                                ) : (
                                  /* Published State: Live badge + UNPUBLISH Button */
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-center space-x-1.5 py-1.5 text-xs text-emerald-400 font-mono font-medium bg-emerald-950/40 rounded-full border border-emerald-500/30">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Live on {getPlatformLabel(post.platform)} (In Analytics)</span>
                                    </div>

                                    {/* Turns into Unpublish Button */}
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => handleUnpublish(post.id)}
                                      disabled={isUnpublishing}
                                      className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-full bg-[#181818] hover:bg-red-950/60 text-zinc-300 hover:text-red-300 border border-[#2D2D2D] hover:border-red-500/40 font-medium text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                      title="Unpublish post from platform adapter and remove from live analytics"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>
                                        {isUnpublishing ? "Unpublishing..." : "Unpublish"}
                                      </span>
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
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
