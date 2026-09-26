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
  triggerGeneration: (instruction?: string) => Promise<void>;
  selectInsightForNextBrief: (insight: Insight) => void;
  selectedPriorInsightIds: string[];
  setSelectedPriorInsightIds: React.Dispatch<React.SetStateAction<string[]>>;
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
  const triggerGeneration = async (instruction?: string) => {
    if (!activeCampaignId) return;
    setIsGenerating(true);
    setGenerationProgress("Starting AI Campaign Intelligence Pipeline...");
    setActiveTab("studio");

    try {
      const result = await api.triggerGeneration(
        activeCampaignId,
        instruction,
        selectedPriorInsightIds.length > 0 ? selectedPriorInsightIds : undefined
      );

      setGenerationProgress("Synthesizing creative assets & platform adaptations...");

      // Reload campaign with new posts and assets
      await refreshActiveCampaign();
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
        selectInsightForNextBrief,
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
