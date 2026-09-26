export type Language = "bengali" | "english" | "bilingual";

export type PlatformType = "instagram" | "youtube" | "x_twitter";

export type GenerationRunStatus =
  | "pending"
  | "generating"
  | "generated"
  | "validating"
  | "valid"
  | "invalid"
  | "failed"
  | "ready_for_review";

export type PostStatus =
  | "draft"
  | "generated"
  | "validating"
  | "pending_review"
  | "rejected"
  | "approved"
  | "scheduled"
  | "published"
  | "failed";

export type ValidationStatus = "passed" | "failed";

export type ApprovalDecision = "approved" | "rejected";

export type ScheduleStatus = "scheduled" | "cancelled" | "completed";

export type PublicationStatus = "pending" | "published" | "failed";

export interface Campaign {
  id: string;
  title: string;
  brief: string;
  target_audience?: string | null;
  key_objectives?: string | null;
  primary_language: string;
  prior_insight_ids?: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
  generation_runs_count?: number;
  posts?: PlatformPost[];
  insights?: Insight[];
  strategy?: {
    overall_theme: string;
    core_hook: string;
    emotional_resonance: string;
    creative_direction?: string;
  } | null;
}

export type InsightResponse = Insight;
export type WeeklyReportResponse = Report;

export interface CampaignCreatePayload {
  title: string;
  brief: string;
  target_audience?: string;
  key_objectives?: string;
  primary_language?: Language;
  prior_insight_ids?: string[];
}

export interface Asset {
  id: string;
  platform: string;
  asset_type: "image" | "video";
  provider: string;
  model_name: string;
  prompt: string;
  public_url: string;
  width: number;
  height: number;
  aspect_ratio: string;
  file_size_bytes: number;
  mime_type: string;
  created_at: string;
}

export interface ValidationRuleCheck {
  rule: string;
  passed: boolean;
  message: string;
  expected: any;
  actual: any;
}

export interface ValidationResult {
  id: string;
  post_id: string;
  status: ValidationStatus;
  rules_checked: ValidationRuleCheck[];
  error_summary?: string | null;
  validated_at: string;
}

export interface Approval {
  id: string;
  post_id: string;
  decision: ApprovalDecision;
  reviewer_name: string;
  feedback?: string | null;
  reviewed_at: string;
}

export interface Schedule {
  id: string;
  post_id: string;
  scheduled_time: string;
  status: ScheduleStatus;
  created_at: string;
}

export interface Publication {
  id: string;
  post_id: string;
  platform: string;
  status: PublicationStatus;
  external_post_id: string;
  external_url: string;
  published_at: string;
}

export interface Metric {
  id: string;
  campaign_id: string;
  post_id: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  video_views?: number;
  watch_time_seconds?: number;
  engagement_rate: number;
  recorded_at: string;
}

export interface PlatformPost {
  id: string;
  campaign_id: string;
  generation_run_id: string;
  asset_id?: string | null;
  parent_post_id?: string | null;
  platform: PlatformType;
  language: string;
  title?: string | null;
  copy_primary: string;
  copy_secondary?: string | null;
  hashtags: string[];
  cta: string;
  status: PostStatus;
  iteration_number: number;
  refinement_instruction?: string | null;
  created_at: string;
  updated_at: string;
  asset?: Asset | null;
  validation_results?: ValidationResult[];
  approvals?: Approval[];
  schedule?: Schedule | null;
  publication?: Publication | null;
  metrics?: Metric[];
}

export interface GenerationRun {
  id: string;
  campaign_id: string;
  run_number: number;
  status: GenerationRunStatus;
  brief_snapshot: string;
  strategy_payload?: any;
  error_message?: string | null;
  created_at: string;
  completed_at?: string | null;
  posts?: PlatformPost[];
  assets?: Asset[];
}

export interface LikeForLikePostComparison {
  post_id: string;
  platform: string;
  copy_snippet: string;
  visual_aspect_ratio?: string | null;
  media_url?: string | null;
  status: string;
  metrics?: Metric | null;
}

export interface LikeForLikeComparisonResponse {
  campaign_id: string;
  campaign_title: string;
  concept_theme: string;
  posts: LikeForLikePostComparison[];
  winning_platform_by_engagement?: string | null;
  comparison_summary: string;
}

export interface Insight {
  id: string;
  campaign_id: string;
  title: string;
  summary: string;
  category: string;
  evidence_post_ids: string[];
  metrics_evidence?: Record<string, any> | null;
  recommendation_for_next_brief: string;
  is_applied_to_future_brief: boolean;
  created_at: string;
}

export interface EvidenceCitation {
  claim: string;
  supporting_post_ids: string[];
  metrics_cited: Record<string, any>;
}

export interface Report {
  id: string;
  campaign_id?: string | null;
  title: string;
  reporting_period: string;
  narrative_summary: string;
  cross_platform_analysis?: Record<string, any> | null;
  evidence_citations?: EvidenceCitation[] | null;
  strategic_recommendations?: string[] | null;
  created_at: string;
}
