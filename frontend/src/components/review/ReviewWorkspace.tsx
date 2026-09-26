"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api } from "@/lib/api";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Sparkles,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const ReviewWorkspace: React.FC = () => {
  const { activeCampaign, refreshCampaigns, setActiveTab } = useCampaign();

  const posts = activeCampaign?.posts || [];
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    posts.length > 0 ? posts[0].id : null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activePost = posts.find((p) => p.id === selectedPostId) || posts[0];

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
        return <Sliders className="w-4 h-4 text-white" />;
    }
  };

  const handleApprove = async (postId: string) => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      await api.approvePost(postId, "editorial_lead", "Passed deterministic platform checks and editorial quality standard.");
      await refreshCampaigns();
      setActionMessage("✓ Post signed off and moved to Approved state.");
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (postId: string) => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      await api.rejectPost(postId, "editorial_lead", "Requires creative refinement or copy adjustment.");
      await refreshCampaigns();
      setActionMessage("Post marked as Rejected for re-generation.");
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeCampaign || posts.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
        <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-zinc-300">No Posts to Review</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Generate campaign content in Step 1 & 2 before entering the Human Approval Gate.
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

  const mediaUrl = api.getMediaUrl(activePost?.asset?.public_url);
  const valResult = activePost?.validation_results?.[0];
  const isValPassed = valResult?.status === "passed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Step 3: Human Approval & Deterministic QC Gate</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Human Editorial Review Workspace
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hard system rule: Nothing can be scheduled or published without passing deterministic QC and explicit human sign-off.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("publisher")}
          className="flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow-md cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
        >
          <span>Go to Publisher</span>
          <ArrowRight className="w-3.5 h-3.5 text-black" />
        </motion.button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-[#141414] border border-white/20 text-xs font-mono text-zinc-200">
          {actionMessage}
        </div>
      )}

      {/* Post Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {posts.map((p) => {
          const isSelected = p.id === activePost?.id;
          const pValPassed = p.validation_results?.some((v) => v.status === "passed");

          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedPostId(p.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#141414] border-white shadow-lg"
                  : "bg-[#0C0C0C] border-[#1E1E1E] hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs uppercase text-zinc-200 tracking-wide">
                  {p.platform.replace("_", " ")}
                </span>
                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                    pValPassed
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-black text-zinc-400 border border-dashed border-zinc-700"
                  }`}
                >
                  {pValPassed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">{p.copy_primary}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Review Comparison Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Creative & Copy Preview */}
        <div className="lg:col-span-7 bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between bg-[#111111]">
              <div className="flex items-center space-x-2">
                {getPlatformIcon(activePost.platform)}
                <span className="font-medium text-xs text-white capitalize">
                  {activePost.platform.replace("_", " ")} Adaptation
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[10px]">
                <span className="text-zinc-500 uppercase">Status:</span>
                <span className="text-white font-medium uppercase">{activePost.status}</span>
              </div>
            </div>

            {/* Media Asset Preview */}
            <div className="relative bg-black aspect-video flex items-center justify-center border-b border-[#1A1A1A] overflow-hidden">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={activePost.asset?.prompt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-500 text-xs">No visual asset found</div>
              )}
              {activePost.asset && (
                <div className="absolute top-2 left-2 flex items-center space-x-1.5 font-mono text-[10px] bg-black/80 text-zinc-300 px-2 py-0.5 rounded border border-white/10">
                  <span>Aspect: {activePost.asset.aspect_ratio}</span>
                  <span>•</span>
                  <span>{activePost.asset.width}x{activePost.asset.height}</span>
                </div>
              )}
            </div>

            {/* Platform Copy Body */}
            <div className="p-5 space-y-4">
              {activePost.title && (
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                    Title ({activePost.platform})
                  </span>
                  <h3 className="font-medium text-sm text-zinc-100">{activePost.title}</h3>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Primary Native Copy ({activePost.language})
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {activePost.copy_primary.length} characters
                    {activePost.platform === "x_twitter" && " (limit: 280)"}
                  </span>
                </div>
                <div className="bg-[#141414] p-3.5 rounded-lg border border-[#222222] text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                  {activePost.copy_primary}
                </div>
              </div>

              {activePost.copy_secondary && (
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                    English / Secondary Translation
                  </span>
                  <p className="text-xs text-zinc-400 italic bg-[#141414] p-3 rounded-lg border border-[#222222]">
                    {activePost.copy_secondary}
                  </p>
                </div>
              )}

              {/* Hashtags and CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#1A1A1A]">
                <div className="flex flex-wrap gap-1">
                  {activePost.hashtags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-zinc-300 bg-[#161616] px-2 py-0.5 rounded border border-[#2A2A2A]"
                    >
                      #{tag.replace("#", "")}
                    </span>
                  ))}
                </div>

                <div className="text-xs font-mono text-zinc-400">
                  <span className="text-zinc-500 mr-1.5 uppercase text-[10px]">Call To Action:</span>
                  <span className="text-white font-medium">{activePost.cta}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Deterministic Validation Checks & Human Sign-Off Gate */}
        <div className="lg:col-span-5 space-y-4">
          {/* Deterministic Validation Results Panel */}
          <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-zinc-200">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider">
                  Deterministic QC Engine
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                  isValPassed
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-black text-zinc-400 border border-dashed border-zinc-700"
                }`}
              >
                {isValPassed ? "ALL CHECKS PASSED" : "VALIDATION FAILED"}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {valResult?.rules_checked?.map((check, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#141414] border border-[#222222] flex items-start justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      {check.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                      <span className="font-medium text-zinc-200 capitalize">
                        {check.rule.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 pl-5">{check.message}</p>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 shrink-0 pl-2">
                    {String(check.actual)}
                  </span>
                </div>
              ))}
            </div>

            {valResult?.error_summary && (
              <div className="p-2.5 rounded-lg bg-[#181818] border border-white/20 text-zinc-300 text-xs">
                <strong>Errors:</strong> {valResult.error_summary}
              </div>
            )}
          </div>

          {/* Approval Decision Panel */}
          <div className="p-5 rounded-xl bg-[#0C0C0C] border border-[#1E1E1E] space-y-3">
            <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider block">
              Human Review Decision
            </span>
            <p className="text-xs text-zinc-400">
              Current State:{" "}
              <span className="font-mono font-medium text-white uppercase">{activePost.status}</span>
              {activePost.iteration_number > 1 && (
                <span className="text-zinc-400 font-mono ml-2">(Iteration {activePost.iteration_number})</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApprove(activePost.id)}
                disabled={!isValPassed || isProcessing || activePost.status === "approved"}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>{activePost.status === "approved" ? "Approved ✓" : "Sign Off / Approve"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReject(activePost.id)}
                disabled={isProcessing || activePost.status === "rejected"}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-full bg-transparent hover:bg-white/5 text-zinc-300 border border-zinc-700 hover:border-zinc-500 font-medium text-xs transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
              >
                <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Reject</span>
              </motion.button>
            </div>

            {!isValPassed && (
              <p className="text-[11px] text-zinc-400 font-mono mt-1">
                ⚠️ This post failed deterministic validation and cannot be approved until resolved.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
