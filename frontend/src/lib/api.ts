import {
  Campaign,
  CampaignCreatePayload,
  GenerationRun,
  PlatformPost,
  LikeForLikeComparisonResponse,
  LikeForLikePostComparison,
  Insight,
  InsightResponse,
  Report,
  WeeklyReportResponse,
  EvidenceCitation,
  Metric,
  Language
} from "@/types";

export type {
  Campaign,
  CampaignCreatePayload,
  GenerationRun,
  PlatformPost,
  LikeForLikeComparisonResponse,
  LikeForLikePostComparison,
  Insight,
  InsightResponse,
  Report,
  WeeklyReportResponse,
  EvidenceCitation,
  Metric,
  Language
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.detail || errorJson.error || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

async function uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.detail || errorJson.error || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Diagnostics
  healthCheck: () => request<{ status: string }>("/api/v1/health"),
  readyCheck: () =>
    request<{
      status: string;
      database: string;
      providers: {
        gemini_api_configured: boolean;
        gemini_model: string;
        pixazo_api_configured: boolean;
        pixazo_model: string;
      };
    }>("/api/v1/ready"),

  // Campaigns & Briefs
  createCampaign: (payload: CampaignCreatePayload) =>
    request<Campaign>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listCampaigns: (limit = 20, offset = 0) =>
    request<Campaign[]>(`/api/v1/campaigns?limit=${limit}&offset=${offset}`),

  getCampaign: (campaignId: string) =>
    request<Campaign>(`/api/v1/campaigns/${campaignId}`),

  // Core Vertical Slice: Trigger Generation
  triggerGeneration: (
    campaignId: string,
    refinementInstruction?: string,
    priorInsightIds?: string[],
    platformAspectRatios?: Record<string, string>,
    textLimits?: Record<string, any>
  ) =>
    request<{
      status: string;
      message: string;
      generation_run_id: string;
      run_status: string;
      posts_generated: number;
      posts: PlatformPost[];
    }>(`/api/v1/campaigns/${campaignId}/generate`, {
      method: "POST",
      body: JSON.stringify({
        refinement_instruction: refinementInstruction || null,
        prior_insight_ids: priorInsightIds || null,
        platform_aspect_ratios: platformAspectRatios || null,
        text_limits: textLimits || null,
      }),
    }),

  getGenerationRun: (generationId: string) =>
    request<GenerationRun>(`/api/v1/generations/${generationId}`),

  // Posts, Direct Editing & Individual Regeneration
  getPost: (postId: string) => request<PlatformPost>(`/api/v1/posts/${postId}`),

  updatePostContent: (
    postId: string,
    data: {
      title?: string | null;
      copy_primary?: string;
      copy_secondary?: string | null;
      hashtags?: string[];
      cta?: string;
    }
  ) =>
    request<PlatformPost>(`/api/v1/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  regeneratePostText: (
    postId: string,
    data?: {
      instruction?: string;
      max_words?: number;
      max_characters?: number;
    }
  ) =>
    request<PlatformPost>(`/api/v1/posts/${postId}/regenerate-text`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),

  regeneratePostImage: (
    postId: string,
    data?: {
      prompt?: string;
      aspect_ratio?: string;
    }
  ) =>
    request<PlatformPost>(`/api/v1/posts/${postId}/regenerate-image`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),

  uploadPostAsset: (postId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadFile<PlatformPost>(`/api/v1/posts/${postId}/upload-asset`, formData);
  },

  deletePost: (postId: string) =>
    request<{ status: string; message: string; deleted_post_id: string }>(
      `/api/v1/posts/${postId}`,
      { method: "DELETE" }
    ),

  sendCampaignToReview: (campaignId: string) =>
    request<{ status: string; message: string; campaign_id: string; posts_count: number }>(
      `/api/v1/campaigns/${campaignId}/send-to-review`,
      { method: "POST" }
    ),

  sendCampaignToStudio: (campaignId: string) =>
    request<{ status: string; message: string; campaign_id: string; posts_count: number }>(
      `/api/v1/campaigns/${campaignId}/send-to-studio`,
      { method: "POST" }
    ),

  refinePost: (postId: string, refinementInstruction: string) =>
    request<PlatformPost>(`/api/v1/posts/${postId}/refine`, {
      method: "POST",
      body: JSON.stringify({
        refinement_instruction: refinementInstruction,
      }),
    }),

  // Human Approval Gate
  approvePost: (postId: string, reviewerName = "human_operator", feedback?: string) =>
    request<PlatformPost>(`/api/v1/posts/${postId}/approve`, {
      method: "POST",
      body: JSON.stringify({ reviewer_name: reviewerName, feedback }),
    }),

  rejectPost: (postId: string, reviewerName = "human_operator", feedback?: string) =>
    request<PlatformPost>(`/api/v1/posts/${postId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reviewer_name: reviewerName, feedback }),
    }),

  // Scheduling
  schedulePost: (postId: string, scheduledTime: string) =>
    request<any>(`/api/v1/posts/${postId}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduled_time: scheduledTime }),
    }),

  // Mock Publishing & Unpublishing
  publishPost: (postId: string) =>
    request<any>(`/api/v1/posts/${postId}/publish`, {
      method: "POST",
    }),
  unpublishPost: (postId: string) =>
    request<PlatformPost>(`/api/v1/posts/${postId}/unpublish`, {
      method: "POST",
    }),

  // Analytics & Mock Seeding
  seedMockMetrics: (campaignId: string) =>
    request<{ status: string; message: string; metrics_count: number }>(
      `/api/v1/campaigns/${campaignId}/seed-mock-metrics`,
      { method: "POST" }
    ),
  seedMetrics: (campaignId: string) =>
    request<{ status: string; message: string; metrics_count: number }>(
      `/api/v1/campaigns/${campaignId}/seed-mock-metrics`,
      { method: "POST" }
    ),

  getComparison: (campaignId: string) =>
    request<LikeForLikeComparisonResponse>(`/api/v1/campaigns/${campaignId}/comparison`),

  // AI Intelligence & Closed Loop
  generateInsights: (campaignId: string) =>
    request<Insight[]>(`/api/v1/campaigns/${campaignId}/insights`, {
      method: "POST",
    }),

  listInsights: (campaignId: string) =>
    request<Insight[]>(`/api/v1/campaigns/${campaignId}/insights`),

  // THE CLOSED LOOP: Retrieve insights to seed the next brief
  getNextBriefContext: (limit = 5) =>
    request<Insight[]>(`/api/v1/insights/next-brief-context?limit=${limit}`),

  // Weekly Report
  generateWeeklyReport: (reportingPeriod = "Week 38 - 2026", campaignId?: string) => {
    let url = `/api/v1/reports/weekly?reporting_period=${encodeURIComponent(reportingPeriod)}`;
    if (campaignId) url += `&campaign_id=${campaignId}`;
    return request<Report>(url, { method: "POST" });
  },

  listReports: () => request<Report[]>("/api/v1/reports"),

  // Asset URL Helper
  getMediaUrl: (urlOrPath?: string | null) => {
    if (!urlOrPath) return "";
    if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
      return urlOrPath;
    }
    if (urlOrPath.startsWith("/api/v1/assets/media/")) {
      return `${API_BASE_URL}${urlOrPath}`;
    }
    return `${API_BASE_URL}/api/v1/assets/media/${urlOrPath.split("/").pop()}`;
  },

  // SSE Stream helper
  getGenerationStreamUrl: (generationId: string) =>
    `${API_BASE_URL}/api/v1/generations/${generationId}/stream`,
};
