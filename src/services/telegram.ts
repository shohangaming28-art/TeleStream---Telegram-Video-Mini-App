import { TelegramWebAppUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: TelegramWebAppUser;
          receiver?: unknown;
          chat?: unknown;
          start_param?: string;
        };
        version?: string;
        platform?: string;
        colorScheme?: 'light' | 'dark';
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        headerColor?: string;
        backgroundColor?: string;
        BackButton?: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);
};

export const getTelegramUser = (): TelegramWebAppUser | null => {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
};

export const initTelegramSDK = () => {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#0b0f17');
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#0b0f17');
    }
  } catch {
    // Ignore if not running in Telegram client
  }
};

export const triggerHaptic = (
  style: 'light' | 'medium' | 'heavy' | 'selection' | 'rigid' | 'soft' = 'light'
) => {
  try {
    if (style === 'selection') {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
    } else {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(style);
    }
  } catch {
    // Fallback if not supported
  }
};

export const triggerNotificationHaptic = (type: 'success' | 'warning' | 'error') => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  } catch {
    // Fallback if not supported
  }
};

export const shareToTelegram = (text: string, url: string) => {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }
};
