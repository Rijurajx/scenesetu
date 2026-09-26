"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Campaign, GenerationRun, PlatformPost, Insight } from "@/types";
import { api } from "@/lib/api";

export type WorkspaceTab = "brief" | "studio" | "review" | "publisher" | "analytics" | "insights";

interface CampaignContextType {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeCampaign: Campaign | null;
  activeTab: WorkspaceTab;
  isGenerating: boolean;
  generationProgress: string;
  generationRun: GenerationRun | null;
  systemReady: boolean;
  priorInsightsForBrief: Insight[];
  setActiveTab: (tab: WorkspaceTab) => void;
  setActiveCampaignId: (id: string) => void;
  refreshCampaigns: () => Promise<void>;
  refreshActiveCampaign: () => Promise<void>;
  triggerGeneration: (
    instruction?: string,
    targetCampaignId?: string,
    aspectRatios?: Record<string, string>,
    textLimits?: Record<string, any>
  ) => Promise<void>;
  updatePostContent: (
    postId: string,
    data: {
      title?: string | null;
      copy_primary?: string;
      copy_secondary?: string | null;
      hashtags?: string[];
      cta?: string;
    }
  ) => Promise<PlatformPost>;
  regeneratePostText: (
    postId: string,
    options?: {
      instruction?: string;
      max_words?: number;
      max_characters?: number;
    }
  ) => Promise<PlatformPost>;
  regeneratePostImage: (
    postId: string,
    options?: {
      prompt?: string;
      aspect_ratio?: string;
    }
  ) => Promise<PlatformPost>;
  uploadPostAsset: (postId: string, file: File) => Promise<PlatformPost>;
  deletePost: (postId: string) => Promise<void>;
  sendCampaignToReview: (campaignId: string) => Promise<void>;
  sendCampaignToStudio: (campaignId: string) => Promise<void>;
  selectInsightForNextBrief: (insight: Insight) => void;
  selectedPriorInsightIds: string[];
  setSelectedPriorInsightIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeTextLimits: Record<string, any> | null;
  setActiveTextLimits: (limits: Record<string, any> | null) => void;
  activeAspectRatios: Record<string, string> | null;
  setActiveAspectRatios: (ratios: Record<string, string> | null) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("brief");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [generationRun, setGenerationRun] = useState<GenerationRun | null>(null);
  const [systemReady, setSystemReady] = useState<boolean>(false);
  const [priorInsightsForBrief, setPriorInsightsForBrief] = useState<Insight[]>([]);
  const [selectedPriorInsightIds, setSelectedPriorInsightIds] = useState<string[]>([]);
  const [activeTextLimits, setActiveTextLimits] = useState<Record<string, any> | null>(null);
  const [activeAspectRatios, setActiveAspectRatios] = useState<Record<string, string> | null>(null);

  // Check backend readiness on mount
  useEffect(() => {
    api.readyCheck()
      .then((res) => {
        setSystemReady(res.status === "ready");
      })
      .catch(() => setSystemReady(false));

    // Load closed loop feedback insights
    api.getNextBriefContext(6)
      .then((insights) => setPriorInsightsForBrief(insights))
      .catch(() => {});
  }, []);

