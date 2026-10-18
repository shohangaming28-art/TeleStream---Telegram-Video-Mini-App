import { Video, AdConfig, AdAnalytics, Comment } from '../types';
import { INITIAL_VIDEOS, DEFAULT_AD_CONFIG } from '../data/initialVideos';

const VIDEOS_KEY = 'telestream_videos_v1';
const AD_CONFIG_KEY = 'telestream_ad_config_v1';
const AD_ANALYTICS_KEY = 'telestream_ad_analytics_v1';
const ADMIN_PIN_KEY = 'telestream_admin_pin_v1';
const SAVED_VIDEOS_KEY = 'telestream_saved_video_ids_v1';
const LIKED_VIDEOS_KEY = 'telestream_liked_video_ids_v1';
const COMMENTS_KEY = 'telestream_comments_v1';

export const getStoredVideos = (): Video[] => {
  try {
    const raw = localStorage.getItem(VIDEOS_KEY);
    if (!raw) {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VIDEOS;
  }
};

export const saveStoredVideos = (videos: Video[]) => {
  try {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
  } catch (err) {
    console.error('Failed to save videos to localStorage', err);
  }
};

export const getStoredAdConfig = (): AdConfig => {
  try {
    const raw = localStorage.getItem(AD_CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(AD_CONFIG_KEY, JSON.stringify(DEFAULT_AD_CONFIG));
      return DEFAULT_AD_CONFIG;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AD_CONFIG;
  }
};

export const saveStoredAdConfig = (config: AdConfig) => {
  try {
    localStorage.setItem(AD_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save ad config', err);
  }
};

export const getStoredAdAnalytics = (): AdAnalytics => {
  const defaults: AdAnalytics = {
    impressions: 124,
    skips: 48,
    completions: 76,
    clicks: 19,
    estimatedEarnings: 3.84
  };
  try {
    const raw = localStorage.getItem(AD_ANALYTICS_KEY);
    if (!raw) {
      localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return defaults;
  }
};

export const recordAdImpression = () => {
  const current = getStoredAdAnalytics();
  current.impressions += 1;
  current.estimatedEarnings += 0.025; // ~$25 CPM simulation
  try {
    localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(current));
  } catch {}
  return current;
};

export const recordAdSkip = () => {
  const current = getStoredAdAnalytics();
  current.skips += 1;
  try {
    localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(current));
  } catch {}
  return current;
};

export const recordAdCompletion = () => {
  const current = getStoredAdAnalytics();
  current.completions += 1;
  current.estimatedEarnings += 0.05;
  try {
    localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(current));
  } catch {}
  return current;
};

export const recordAdClick = () => {
  const current = getStoredAdAnalytics();
  current.clicks += 1;
  current.estimatedEarnings += 0.20; // CPC simulation
  try {
    localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(current));
  } catch {}
  return current;
};

export const resetAdAnalytics = (): AdAnalytics => {
  const fresh: AdAnalytics = {
    impressions: 0,
    skips: 0,
    completions: 0,
    clicks: 0,
    estimatedEarnings: 0
  };
  localStorage.setItem(AD_ANALYTICS_KEY, JSON.stringify(fresh));
  return fresh;
};

export const getAdminPIN = (): string => {
  return localStorage.getItem(ADMIN_PIN_KEY) || 'admin123';
};

export const saveAdminPIN = (pin: string) => {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
};

export const getSavedVideoIds = (): string[] => {
  try {
    const raw = localStorage.getItem(SAVED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleSavedVideoId = (videoId: string): string[] => {
  const current = getSavedVideoIds();
  const exists = current.includes(videoId);
  const updated = exists ? current.filter(id => id !== videoId) : [...current, videoId];
  try {
    localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const getLikedVideoIds = (): string[] => {
  try {
    const raw = localStorage.getItem(LIKED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleLikedVideoId = (videoId: string): { liked: boolean; likedIds: string[] } => {
  const current = getLikedVideoIds();
  const exists = current.includes(videoId);
  const updated = exists ? current.filter(id => id !== videoId) : [...current, videoId];
  try {
    localStorage.setItem(LIKED_VIDEOS_KEY, JSON.stringify(updated));
  } catch {}
  return { liked: !exists, likedIds: updated };
};

export const getStoredComments = (videoId: string): Comment[] => {
  try {
    const raw = localStorage.getItem(`${COMMENTS_KEY}_${videoId}`);
    if (raw) return JSON.parse(raw);
    // Initial sample comments
    const initial: Comment[] = [
      {
        id: 'c1',
        videoId,
        userName: 'Alex_TON',
        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
        text: 'The video quality is crystal clear! Telegram Mini Apps are definitely the future of streaming.',
        timestamp: '1 hour ago',
        likes: 14
      },
      {
        id: 'c2',
        videoId,
        userName: 'Elena_Crypto',
        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena',
        text: 'Super smooth playback. Love that it works right inside Telegram chats without opening an external browser.',
        timestamp: '3 hours ago',
        likes: 8
      }
    ];
    localStorage.setItem(`${COMMENTS_KEY}_${videoId}`, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
};

export const addStoredComment = (videoId: string, comment: Comment): Comment[] => {
  const existing = getStoredComments(videoId);
  const updated = [comment, ...existing];
  try {
    localStorage.setItem(`${COMMENTS_KEY}_${videoId}`, JSON.stringify(updated));
  } catch {}
  return updated;
};
