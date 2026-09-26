"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaign } from "@/context/CampaignContext";
import { api, PlatformPost } from "@/lib/api";
import { Campaign } from "@/types";
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
  AlertCircle,
  SlidersHorizontal,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const StudioWorkspace: React.FC = () => {
  const {
    campaigns,
    activeCampaign,
    activeCampaignId,
    setActiveCampaignId,
    isGenerating,
    generationProgress,
    setActiveTab,
    triggerGeneration,
    updatePostContent,
    regeneratePostText,
    regeneratePostImage,
    uploadPostAsset,
    deletePost,
    sendCampaignToReview,
    refreshCampaigns,
    refreshActiveCampaign,
    activeTextLimits,
  } = useCampaign();

  // Collapsible state for campaigns: map of campaignId -> boolean
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});

  // Initialize all campaigns as expanded by default or keep active campaign expanded
  useEffect(() => {
    if (campaigns.length > 0) {
      setExpandedCampaigns((prev) => {
        const next = { ...prev };
        campaigns.forEach((c) => {
          if (next[c.id] === undefined) {
            // Default active campaign or first campaign to open, others open too for easy browsing
            next[c.id] = true;
          }
        });
        return next;
      });
    }
  }, [campaigns]);

  const toggleCampaignCollapse = (campaignId: string) => {
    setExpandedCampaigns((prev) => ({
      ...prev,
      [campaignId]: !prev[campaignId],
    }));
  };

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
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [uploadingPostId, setUploadingPostId] = useState<string | null>(null);
  const [sendingReviewId, setSendingReviewId] = useState<string | null>(null);

  // Hidden File Input for Custom Image Upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetPostId, setUploadTargetPostId] = useState<string | null>(null);

  // Individual Regeneration Modal State
  const [modalType, setModalType] = useState<"text" | "image" | null>(null);
  const [activeModalPost, setActiveModalPost] = useState<PlatformPost | null>(null);
  const [modalTextInstruction, setModalTextInstruction] = useState<string>("");
  const [modalTextMaxWords, setModalTextMaxWords] = useState<string>("");
  const [modalImagePrompt, setModalImagePrompt] = useState<string>("");
  const [modalImageAspect, setModalImageAspect] = useState<string>("1:1");

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
      showNotification("Post successfully saved & rules re-validated!");
    } catch (err: any) {
      alert(`Failed to save edits: ${err.message || err}`);
    } finally {
      setIsSaving(false);
      setActiveActionPostId(null);
    }
  };

  // Delete post handler with confirmation
  const handleDeletePost = async (post: PlatformPost) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the ${getPlatformLabel(post.platform)} post? This action will remove the copy and visual asset.`
    );
    if (!confirmDelete) return;

    setDeletingPostId(post.id);
    try {
      await deletePost(post.id);
      showNotification(`Deleted ${getPlatformLabel(post.platform)} post.`);
    } catch (err: any) {
      alert(`Failed to delete post: ${err.message || err}`);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Trigger custom image file upload picker
  const handleTriggerUpload = (postId: string) => {
    setUploadTargetPostId(postId);
    fileInputRef.current?.click();
  };

  // Process chosen file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetPostId) return;

    setUploadingPostId(uploadTargetPostId);
    showNotification(`Uploading "${file.name}"...`);
    try {
      await uploadPostAsset(uploadTargetPostId, file);
      showNotification("✓ Custom image uploaded and updated!");
    } catch (err: any) {
      alert(`Image upload failed: ${err.message || err}`);
    } finally {
      setUploadingPostId(null);
      setUploadTargetPostId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
      await refreshCampaigns();
      await refreshActiveCampaign();
      showNotification("Copy successfully regenerated & saved!");
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
      await refreshCampaigns();
      await refreshActiveCampaign();
      showNotification("Visual asset regenerated & saved!");
    } catch (err: any) {
      alert(`Visual regeneration failed: ${err.message || err}`);
    } finally {
      setActiveActionPostId(null);
      setActiveModalPost(null);
    }
  };

  // Universal Review Action: Send entire campaign to Review Gate
  const handleSendEntireCampaignToReview = async (campaignId: string) => {
    if (editingPostId) {
      await handleSaveEdit(editingPostId);
    }
    setSendingReviewId(campaignId);
    try {
      await sendCampaignToReview(campaignId);
      showNotification("✓ Entire campaign sent to Review Gate for human verification!");
    } catch (err: any) {
      alert(`Failed to send campaign to review: ${err.message || err}`);
    } finally {
      setSendingReviewId(null);
    }
  };

  // Campaigns to display: if campaigns array has items, use it; otherwise fallback to activeCampaign
  const displayCampaigns: Campaign[] =
    campaigns.length > 0
      ? campaigns.map((c) => (c.id === activeCampaign?.id ? activeCampaign : c))
      : activeCampaign
      ? [activeCampaign]
      : [];

  if (displayCampaigns.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0C0C0C] rounded-xl border border-[#1E1E1E]">
        <Sliders className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-medium text-zinc-300">No Active Campaigns</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Create a campaign brief first or select an existing campaign to inspect generated creative assets.
        </p>
        <button
          onClick={() => setActiveTab("brief")}
          className="mt-4 px-5 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Go to Brief Creation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hidden file input for custom uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

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
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>Step 2: Edit Campaign</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Edit & Refine Campaigns
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage multiple campaigns, upload custom photography, edit copy, or regenerate platform posts, and send batches to the Review Gate.
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
            <span>{isGenerating ? "Generating Run..." : "Regenerate Active Campaign"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("review")}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow-md cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Go to Review Gate</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
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

      {/* Global Platform Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1E1E1E] pb-3">
        <span className="text-xs text-zinc-400 mr-2 font-mono">Platform Filter:</span>
        <button
          onClick={() => setSelectedPlatform("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            selectedPlatform === "all"
              ? "bg-white text-black"
              : "bg-[#121212] border border-[#242424] text-zinc-400 hover:text-white"
          }`}
        >
          All Platforms
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

      {/* Multiple Campaigns Collapsible Container */}
      <div className="space-y-6">
        {displayCampaigns.map((camp) => {
          const isExpanded = expandedCampaigns[camp.id] !== false; // Default true
          const isActive = camp.id === activeCampaignId;
          const campPosts = camp.posts || [];
          const filteredPosts =
            selectedPlatform === "all"
              ? campPosts
              : campPosts.filter((p) => p.platform === selectedPlatform);
          const strategy = camp.strategy;
          const isSendingThis = sendingReviewId === camp.id;

          return (
            <div
              key={camp.id}
              className={`rounded-2xl border transition-all ${
                isActive
                  ? "bg-[#0A0A0A] border-white/30 shadow-xl"
                  : "bg-[#090909] border-[#1C1C1C] hover:border-[#2C2C2C]"
              }`}
            >
              {/* Campaign Collapsible Accordion Header */}
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#181818]">
                <div
                  onClick={() => {
                    setActiveCampaignId(camp.id);
                    toggleCampaignCollapse(camp.id);
                  }}
                  className="cursor-pointer flex items-start space-x-3.5 flex-1 select-none"
                >
                  <button
                    type="button"
                    className="mt-0.5 p-2 rounded-lg bg-[#181818] hover:bg-[#242424] border border-[#2B2B2B] text-zinc-300 hover:text-white shrink-0 flex items-center justify-center transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-medium text-white tracking-tight">
                        {camp.title}
                      </h2>
                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-medium">
                          ACTIVE
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-zinc-400 border border-[#2B2B2B] uppercase">
                        {camp.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141414] text-zinc-500 border border-[#222]">
                        {campPosts.length} {campPosts.length === 1 ? "Post" : "Posts"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-1 max-w-2xl font-sans">
                      Brief: {camp.brief}
                    </p>
                  </div>
                </div>

                {/* Campaign Universal Actions */}
                <div className="flex items-center space-x-2.5 shrink-0">
                  {/* Universal Review Button: Sends Entire Campaign to Review Gate */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendEntireCampaignToReview(camp.id)}
                    disabled={isSendingThis || campPosts.length === 0}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    title="Send all posts of this campaign to the Human Approval & QC Gate"
                  >
                    {isSendingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    )}
                    <span>{isSendingThis ? "Sending..." : "Send Campaign to Review Gate"}</span>
                  </motion.button>

                  {/* Regenerate this Campaign Button */}
                  <button
                    type="button"
                    onClick={() => triggerGeneration(undefined, camp.id)}
                    disabled={isGenerating}
                    className="p-2 rounded-full bg-[#141414] hover:bg-[#202020] border border-[#2B2B2B] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Regenerate all 3 platform posts for this campaign"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGenerating && isActive ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Collapsible Content Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-6"
                  >
                    {/* AI Strategy Blueprint */}
                    {strategy && (
                      <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1E1E1E] space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 text-white">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                            <span className="text-[11px] font-mono font-medium uppercase tracking-wider">
                              AI Creative Blueprint ({camp.primary_language})
                            </span>
                          </div>

                          {activeTextLimits && (activeTextLimits.max_words || activeTextLimits.max_characters) && (
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono text-zinc-300">
                              <SlidersHorizontal className="w-3 h-3 text-white" />
                              <span>
                                Limits: {activeTextLimits.max_words ? `Max ${activeTextLimits.max_words}w` : ""}
                                {activeTextLimits.max_characters ? ` • Max ${activeTextLimits.max_characters}c` : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                            <span className="text-zinc-500 font-mono uppercase tracking-wider block text-[10px] mb-0.5">
                              Theme
                            </span>
                            <p className="font-normal text-zinc-200 line-clamp-2">{strategy.overall_theme}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                            <span className="text-zinc-500 font-mono uppercase tracking-wider block text-[10px] mb-0.5">
                              Hook
                            </span>
                            <p className="font-normal text-zinc-200 line-clamp-2">{strategy.core_hook}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-[#141414] border border-[#242424]">
                            <span className="text-zinc-500 font-mono uppercase tracking-wider block text-[10px] mb-0.5">
                              Resonance
                            </span>
                            <p className="font-normal text-zinc-200 line-clamp-2">{strategy.emotional_resonance}</p>
                          </div>
                        </div>

                        {strategy.creative_direction && (
                          <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-[#1C1C1C]">
                            "{strategy.creative_direction}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Platform Post Cards Grid */}
                    {filteredPosts.length === 0 ? (
                      <div className="p-8 text-center bg-[#111111] rounded-xl border border-[#222222]">
                        <p className="text-xs text-zinc-400">
                          No posts generated for this campaign yet. Click the Regenerate button above to trigger AI generation.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => {
                          const mediaUrl = api.getMediaUrl(post.asset?.public_url);
                          const valPassed = post.validation_results?.some((v) => v.status === "passed");
                          const isEditing = editingPostId === post.id;
                          const isActing = activeActionPostId === post.id;
                          const isDeleting = deletingPostId === post.id;
                          const isUploading = uploadingPostId === post.id;

                          return (
                            <motion.div
                              key={post.id}
                              whileHover={{ y: isEditing ? 0 : -3 }}
                              transition={{ duration: 0.2 }}
                              className={`bg-[#0C0C0C] rounded-xl border flex flex-col justify-between overflow-hidden transition-all shadow-lg group relative ${
                                isEditing
                                  ? "border-white/50 ring-1 ring-white/20"
                                  : "border-[#1E1E1E] hover:border-[#333333]"
                              }`}
                            >
                              {/* Overlay for actions / uploads / deletions */}
                              {(isActing || isDeleting || isUploading) && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
                                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                                  <span className="text-xs font-mono text-zinc-200">
                                    {isDeleting
                                      ? "Deleting post..."
                                      : isUploading
                                      ? "Uploading custom image..."
                                      : "Processing update & saving..."}
                                  </span>
                                </div>
                              )}

                              <div>
                                {/* Card Header */}
                                <div className="p-3.5 border-b border-[#1A1A1A] flex items-center justify-between bg-[#111111]">
                                  <div className="flex items-center space-x-2">
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

                                {/* Quick Action Bar: Edit, Regen Copy, Regen Image, Upload Image, Delete */}
                                <div className="px-3 py-2 bg-[#141414] border-b border-[#1F1F1F] flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-mono">
                                  <div className="flex items-center space-x-1.5">
                                    <button
                                      type="button"
                                      onClick={() => (isEditing ? handleCancelEdit() : handleStartEdit(post))}
                                      className={`px-2 py-0.5 rounded flex items-center space-x-1 transition-colors cursor-pointer ${
                                        isEditing
                                          ? "bg-white text-black font-medium"
                                          : "bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300"
                                      }`}
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>{isEditing ? "Editing" : "Edit"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenRegenTextModal(post)}
                                      className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                                      title="Regenerate copy with AI"
                                    >
                                      <FileText className="w-3 h-3 text-zinc-400" />
                                      <span>Copy</span>
                                    </button>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    {/* Regen Image */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRegenImageModal(post)}
                                      className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                                      title="Regenerate visual with Pixazo FLUX"
                                    >
                                      <RefreshCw className="w-3 h-3 text-zinc-400" />
                                      <span>Regen Img</span>
                                    </button>

                                    {/* Upload Image Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleTriggerUpload(post.id)}
                                      className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-[#282828] text-zinc-300 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                                      title="Upload your own replacement artwork"
                                    >
                                      <Upload className="w-3 h-3 text-zinc-400" />
                                      <span>Upload Img</span>
                                    </button>

                                    {/* Delete Post Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePost(post)}
                                      className="px-2 py-0.5 rounded bg-[#1E1E1E] hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-transparent hover:border-red-900/50 flex items-center space-x-1 transition-colors cursor-pointer"
                                      title="Delete this platform post"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Media Visual Asset Preview (Change Image overlay button removed!) */}
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
                                      <span>Rendering Visual Asset...</span>
                                    </div>
                                  )}

                                  {/* Aspect Ratio and Provider Badge */}
                                  {post.asset?.aspect_ratio && (
                                    <div className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 bg-black/80 text-zinc-300 rounded border border-white/15 backdrop-blur-sm flex items-center space-x-1.5">
                                      <span>{post.asset.aspect_ratio}</span>
                                      <span>•</span>
                                      <span className={post.asset.provider === "user_upload" ? "text-emerald-400" : "text-zinc-400"}>
                                        {post.asset.provider === "user_upload" ? "Uploaded" : "Flux AI"}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Card Content: Either Direct Edit Form OR Display Mode */}
                                {isEditing ? (
                                  <div className="p-4 space-y-3 bg-[#111111]">
                                    {/* Title Edit (if YouTube or has title) */}
                                    {(post.platform === "youtube" || post.title) && (
                                      <div>
                                        <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                                          Post / YouTube Title
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
                                        rows={5}
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
                                        placeholder="hoichoi, Bengali, Kolkata"
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
                                        className="px-3 py-1.5 rounded-full bg-[#202020] hover:bg-[#2A2A2A] text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
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
                                        <span>{isSaving ? "Saving..." : "Save"}</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Display Mode */
                                  <div className="p-4 space-y-3">
                                    {post.title && (
                                      <div>
                                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-0.5">
                                          Post Title
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
                                        <span className="text-[10px] text-zinc-400 font-mono">
                                          {post.copy_primary.length} chars
                                          {post.platform === "x_twitter" && " / 280"}
                                          {activeTextLimits?.max_characters ? ` [Cap: ${activeTextLimits.max_characters}c]` : ""} •{" "}
                                          {post.copy_primary.trim().split(/\s+/).filter(Boolean).length} words
                                          {activeTextLimits?.max_words ? ` [Cap: ${activeTextLimits.max_words}w]` : ""}
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
                                    className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded bg-[#181818] border border-[#2E2E2E] transition-colors cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveCampaignId(camp.id);
                                      setActiveTab("review");
                                    }}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

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
                className="text-zinc-400 hover:text-white cursor-pointer"
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
                  placeholder="e.g. Focus more on the suspense, make the opening question punchier..."
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
                className="px-4 py-2 rounded-full bg-[#1E1E1E] text-zinc-300 text-xs font-mono hover:bg-[#282828] transition-colors cursor-pointer"
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
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Rerenders a dedicated high-fidelity image using Pixazo FLUX Schnell and saves the asset.
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
                <div className="relative">
                  <select
                    value={modalImageAspect}
                    onChange={(e) => setModalImageAspect(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] rounded-lg pl-3 pr-9 py-2 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-white transition-colors"
                  >
                    <option value="1:1">1:1 (Square Feed • 768x768)</option>
                    <option value="16:9">16:9 (Landscape Thumbnail • 896x512)</option>
                    <option value="4:5">4:5 (Vertical Feed Portrait • 640x800)</option>
                    <option value="9:16">9:16 (Story / Reel • 512x896)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-full bg-[#1E1E1E] text-zinc-300 text-xs font-mono hover:bg-[#282828] transition-colors cursor-pointer"
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
