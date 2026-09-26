"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, PlatformPost } from "@/lib/api";
import {
  Sliders,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Save,
  X,
  FileText,
  Crop,
  Check,
  AlertCircle
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const StudioWorkspace: React.FC = () => {
  const {
    activeCampaign,
    isGenerating,
    generationProgress,
    setActiveTab,
    triggerGeneration,
    updatePostContent,
    regeneratePostText,
    regeneratePostImage,
    refreshActiveCampaign,
  } = useCampaign();

  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  // In-Place Manual Editing State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    copy_primary: string;
    copy_secondary: string;
    hashtags: string;
    cta: string;
  }>({
    title: "",
    copy_primary: "",
    copy_secondary: "",
    hashtags: "",
    cta: "",
  });

  // Action status state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeActionPostId, setActiveActionPostId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Individual Regeneration Modal State
  const [modalType, setModalType] = useState<"text" | "image" | null>(null);
  const [activeModalPost, setActiveModalPost] = useState<PlatformPost | null>(null);
  const [modalTextInstruction, setModalTextInstruction] = useState<string>("");
  const [modalTextMaxWords, setModalTextMaxWords] = useState<string>("");
  const [modalImagePrompt, setModalImagePrompt] = useState<string>("");
  const [modalImageAspect, setModalImageAspect] = useState<string>("1:1");

  const posts = activeCampaign?.posts || [];
  const strategy = activeCampaign?.strategy;

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

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
      case "twitter":
        return "X (Twitter)";
      default:
        return platform;
    }
  };

  const filteredPosts =
    selectedPlatform === "all"
      ? posts
      : posts.filter((p) => p.platform === selectedPlatform);

  // Start in-place editing for a post
  const handleStartEdit = (post: PlatformPost) => {
    setEditingPostId(post.id);
    setEditForm({
      title: post.title || "",
      copy_primary: post.copy_primary || "",
      copy_secondary: post.copy_secondary || "",
      hashtags: post.hashtags ? post.hashtags.join(", ") : "",
      cta: post.cta || "",
    });
  };

  // Cancel in-place editing
  const handleCancelEdit = () => {
    setEditingPostId(null);
  };

  // Save manual edits directly to Supabase
  const handleSaveEdit = async (postId: string) => {
    setIsSaving(true);
    setActiveActionPostId(postId);
    try {
      const hashtagsArray = editForm.hashtags
        .split(",")
        .map((h) => h.trim().replace(/^#/, ""))
        .filter((h) => h.length > 0);

      await updatePostContent(postId, {
        title: editForm.title || null,
        copy_primary: editForm.copy_primary,
        copy_secondary: editForm.copy_secondary || null,
        hashtags: hashtagsArray,
        cta: editForm.cta,
      });

      setEditingPostId(null);
      showNotification("Post successfully updated in Supabase & deterministic QC rules re-validated!");
    } catch (err: any) {
      alert(`Failed to save edits: ${err.message || err}`);
    } finally {
      setIsSaving(false);
      setActiveActionPostId(null);
    }
  };

  // Open modal for regenerating text only
  const handleOpenRegenTextModal = (post: PlatformPost) => {
    setActiveModalPost(post);
    setModalType("text");
    setModalTextInstruction("");
    setModalTextMaxWords("");
  };

  // Confirm text-only regeneration
  const handleConfirmRegenText = async () => {
    if (!activeModalPost) return;
    const postId = activeModalPost.id;
    setModalType(null);
    setActiveActionPostId(postId);

    try {
      await regeneratePostText(postId, {
        instruction: modalTextInstruction || undefined,
        max_words: modalTextMaxWords ? parseInt(modalTextMaxWords, 10) : undefined,
      });
      await refreshActiveCampaign();
      showNotification("Copy successfully regenerated & saved to Supabase!");
    } catch (err: any) {
      alert(`Text regeneration failed: ${err.message || err}`);
    } finally {
      setActiveActionPostId(null);
      setActiveModalPost(null);
    }
  };

  // Open modal for regenerating image only
  const handleOpenRegenImageModal = (post: PlatformPost) => {
    setActiveModalPost(post);
    setModalType("image");
    setModalImagePrompt(post.asset?.prompt || "");
    setModalImageAspect(post.asset?.aspect_ratio || (post.platform === "instagram" ? "1:1" : "16:9"));
  };

  // Confirm image-only regeneration
  const handleConfirmRegenImage = async () => {
    if (!activeModalPost) return;
    const postId = activeModalPost.id;
    setModalType(null);
    setActiveActionPostId(postId);

    try {
      await regeneratePostImage(postId, {
        prompt: modalImagePrompt || undefined,
        aspect_ratio: modalImageAspect,
      });
      await refreshActiveCampaign();
      showNotification("Visual asset regenerated via Pixazo FLUX & stored in Supabase!");
    } catch (err: any) {
      alert(`Visual regeneration failed: ${err.message || err}`);
    } finally {
      setActiveActionPostId(null);
      setActiveModalPost(null);
    }
  };

  // Finalize & proceed to Human Review
  const handleProceedToReview = async () => {
    if (editingPostId) {
      await handleSaveEdit(editingPostId);
    }
    await refreshActiveCampaign();
    setActiveTab("review");
  };

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
      {/* Toast Notification */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-lg bg-zinc-900 border border-white/30 text-white text-xs flex items-center justify-between shadow-2xl"
          >
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-white" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            <span>{isGenerating ? "Regenerating..." : "Regenerate Full Run"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceedToReview}
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
        isGenerating ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {["Instagram (1:1)", "YouTube Community (16:9)", "X / Twitter (16:9)"].map((p, idx) => (
              <div key={idx} className="bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] p-5 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-[#1E1E1E] rounded w-24"></div>
                  <div className="h-4 bg-[#1E1E1E] rounded-full w-12"></div>
                </div>
                <div className="w-full aspect-square max-h-56 bg-[#161616] rounded-lg flex flex-col items-center justify-center border border-[#222] gap-2">
                  <Sparkles className="w-6 h-6 text-zinc-500 animate-spin" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Synthesizing Creative Visual</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[#1E1E1E] rounded w-3/4"></div>
                  <div className="h-3 bg-[#161616] rounded w-full"></div>
                  <div className="h-3 bg-[#161616] rounded w-5/6"></div>
                </div>
                <div className="pt-2 text-[11px] font-mono text-zinc-400 flex items-center justify-between border-t border-[#1C1C1C]">
                  <span>{p}</span>
                  <span className="text-zinc-500 text-[10px]">Processing...</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
            <p className="text-xs text-zinc-400">
              No posts generated for this campaign yet. Click "Regenerate Full Run" above to trigger AI generation.
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const mediaUrl = api.getMediaUrl(post.asset?.public_url);
            const valPassed = post.validation_results?.some((v) => v.status === "passed");
            const isEditing = editingPostId === post.id;
            const isActing = activeActionPostId === post.id;

            return (
              <motion.div
                key={post.id}
                whileHover={{ y: isEditing ? 0 : -3 }}
                transition={{ duration: 0.2 }}
                className={`bg-[#0C0C0C] rounded-xl border flex flex-col justify-between overflow-hidden transition-all shadow-lg group relative ${
                  isEditing ? "border-white/50 ring-1 ring-white/20" : "border-[#1E1E1E] hover:border-[#333333]"
                }`}
              >
                {/* Busy overlay for individual actions */}
                {isActing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                    <span className="text-xs font-mono text-zinc-200">
                      Processing update & syncing with Supabase...
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveActionPostId(null)}
                      className="text-[10px] font-mono text-zinc-500 hover:text-white underline pt-1 cursor-pointer"
                    >
                      Dismiss Overlay
                    </button>
                  </div>
                )}

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

                  {/* Individual Regeneration Quick Bar */}
                  <div className="px-3 py-2 bg-[#141414] border-b border-[#1F1F1F] flex items-center justify-between gap-1.5 text-[11px] font-mono">
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => (isEditing ? handleCancelEdit() : handleStartEdit(post))}
                        className={`px-2 py-0.5 rounded flex items-center space-x-1 transition-colors ${
                          isEditing
                            ? "bg-white text-black font-medium"
                            : "bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300"
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditing ? "Editing..." : "Edit Manually"}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenRegenTextModal(post)}
                        className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Regenerate only copy text"
                      >
                        <FileText className="w-3 h-3 text-zinc-400" />
                        <span>Regen Copy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenRegenImageModal(post)}
                        className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Regenerate only image"
                      >
                        <ImageIcon className="w-3 h-3 text-zinc-400" />
                        <span>Regen Image</span>
                      </button>
                    </div>
                  </div>

                  {/* Media Visual Asset Preview */}
                  <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden border-b border-[#1A1A1A]">
                    {mediaUrl ? (
                      <img
                        key={post.asset?.id || post.asset?.public_url || post.id}
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

                    {/* Quick overlay to regenerate image */}
                    <button
                      type="button"
                      onClick={() => handleOpenRegenImageModal(post)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-black/80 hover:bg-black text-[10px] font-mono text-zinc-200 rounded border border-white/20 flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-white" />
                      <span>Change Image</span>
                    </button>
                  </div>

                  {/* Card Content: Either Direct Edit Form OR Display Mode */}
                  {isEditing ? (
                    <div className="p-4 space-y-3 bg-[#111111]">
                      {/* Title Edit (if applicable) */}
                      {(post.platform === "youtube" || post.title) && (
                        <div>
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                            YouTube Title (SEO)
                          </label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({ ...editForm, title: e.target.value })
                            }
                            className="w-full bg-[#181818] border border-[#333] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      )}

                      {/* Primary Copy Edit */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase">
                            Primary Copy ({post.language})
                          </label>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {editForm.copy_primary.length} chars •{" "}
                            {editForm.copy_primary.trim().split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <textarea
                          rows={6}
                          value={editForm.copy_primary}
                          onChange={(e) =>
                            setEditForm({ ...editForm, copy_primary: e.target.value })
                          }
                          className="w-full bg-[#181818] border border-[#333] rounded p-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-sans leading-relaxed"
                        />
                      </div>

                      {/* Secondary Copy Edit */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          Secondary Context / Translation
                        </label>
                        <input
                          type="text"
                          value={editForm.copy_secondary}
                          onChange={(e) =>
                            setEditForm({ ...editForm, copy_secondary: e.target.value })
                          }
                          className="w-full bg-[#181818] border border-[#333] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* Hashtags Edit */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          Hashtags (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={editForm.hashtags}
                          onChange={(e) =>
                            setEditForm({ ...editForm, hashtags: e.target.value })
                          }
                          placeholder="e.g. hoichoi, KolkataMystery, Bangla"
                          className="w-full bg-[#181818] border border-[#333] rounded px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* CTA Edit */}
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                          Call To Action (CTA)
                        </label>
                        <input
                          type="text"
                          value={editForm.cta}
                          onChange={(e) =>
                            setEditForm({ ...editForm, cta: e.target.value })
                          }
                          className="w-full bg-[#181818] border border-[#333] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* Edit Mode Save & Cancel Actions */}
                      <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#222]">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-full bg-[#202020] hover:bg-[#2A2A2A] text-zinc-300 text-xs font-mono transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={isSaving}
                          className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5 text-black" />
                          <span>{isSaving ? "Saving..." : "Save to Supabase"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
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
                            {post.copy_primary.length} chars •{" "}
                            {post.copy_primary.trim().split(/\s+/).filter(Boolean).length} words
                            {post.platform === "x_twitter" && " / 280"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans line-clamp-6 bg-[#141414] p-3 rounded-lg border border-[#222222]">
                          {post.copy_primary}
                        </p>
                      </div>

                      {/* Secondary translation or context */}
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
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-[#111111] border-t border-[#1A1A1A] flex items-center justify-between text-xs">
                  <span
                    className={`capitalize font-mono text-[10px] px-2 py-0.5 rounded ${
                      post.status === "approved"
                        ? "text-white bg-white/10 border border-white/20"
                        : post.status === "rejected"
                        ? "text-zinc-400 border border-dashed border-zinc-700"
                        : "text-zinc-300 bg-white/5 border border-white/10"
                    }`}
                  >
                    {post.status.replace("_", " ")}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartEdit(post)}
                      className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded bg-[#181818] border border-[#2E2E2E] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleProceedToReview}
                      className="flex items-center space-x-1 text-zinc-200 hover:text-white text-xs font-medium px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Individual Text Regeneration Modal */}
      {modalType === "text" && activeModalPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-[#2A2A2A] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Regenerate Copy for {getPlatformLabel(activeModalPost.platform)}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              This will synthesize fresh native copy exclusively for this post while keeping your visual image intact.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 uppercase mb-1">
                  Creative Direction / Custom Instruction (Optional)
                </label>
                <textarea
                  rows={3}
                  value={modalTextInstruction}
                  onChange={(e) => setModalTextInstruction(e.target.value)}
                  placeholder="e.g. Focus more on the detective's emotional struggle, or make the opening question punchier..."
                  className="w-full bg-[#181818] border border-[#333] rounded p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 uppercase mb-1">
                  Target Word Count Cap (Optional)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={modalTextMaxWords}
                  onChange={(e) => setModalTextMaxWords(e.target.value)}
                  placeholder="e.g. 75 words"
                  className="w-full bg-[#181818] border border-[#333] rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-full bg-[#1E1E1E] text-zinc-300 text-xs font-mono hover:bg-[#282828] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegenText}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Generate Fresh Copy</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Individual Image Regeneration Modal */}
      {modalType === "image" && activeModalPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-[#2A2A2A] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white" />
                <h3 className="text-sm font-medium text-white">
                  Regenerate Visual for {getPlatformLabel(activeModalPost.platform)}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Rerenders a dedicated high-fidelity image using Pixazo FLUX Schnell and persists the asset directly into Supabase Storage.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 uppercase mb-1">
                  AI Image Prompt (Flux Schnell)
                </label>
                <textarea
                  rows={4}
                  value={modalImagePrompt}
                  onChange={(e) => setModalImagePrompt(e.target.value)}
                  placeholder="Cinematic photographic prompt..."
                  className="w-full bg-[#181818] border border-[#333] rounded p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-300 uppercase mb-1">
                  Aspect Ratio Framing
                </label>
                <select
                  value={modalImageAspect}
                  onChange={(e) => setModalImageAspect(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                >
                  <option value="1:1">1:1 (Square Feed • 768x768)</option>
                  <option value="16:9">16:9 (Landscape Thumbnail • 896x512)</option>
                  <option value="4:5">4:5 (Vertical Feed Portrait • 640x800)</option>
                  <option value="9:16">9:16 (Story / Reel • 512x896)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-full bg-[#1E1E1E] text-zinc-300 text-xs font-mono hover:bg-[#282828] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRegenImage}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-black" />
                <span>Render with Pixazo FLUX</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
