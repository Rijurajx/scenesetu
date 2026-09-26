"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FileCheck,
  Upload,
  RefreshCw,
  Edit3,
  Save,
  Loader2,
  Image as ImageIcon,
  Crop,
  Check,
  RotateCcw
} from "lucide-react";
import { InstagramIcon, YouTubeIcon, XTwitterIcon } from "@/components/common/PlatformIcons";

export const ReviewWorkspace: React.FC = () => {
  const {
    activeCampaign,
    refreshCampaigns,
    setActiveTab,
    updatePostContent,
    regeneratePostText,
    regeneratePostImage,
    uploadPostAsset
  } = useCampaign();

  const posts = activeCampaign?.posts || [];
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    posts.length > 0 ? posts[0].id : null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activePost = posts.find((p) => p.id === selectedPostId) || posts[0];

  // In-place editable fields state for the active post
  const [editTitle, setEditTitle] = useState("");
  const [editCopyPrimary, setEditCopyPrimary] = useState("");
  const [editCopySecondary, setEditCopySecondary] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editCta, setEditCta] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modals for AI text / image regeneration
  const [showTextRegenModal, setShowTextRegenModal] = useState(false);
  const [textRegenInstruction, setTextRegenInstruction] = useState("");
  const [textRegenMaxWords, setTextRegenMaxWords] = useState<string>("");
  const [textRegenMaxChars, setTextRegenMaxChars] = useState<string>("");
  const [isRegeneratingText, setIsRegeneratingText] = useState(false);

  const [showImageRegenModal, setShowImageRegenModal] = useState(false);
  const [imageRegenPrompt, setImageRegenPrompt] = useState("");
  const [imageRegenAspect, setImageRegenAspect] = useState("1:1");
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync edits when activePost changes
  useEffect(() => {
    if (activePost) {
      setEditTitle(activePost.title || "");
      setEditCopyPrimary(activePost.copy_primary || "");
      setEditCopySecondary(activePost.copy_secondary || "");
      setEditHashtags(activePost.hashtags ? activePost.hashtags.map(t => t.startsWith("#") ? t : `#${t}`).join(" ") : "");
      setEditCta(activePost.cta || "");
      setIsDirty(false);
    }
  }, [activePost?.id]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage((prev) => (prev === msg ? null : prev));
    }, 6000);
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
        return <Sliders className="w-4 h-4 text-white" />;
    }
  };

  // Save manual edits to Supabase
  const handleSaveEdits = async () => {
    if (!activePost) return;
    setIsSaving(true);
    try {
      const parsedTags = editHashtags
        .split(/[,\s]+/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      await updatePostContent(activePost.id, {
        title: editTitle.trim() || null,
        copy_primary: editCopyPrimary,
        copy_secondary: editCopySecondary.trim() || null,
        hashtags: parsedTags,
        cta: editCta.trim(),
      });
      await refreshCampaigns();
      setIsDirty(false);
      showNotification("✓ Edits saved to Supabase and re-validated by deterministic QC!");
    } catch (err: any) {
      showNotification(`Error saving edits: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Revert changes back to activePost original
  const handleRevertEdits = () => {
    if (!activePost) return;
    setEditTitle(activePost.title || "");
    setEditCopyPrimary(activePost.copy_primary || "");
    setEditCopySecondary(activePost.copy_secondary || "");
    setEditHashtags(activePost.hashtags ? activePost.hashtags.map(t => t.startsWith("#") ? t : `#${t}`).join(" ") : "");
    setEditCta(activePost.cta || "");
    setIsDirty(false);
  };

  // Handle custom image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePost) return;

    setIsUploadingImage(true);
    showNotification(`Uploading "${file.name}" to Supabase Storage...`);
    try {
      await uploadPostAsset(activePost.id, file);
      await refreshCampaigns();
      showNotification(`✓ Custom image uploaded, stored in Supabase, and linked to ${activePost.platform}!`);
    } catch (err: any) {
      showNotification(`Upload failed: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger AI Text Regeneration
  const handleRegenerateText = async () => {
    if (!activePost) return;
    setIsRegeneratingText(true);
    try {
      const updated = await regeneratePostText(activePost.id, {
        instruction: textRegenInstruction || undefined,
        max_words: textRegenMaxWords ? parseInt(textRegenMaxWords, 10) : undefined,
        max_characters: textRegenMaxChars ? parseInt(textRegenMaxChars, 10) : undefined,
      });
      await refreshCampaigns();
      setShowTextRegenModal(false);
      setTextRegenInstruction("");
      setTextRegenMaxWords("");
      setTextRegenMaxChars("");
      showNotification(`✓ Copy regenerated by Gemini and re-validated!`);
    } catch (err: any) {
      showNotification(`Failed to regenerate text: ${err.message}`);
    } finally {
      setIsRegeneratingText(false);
    }
  };

  // Trigger AI Image Regeneration
  const handleRegenerateImage = async () => {
    if (!activePost) return;
    setIsRegeneratingImage(true);
    try {
      await regeneratePostImage(activePost.id, {
        prompt: imageRegenPrompt || undefined,
        aspect_ratio: imageRegenAspect || undefined,
      });
      await refreshCampaigns();
      setShowImageRegenModal(false);
      setImageRegenPrompt("");
      showNotification(`✓ Visual asset regenerated by Flux and saved!`);
    } catch (err: any) {
      showNotification(`Failed to regenerate image: ${err.message}`);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const handleApprove = async (postId: string) => {
    setIsProcessing(true);
    try {
      await api.approvePost(postId, "editorial_lead", "Passed deterministic platform checks and human editorial sign-off.");
      await refreshCampaigns();
      showNotification("✓ Post approved and signed off for publishing!");
    } catch (err: any) {
      showNotification(`Approval error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (postId: string) => {
    setIsProcessing(true);
    try {
      await api.rejectPost(postId, "editorial_lead", "Requires creative refinement or replacement.");
      await refreshCampaigns();
      showNotification("Post marked as Rejected for re-generation or replacement.");
    } catch (err: any) {
      showNotification(`Rejection error: ${err.message}`);
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
          className="mt-4 px-5 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Go to Brief Creation
        </button>
      </div>
    );
  }

  const mediaUrl = api.getMediaUrl(activePost?.asset?.public_url);
  const valResult = activePost?.validation_results?.[0];
  const isValPassed = valResult?.status === "passed";

  // Calculate live word and character stats
  const wordCount = editCopyPrimary.trim() ? editCopyPrimary.trim().split(/\s+/).length : 0;
  const charCount = editCopyPrimary.length;
  const isTwitter = (activePost.platform as string) === "x_twitter" || (activePost.platform as string) === "twitter";

  return (
    <div className="space-y-6">
      {/* Hidden file input for custom image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 font-mono text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>Step 3: Human Approval & Deterministic QC Gate</span>
          </div>
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Editorial Review & Quality Control
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full editorial authority: edit copy in-place, replace visuals with your own uploads, or regenerate with AI before sign-off.
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
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-lg bg-[#141414] border border-white/20 text-xs font-mono text-zinc-200 flex items-center justify-between"
        >
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-zinc-500 hover:text-white text-xs ml-3"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Post Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {posts.map((p) => {
          const isSelected = p.id === activePost?.id;
          const pValPassed = p.validation_results?.[0]?.status === "passed";

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
                <div className="flex items-center space-x-1.5">
                  {getPlatformIcon(p.platform)}
                  <span className="font-mono text-xs uppercase text-zinc-200 tracking-wide">
                    {p.platform.replace("_", " ")}
                  </span>
                </div>
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

      {/* Main Review Comparison & Edit Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Creative & Copy In-Place Editor */}
        <div className="lg:col-span-7 bg-[#0C0C0C] rounded-xl border border-[#1E1E1E] overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header info bar with save & quick actions */}
            <div className="p-4 border-b border-[#1A1A1A] flex flex-wrap items-center justify-between gap-2 bg-[#111111]">
              <div className="flex items-center space-x-2">
                {getPlatformIcon(activePost.platform)}
                <span className="font-medium text-xs text-white capitalize">
                  {activePost.platform.replace("_", " ")} Editorial Gate
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-black border border-white/10">
                  {activePost.status}
                </span>
              </div>

              {/* In-Place Edit Actions */}
              <div className="flex items-center space-x-2">
                {isDirty && (
                  <button
                    onClick={handleRevertEdits}
                    className="flex items-center space-x-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-[#181818] border border-[#2B2B2B] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert</span>
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveEdits}
                  disabled={isSaving}
                  className={`flex items-center space-x-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    isDirty
                      ? "bg-white text-black hover:bg-zinc-200 shadow-md"
                      : "bg-[#1C1C1C] text-zinc-300 hover:bg-[#252525] border border-[#333333]"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving ? "Saving..." : isDirty ? "Save Edits to Supabase *" : "Save to Supabase"}</span>
                </motion.button>
              </div>
            </div>

            {/* Media Asset Preview with Custom Upload & AI Regeneration Overlay Controls */}
            <div className="relative bg-black group aspect-video flex items-center justify-center border-b border-[#1A1A1A] overflow-hidden">
              {isUploadingImage ? (
                <div className="flex flex-col items-center space-y-2 text-zinc-300">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                  <span className="text-xs font-mono">Uploading to Supabase Storage...</span>
                </div>
              ) : mediaUrl ? (
                <img
                  key={activePost.asset?.id || activePost.asset?.public_url || activePost.id}
                  src={mediaUrl}
                  alt={activePost.asset?.prompt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-zinc-500 text-xs">No visual asset found</div>
              )}

              {/* Asset Metadata Badges */}
              {activePost.asset && !isUploadingImage && (
                <div className="absolute top-2 left-2 flex items-center space-x-1.5 font-mono text-[10px] bg-black/85 text-zinc-300 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm">
                  <span>Aspect: {activePost.asset.aspect_ratio}</span>
                  <span>•</span>
                  <span>{activePost.asset.width}x{activePost.asset.height}</span>
                  <span>•</span>
                  <span className={activePost.asset.provider === "user_upload" ? "text-emerald-400 font-medium" : "text-zinc-400"}>
                    {activePost.asset.provider === "user_upload" ? "Custom Upload" : "Flux AI"}
                  </span>
                </div>
              )}

              {/* Overlay Action Bar for Media Replacement */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-black/85 p-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
                {/* Upload User Own Image */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium font-mono transition-all shadow cursor-pointer whitespace-nowrap"
                  title="Upload your own file to replace the AI generated image"
                >
                  <Upload className="w-3.5 h-3.5 text-black" />
                  <span>Replace with Upload</span>
                </motion.button>

                {/* AI Regenerate Image */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setImageRegenPrompt(activePost.asset?.prompt || "");
                    setImageRegenAspect(activePost.asset?.aspect_ratio || "1:1");
                    setShowImageRegenModal(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#1E1E1E] hover:bg-[#2A2A2A] text-zinc-200 text-xs font-mono transition-all border border-[#333333] cursor-pointer whitespace-nowrap"
                  title="Regenerate artwork using Flux AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>AI Regen Image</span>
                </motion.button>
              </div>
            </div>

            {/* Editable Platform Copy Body */}
            <div className="p-5 space-y-4">
              {/* Title Input (YouTube Title or Campaign Title) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Post Title {activePost.platform === "youtube" ? "(Mandatory for YouTube)" : "(Optional Headline)"}
                  </span>
                  {activePost.platform === "youtube" && (
                    <span className={`text-[10px] font-mono ${editTitle.length > 100 ? "text-red-400 font-bold" : "text-zinc-500"}`}>
                      {editTitle.length}/100 chars
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Enter headline or video title..."
                  className="w-full bg-[#121212] border border-[#242424] focus:border-white rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Primary Native Copy with Live Counters & AI Regen Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      Primary Native Copy ({activePost.language})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTextRegenModal(true)}
                      className="flex items-center space-x-1 text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-[#161616] border border-[#282828] hover:border-zinc-500 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>AI Regen Copy</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-[10px]">
                    <span className="text-zinc-500">{wordCount} words</span>
                    <span>•</span>
                    <span className={isTwitter && charCount > 280 ? "text-red-400 font-bold" : "text-zinc-400"}>
                      {charCount} chars {isTwitter && "(max: 280)"}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={editCopyPrimary}
                  onChange={(e) => {
                    setEditCopyPrimary(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Edit native Bengali/English copy..."
                  className="w-full bg-[#121212] border border-[#242424] focus:border-white rounded-lg p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed font-sans"
                />
              </div>

              {/* Secondary Translation Copy */}
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  English / Secondary Copy (Optional)
                </span>
                <textarea
                  rows={2}
                  value={editCopySecondary}
                  onChange={(e) => {
                    setEditCopySecondary(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="English translation or secondary subtitle..."
                  className="w-full bg-[#121212] border border-[#242424] focus:border-white rounded-lg p-3 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none transition-colors italic font-sans"
                />
              </div>

              {/* Hashtags and CTA Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1A1A1A]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Hashtags (Space or Comma Separated)
                  </span>
                  <input
                    type="text"
                    value={editHashtags}
                    onChange={(e) => {
                      setEditHashtags(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="#hoichoi #BengaliCinema #Kolkata"
                    className="w-full bg-[#121212] border border-[#242424] focus:border-white rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Call To Action (CTA)
                  </span>
                  <input
                    type="text"
                    value={editCta}
                    onChange={(e) => {
                      setEditCta(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. এখনই hoichoi অ্যাপে দেখুন!"
                    className="w-full bg-[#121212] border border-[#242424] focus:border-white rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
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

            <p className="text-[11px] text-zinc-500">
              Evaluates hard platform constraints (aspect ratio, length caps, hashtag density, required CTA) automatically.
            </p>

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
                disabled={!isValPassed || isProcessing || activePost.status === "approved" || isDirty}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                )}
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

            {isDirty && (
              <p className="text-[11px] text-amber-400 font-mono">
                ⚠️ You have unsaved edits. Click "Save to Supabase" before approving.
              </p>
            )}

            {!isValPassed && !isDirty && (
              <p className="text-[11px] text-zinc-400 font-mono mt-1">
                ⚠️ This post failed deterministic validation and cannot be approved until resolved. Edit the fields or replace the image above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal: AI Copy Regeneration */}
      <AnimatePresence>
        {showTextRegenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111111] border border-[#2B2B2B] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-medium text-white">
                    Regenerate Copy via Gemini ({activePost.platform})
                  </h3>
                </div>
                <button
                  onClick={() => setShowTextRegenModal(false)}
                  className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Creative Refinement Instruction (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={textRegenInstruction}
                    onChange={(e) => setTextRegenInstruction(e.target.value)}
                    placeholder="e.g. Make it more mysterious, emphasize the North Kolkata mansion setting, and keep it punchy..."
                    className="w-full bg-[#181818] border border-[#333333] rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Max Word Limit (Optional)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={textRegenMaxWords}
                      onChange={(e) => setTextRegenMaxWords(e.target.value)}
                      placeholder="e.g. 60 words"
                      className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Max Char Limit (Optional)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="5000"
                      value={textRegenMaxChars}
                      onChange={(e) => setTextRegenMaxChars(e.target.value)}
                      placeholder={isTwitter ? "e.g. 200 (max 280)" : "e.g. 500"}
                      className="w-full bg-[#181818] border border-[#333333] rounded px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setShowTextRegenModal(false)}
                  className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateText}
                  disabled={isRegeneratingText}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {isRegeneratingText ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isRegeneratingText ? "Generating..." : "Regenerate Copy"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: AI Image Regeneration */}
      <AnimatePresence>
        {showImageRegenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111111] border border-[#2B2B2B] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-medium text-white">
                    Regenerate Visual Asset via Flux ({activePost.platform})
                  </h3>
                </div>
                <button
                  onClick={() => setShowImageRegenModal(false)}
                  className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Visual Prompt for AI Rendering
                  </label>
                  <textarea
                    rows={4}
                    value={imageRegenPrompt}
                    onChange={(e) => setImageRegenPrompt(e.target.value)}
                    placeholder="Cinematic visual description for Flux image model..."
                    className="w-full bg-[#181818] border border-[#333333] rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Target Aspect Ratio
                  </label>
                  <select
                    value={imageRegenAspect}
                    onChange={(e) => setImageRegenAspect(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="1:1">1:1 Square (Instagram Feed)</option>
                    <option value="16:9">16:9 Cinematic (YouTube Thumbnail / X Card)</option>
                    <option value="4:5">4:5 Vertical Portrait (Instagram Feed)</option>
                    <option value="9:16">9:16 Story / Shorts (Vertical)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setShowImageRegenModal(false)}
                  className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateImage}
                  disabled={isRegeneratingImage}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-all shadow cursor-pointer disabled:opacity-50"
                >
                  {isRegeneratingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isRegeneratingImage ? "Rendering Image..." : "Regenerate Image"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
