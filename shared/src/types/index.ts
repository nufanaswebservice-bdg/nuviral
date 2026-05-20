// ============================================
// ViralAI - Shared Types
// ============================================

// Platform Types
export type Platform = 'TIKTOK' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REELS' | 'FACEBOOK_REELS';

// Subscription Plans
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'AGENCY';

// Video Status
export type VideoStatus = 'PENDING' | 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Upload Status
export type UploadStatus = 'PENDING' | 'SCHEDULED' | 'UPLOADING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED' | 'DRAFT';

// AI Job Types
export type AiJobType =
  | 'SCRIPT_GENERATION'
  | 'HOOK_GENERATION'
  | 'CAPTION_GENERATION'
  | 'HASHTAG_GENERATION'
  | 'TITLE_GENERATION'
  | 'VIRAL_PREDICTION'
  | 'THUMBNAIL_GENERATION'
  | 'CONTENT_REWRITE'
  | 'TREND_ANALYSIS'
  | 'VIDEO_RENDER'
  | 'VOICE_GENERATION'
  | 'SUBTITLE_GENERATION'
  | 'TRANSLATION';

// Niche Categories
export type Niche =
  | 'business'
  | 'motivation'
  | 'anime'
  | 'gaming'
  | 'crypto'
  | 'education'
  | 'news'
  | 'horror'
  | 'storytelling'
  | 'affiliate_marketing'
  | 'tech'
  | 'lifestyle'
  | 'fitness'
  | 'food'
  | 'travel'
  | 'comedy';

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  subscription?: SubscriptionInfo;
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: string;
  videoRenderLimit: number;
  videoRenderUsed: number;
  aiCreditsLimit: number;
  aiCreditsUsed: number;
  storageLimit: number;
  storageUsed: number;
}

// AI Generation Types
export interface ScriptGenerationInput {
  niche: Niche;
  topic?: string;
  tone?: string;
  duration?: number;
  platform?: Platform;
  language?: string;
  style?: string;
}

export interface ScriptGenerationOutput {
  title: string;
  hook: string;
  script: string;
  caption: string;
  cta: string;
  hashtags: string[];
  viralScore: number;
  estimatedDuration: number;
}

export interface VideoRenderInput {
  scriptId: string;
  templateId?: string;
  voiceType?: string;
  subtitleStyle?: string;
  backgroundMusic?: string;
  resolution?: '720p' | '1080p';
  watermark?: boolean;
}

export interface VideoRenderOutput {
  videoId: string;
  filePath: string;
  thumbnailPath: string;
  duration: number;
  fileSize: number;
}

// Analytics Types
export interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  avgWatchTime: number;
  bestPostingTime: string;
  viralScore: number;
  growthRate: number;
}

export interface PlatformAnalytics {
  platform: Platform;
  views: number;
  engagement: number;
  followers: number;
  growth: number;
}

// Workflow Types
export interface WorkflowStep {
  id: string;
  type: 'generate_script' | 'generate_video' | 'render' | 'schedule' | 'publish' | 'analyze';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
}

// Template Types
export interface VideoTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  config: TemplateConfig;
  isPremium: boolean;
}

export interface TemplateConfig {
  subtitleStyle: SubtitleStyle;
  transitions: string[];
  colorScheme: string[];
  fontFamily: string;
  musicCategory?: string;
  introTemplate?: string;
  outroTemplate?: string;
}

export interface SubtitleStyle {
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  position: 'top' | 'center' | 'bottom';
  animation: 'none' | 'fade' | 'typewriter' | 'bounce' | 'highlight';
}

// Notification Types
export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
}

// Schedule Types
export interface ScheduleInput {
  videoId: string;
  socialAccountId: string;
  platform: Platform;
  scheduledAt: string;
  caption?: string;
  hashtags?: string[];
}

// Trend Types
export interface TrendData {
  keyword: string;
  platform: Platform;
  volume: number;
  growth: number;
  viralScore: number;
  relatedHashtags: string[];
}
