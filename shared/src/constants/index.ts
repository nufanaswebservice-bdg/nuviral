// ============================================
// ViralAI - Shared Constants
// ============================================

export const PLATFORMS = {
  TIKTOK: 'TIKTOK',
  YOUTUBE_SHORTS: 'YOUTUBE_SHORTS',
  INSTAGRAM_REELS: 'INSTAGRAM_REELS',
  FACEBOOK_REELS: 'FACEBOOK_REELS',
} as const;

export const PLATFORM_LABELS: Record<string, string> = {
  TIKTOK: 'TikTok',
  YOUTUBE_SHORTS: 'YouTube Shorts',
  INSTAGRAM_REELS: 'Instagram Reels',
  FACEBOOK_REELS: 'Facebook Reels',
};

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    videoRenderLimit: 5,
    aiCreditsLimit: 50,
    storageLimit: 1 * 1024 * 1024 * 1024, // 1GB
    teamMemberLimit: 1,
    apiAccess: false,
    features: [
      '5 video renders/month',
      '50 AI credits/month',
      '1GB storage',
      'Basic templates',
      'Watermark on videos',
    ],
  },
  STARTER: {
    name: 'Starter',
    price: 29,
    videoRenderLimit: 50,
    aiCreditsLimit: 500,
    storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
    teamMemberLimit: 2,
    apiAccess: false,
    features: [
      '50 video renders/month',
      '500 AI credits/month',
      '10GB storage',
      'All templates',
      'No watermark',
      '2 social accounts',
      'Basic analytics',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 79,
    videoRenderLimit: 200,
    aiCreditsLimit: 2000,
    storageLimit: 50 * 1024 * 1024 * 1024, // 50GB
    teamMemberLimit: 5,
    apiAccess: true,
    features: [
      '200 video renders/month',
      '2000 AI credits/month',
      '50GB storage',
      'Premium templates',
      'No watermark',
      '10 social accounts',
      'Advanced analytics',
      'AI workflow automation',
      'Priority rendering',
      'API access',
    ],
  },
  AGENCY: {
    name: 'Agency',
    price: 199,
    videoRenderLimit: 1000,
    aiCreditsLimit: 10000,
    storageLimit: 200 * 1024 * 1024 * 1024, // 200GB
    teamMemberLimit: 20,
    apiAccess: true,
    features: [
      '1000 video renders/month',
      '10000 AI credits/month',
      '200GB storage',
      'All templates + custom',
      'No watermark',
      'Unlimited social accounts',
      'Full analytics suite',
      'AI workflow automation',
      'Priority rendering',
      'API access',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
    ],
  },
} as const;

export const VIDEO_RESOLUTIONS = {
  HD: { width: 720, height: 1280, label: '720p HD' },
  FULL_HD: { width: 1080, height: 1920, label: '1080p Full HD' },
} as const;

export const NICHES = [
  { value: 'business', label: 'Business' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'anime', label: 'Anime' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'education', label: 'Education' },
  { value: 'news', label: 'News' },
  { value: 'horror', label: 'Horror' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'affiliate_marketing', label: 'Affiliate Marketing' },
  { value: 'tech', label: 'Tech' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'comedy', label: 'Comedy' },
] as const;

export const SUBTITLE_STYLES = [
  { value: 'modern', label: 'Modern (White + Shadow)' },
  { value: 'bold', label: 'Bold (Yellow Highlight)' },
  { value: 'minimal', label: 'Minimal (Clean White)' },
  { value: 'neon', label: 'Neon (Glow Effect)' },
  { value: 'karaoke', label: 'Karaoke (Word by Word)' },
  { value: 'emoji', label: 'Emoji Style' },
] as const;

export const VOICE_TYPES = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Male)' },
  { value: 'fable', label: 'Fable (British)' },
  { value: 'onyx', label: 'Onyx (Deep Male)' },
  { value: 'nova', label: 'Nova (Female)' },
  { value: 'shimmer', label: 'Shimmer (Soft Female)' },
] as const;

export const MAX_VIDEO_DURATION = 60; // seconds
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'webm'];
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'ogg'];
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
