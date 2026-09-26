"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api } from "@/lib/api";
import {
  Send,
  Calendar,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Zap
} from "lucide-react";

export const PublisherWorkspace: React.FC = () => {
  const { activeCampaign, refreshCampaigns, setActiveTab } = useCampaign();

  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [scheduledTimes, setScheduledTimes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const posts = activeCampaign?.posts || [];
  const approvedPosts = posts.filter(
    (p) => p.status === "approved" || p.status === "scheduled" || p.status === "published"
  );
  const unapprovedCount = posts.filter((p) => p.status !== "approved" && p.status !== "published").length;

  const handlePublish = async (postId: string) => {
    setPublishingPostId(postId);
    setMessage(null);
    try {
      const pub = await api.publishPost(postId);
      await refreshCampaigns();
      setMessage(`Published successfully: ${pub.external_post_id}`);
    } catch (err: any) {
      setMessage(`Publish failed: ${err.message}`);
    } finally {
      setPublishingPostId(null);
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

  const handleSeedMetrics = async () => {
    if (!activeCampaign) return;
    try {
      const res = await api.seedMetrics(activeCampaign.id);
      setMessage(res.message);
      await refreshCampaigns();
    } catch (err: any) {
      setMessage(`Error seeding metrics: ${err.message}`);
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
            Dispatches approved assets through mock channel adapters (Instagram, YouTube, X).
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeedMetrics}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-zinc-200 border border-[#2B2B2B] text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Simulate Engagement Metrics</span>
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
        <div className="p-3 rounded-lg bg-[#141414] border border-white/20 text-xs font-mono text-zinc-200">
          {message}
        </div>
      )}

      {/* Unapproved Warning */}
      {unapprovedCount > 0 && (
        <div className="p-3.5 rounded-xl bg-[#121212] border border-white/20 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-white shrink-0" />
            <span>
              {unapprovedCount} post(s) currently awaiting Human Editorial Review in Step 3 and blocked from publishing.
            </span>
          </div>
          <button
            onClick={() => setActiveTab("review")}
            className="font-medium underline ml-2 hover:text-white cursor-pointer"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Approved Content Queue */}
      {approvedPosts.length === 0 ? (
        <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
          <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
          <h3 className="text-sm font-medium text-zinc-300">No Approved Posts Ready</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Content must be explicitly approved by a human operator in the Review tab before entering the publishing queue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedPosts.map((post) => {
            const isPublished = post.status === "published";
            const isScheduled = post.status === "scheduled";
            const mediaUrl = api.getMediaUrl(post.asset?.public_url);

            return (
              <motion.div
                key={post.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] flex flex-col justify-between overflow-hidden shadow-lg"
              >
                <div>
                  <div className="p-3.5 bg-[#111111] border-b border-[#1A1A1A] flex items-center justify-between text-xs">
                    <span className="font-mono text-xs uppercase tracking-wide text-zinc-200">
                      {post.platform.replace("_", " ")} Adapter
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                        isPublished
                          ? "bg-white/10 text-white border border-white/20"
                          : isScheduled
                          ? "bg-white/5 text-zinc-300 border border-white/10"
                          : "bg-white/10 text-white border border-white/20"
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="h-44 bg-black flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-zinc-500 text-xs">No media asset</span>
                    )}
                  </div>

                  <div className="p-4 space-y-2.5">
                    {post.title && (
                      <h4 className="font-medium text-xs text-white line-clamp-1">{post.title}</h4>
                    )}
                    <p className="text-xs text-zinc-300 line-clamp-3 bg-[#141414] p-2.5 rounded border border-[#222222]">
                      {post.copy_primary}
                    </p>

                    {/* Publication details if published */}
                    {isPublished && post.publication && (
                      <div className="p-2.5 rounded-lg bg-[#141414] border border-[#242424] text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-zinc-300 font-medium">
                          <span className="text-zinc-500 font-mono text-[10px]">Mock Endpoint:</span>
                          <span className="font-mono">{post.publication.external_post_id}</span>
                        </div>
                        <a
                          href={post.publication.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-zinc-300 hover:text-white hover:underline"
                        >
                          <span className="truncate">{post.publication.external_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduling & Publish Actions */}
                <div className="p-3.5 bg-[#111111] border-t border-[#1A1A1A] space-y-2.5">
                  {!isPublished && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="datetime-local"
                          value={scheduledTimes[post.id] || ""}
                          onChange={(e) =>
                            setScheduledTimes((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          className="flex-1 bg-[#161616] border border-[#262626] rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-white"
                        />
                        <button
                          onClick={() => handleSchedule(post.id)}
                          className="px-3 py-1 bg-[#1C1C1C] hover:bg-[#252525] text-zinc-200 text-xs rounded border border-[#2C2C2C] font-medium cursor-pointer"
                        >
                          Schedule
                        </button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePublish(post.id)}
                        disabled={publishingPostId === post.id}
                        className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 font-medium text-xs transition-all shadow-md cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-black" />
                        <span>
                          {publishingPostId === post.id
                            ? "Dispatching Adapter..."
                            : "Publish via Channel Adapter"}
                        </span>
                      </motion.button>
                    </div>
                  )}

                  {isPublished && (
                    <div className="flex items-center justify-center space-x-1.5 py-1.5 text-xs text-white font-medium bg-white/10 rounded-full border border-white/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Live on Platform</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
