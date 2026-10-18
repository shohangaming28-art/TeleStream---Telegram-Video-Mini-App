export interface Video {
  id: string;
  title: string;
  description: string;
  category: 'Trending' | 'Gaming' | 'Tech' | 'Shorts' | 'Cinema' | 'Tutorials' | 'Music';
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  durationSeconds: number;
  views: number;
  likes: number;
  isFeatured?: boolean;
  isShort?: boolean;
  createdAt: string;
  channelName: string;
  channelAvatar: string;
  tags: string[];
}

export interface AdConfig {
  enabled: boolean;
  sponsorName: string;
  adTitle: string;
  adDescription: string;
  mediaUrl: string;
  ctaText: string;
  ctaUrl: string;
  skipDelaySeconds: number;
  totalAdDurationSeconds: number;
  networkType: 'adsgram' | 'monetag' | 'adsense' | 'custom';
}

export interface AdAnalytics {
  impressions: number;
  skips: number;
  completions: number;
  clicks: number;
  estimatedEarnings: number; // in USD or TON
}

export interface Comment {
  id: string;
  videoId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}
