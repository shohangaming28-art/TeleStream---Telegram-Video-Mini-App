import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Volume2, VolumeX, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AdConfig } from '../types';
import { recordAdImpression, recordAdSkip, recordAdCompletion, recordAdClick } from '../services/storage';
import { triggerHaptic } from '../services/telegram';

interface PreRollAdSlotProps {
  config: AdConfig;
  onAdFinished: () => void;
}

export const PreRollAdSlot: React.FC<PreRollAdSlotProps> = ({ config, onAdFinished }) => {
  const [timeLeft, setTimeLeft] = useState(config.totalAdDurationSeconds || 15);
  const [canSkip, setCanSkip] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(config.skipDelaySeconds || 5);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    recordAdImpression();
    setHasStarted(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          recordAdCompletion();
          onAdFinished();
          return 0;
        }
        return prev - 1;
      });

      setSkipCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config, onAdFinished]);

  const handleSkip = () => {
    triggerHaptic('medium');
    recordAdSkip();
    onAdFinished();
  };

  const handleAdClick = () => {
    triggerHaptic('light');
    recordAdClick();
    if (config.ctaUrl) {
      window.open(config.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const progressPercent = Math.min(
    100,
    ((config.totalAdDurationSeconds - timeLeft) / config.totalAdDurationSeconds) * 100
  );

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Ad Video Stream or Fallback Creative */}
      {config.mediaUrl ? (
        <video
          ref={videoRef}
          src={config.mediaUrl}
          autoPlay
          playsInline
          muted={isMuted}
          className="absolute inset-0 w-full h-full object-contain bg-black z-0"
          onEnded={() => {
            recordAdCompletion();
            onAdFinished();
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#131b29] to-[#0d131f] flex items-center justify-center p-6 z-0">
          <div className="text-center max-w-sm">
            <span className="text-xs uppercase tracking-wider text-[#24A1DE] font-semibold">
              {config.networkType === 'adsgram'
                ? 'Adsgram · TON Official Network'
                : config.networkType === 'monetag'
                ? 'Monetag Ad Partner'
                : 'Test Ad Network Slot'}
            </span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">{config.adTitle}</h3>
            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{config.adDescription}</p>
          </div>
        </div>
      )}

      {/* Top Banner Overlay */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/90 text-slate-950 font-semibold text-[11px] rounded tracking-wide shadow-sm">
            <span>Ad · 1 of 1</span>
          </div>
          <span className="text-xs text-white/90 font-medium truncate max-w-[160px] sm:max-w-xs drop-shadow">
            {config.sponsorName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[11px] font-mono text-slate-300">
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 w-full h-1 bg-white/20">
        <div
          className="h-full bg-[#24A1DE] transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Bottom Action Area */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-3">
        {/* Sponsor CTA link */}
        <button
          onClick={handleAdClick}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs font-medium transition-all max-w-[65%] truncate group"
        >
          <span className="truncate">{config.ctaText || 'Learn More'}</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-white shrink-0" />
        </button>

        {/* Skip Ad Button */}
        <div>
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24A1DE] hover:bg-[#1f93cc] active:scale-95 text-white text-xs font-semibold shadow-lg shadow-[#24A1DE]/25 transition-all"
            >
              <span>Skip Ad</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur border border-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5">
              <span>Skip in</span>
              <span className="font-mono text-white font-bold">{skipCountdown}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Ad Watermark Bar */}
      <div className="absolute top-12 left-3 z-10 pointer-events-none">
        <div className="flex items-center gap-1 text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Demo Ad Slot · Configurable in Admin</span>
        </div>
      </div>
    </div>
  );
};