  // Fetch campaigns
  const refreshCampaigns = async () => {
    try {
      const data = await api.listCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !activeCampaignId) {
        setActiveCampaignId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  useEffect(() => {
    refreshCampaigns();
  }, []);

  // Fetch active campaign details
  const refreshActiveCampaign = async () => {
    if (!activeCampaignId) return;
    try {
      const data = await api.getCampaign(activeCampaignId);
      setActiveCampaign(data);
    } catch (err) {
      console.error("Failed to fetch campaign detail:", err);
    }
  };

  useEffect(() => {
    if (activeCampaignId) {
      refreshActiveCampaign();
    }
  }, [activeCampaignId]);

  // Trigger Content Generation Pipeline (Critical Slice)
  const triggerGeneration = async (
    instruction?: string,
    targetCampaignId?: string,
    aspectRatios?: Record<string, string>,
    textLimits?: Record<string, any>
  ) => {
    const cid = targetCampaignId || activeCampaignId;
    if (!cid) return;

    if (targetCampaignId) {
      setActiveCampaignId(targetCampaignId);
    }
    
    if (textLimits !== undefined) {
      setActiveTextLimits(textLimits);
    }
    if (aspectRatios !== undefined) {
      setActiveAspectRatios(aspectRatios);
    }

    const limitsToSend = textLimits !== undefined ? textLimits : activeTextLimits;
    const aspectRatiosToSend = aspectRatios !== undefined ? aspectRatios : activeAspectRatios;

    setIsGenerating(true);
    setGenerationProgress("Starting AI Campaign Intelligence Pipeline...");
    setActiveTab("studio");

    try {
      const result = await api.triggerGeneration(
        cid,
        instruction,
        selectedPriorInsightIds.length > 0 ? selectedPriorInsightIds : undefined,
        aspectRatiosToSend || undefined,
        limitsToSend || undefined
      );

      setGenerationProgress("Generating visual assets & verifying platform constraints...");

      // Reload campaign with new posts and assets
      const updatedCampaign = await api.getCampaign(cid);
      setActiveCampaign(updatedCampaign);
      await refreshCampaigns();
      setGenerationProgress("Generation and deterministic validation completed!");
      
      if (result.generation_run_id) {
        const runData = await api.getGenerationRun(result.generation_run_id);
        setGenerationRun(runData);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setGenerationProgress(`Generation error: ${err.message || "Failed to generate"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct In-Place Post Editing & Instant Supabase Persistence
  const updatePostContent = async (
    postId: string,
    data: {
      title?: string | null;
      copy_primary?: string;
      copy_secondary?: string | null;
      hashtags?: string[];
      cta?: string;
    }
  ) => {
    const updatedPost = await api.updatePostContent(postId, data);
    setActiveCampaign((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts?.map((p) => (p.id === postId ? updatedPost : p)) || [],
      };
    });
    refreshActiveCampaign();
    return updatedPost;
  };

  // Individual Text / Copy Regeneration
  const regeneratePostText = async (
    postId: string,
    options?: {
      instruction?: string;
      max_words?: number;
      max_characters?: number;
    }
  ) => {
    const updatedPost = await api.regeneratePostText(postId, options);
    setActiveCampaign((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts?.map((p) => (p.id === postId ? updatedPost : p)) || [],
      };
    });
    refreshActiveCampaign();
    return updatedPost;
  };

  // Individual Image Regeneration
  const regeneratePostImage = async (
    postId: string,
    options?: {
      prompt?: string;
      aspect_ratio?: string;
    }
  ) => {
    const updatedPost = await api.regeneratePostImage(postId, options);
    setActiveCampaign((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts?.map((p) => (p.id === postId ? updatedPost : p)) || [],
      };
    });
    refreshActiveCampaign();
    return updatedPost;
  };

  // Upload Custom Asset to Replace AI Image
  const uploadPostAsset = async (postId: string, file: File) => {
    const updatedPost = await api.uploadPostAsset(postId, file);
    setActiveCampaign((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts?.map((p) => (p.id === postId ? updatedPost : p)) || [],
      };
    });
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        posts: c.posts?.map((p) => (p.id === postId ? updatedPost : p)) || [],
      }))
    );
    refreshActiveCampaign();
    return updatedPost;
  };

  // Delete a single post
  const deletePost = async (postId: string) => {
    await api.deletePost(postId);
    setActiveCampaign((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts?.filter((p) => p.id !== postId) || [],
      };
    });
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        posts: c.posts?.filter((p) => p.id !== postId) || [],
      }))
    );
    await refreshActiveCampaign();
  };

  // Universal review trigger: Send entire campaign to Review Gate
  const sendCampaignToReview = async (campaignId: string) => {
    await api.sendCampaignToReview(campaignId);
    setActiveCampaignId(campaignId);
    await refreshCampaigns();
    await refreshActiveCampaign();
    setActiveTab("review");
  };

  // Send campaign back to AI Studio
  const sendCampaignToStudio = async (campaignId: string) => {
    await api.sendCampaignToStudio(campaignId);
    setActiveCampaignId(campaignId);
    await refreshCampaigns();
    await refreshActiveCampaign();
    setActiveTab("studio");
  };

  const selectInsightForNextBrief = (insight: Insight) => {
    if (!selectedPriorInsightIds.includes(insight.id)) {
      setSelectedPriorInsightIds((prev) => [...prev, insight.id]);
    }
    setActiveTab("brief");
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        activeCampaignId,
        activeCampaign,
        activeTab,
        isGenerating,
        generationProgress,
        generationRun,
        systemReady,
        priorInsightsForBrief,
        selectedPriorInsightIds,
        setSelectedPriorInsightIds,
        setActiveTab,
        setActiveCampaignId,
        refreshCampaigns,
        refreshActiveCampaign,
        triggerGeneration,
        updatePostContent,
        regeneratePostText,
        regeneratePostImage,
        uploadPostAsset,
        deletePost,
        sendCampaignToReview,
        sendCampaignToStudio,
        selectInsightForNextBrief,
        activeTextLimits,
        setActiveTextLimits,
        activeAspectRatios,
        setActiveAspectRatios,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
}
