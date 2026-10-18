import React from 'react';
import { Play, Bookmark, Sparkles } from 'lucide-react';
import { Video } from '../types';
import { triggerHaptic } from '../services/telegram';
import { getSavedVideoIds, toggleSavedVideoId } from '../services/storage';

interface HeroBannerProps {
  video: Video;
  onPlay: (video: Video) => void;
  onSavedUpdated?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ video, onPlay, onSavedUpdated }) => {
  const [isSaved, setIsSaved] = React.useState<boolean>(() =>
    getSavedVideoIds().includes(video.id)
  );

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const updated = toggleSavedVideoId(video.id);
    setIsSaved(updated.includes(video.id));
    onSavedUpdated?.();
  };

  return (
    <div
      onClick={() => {
        triggerHaptic('medium');
        onPlay(video);
      }}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-slate-800/80 bg-slate-950 aspect-[16/9] sm:aspect-[21/9] max-h-[380px]"
    >
      {/* Background Cover Image */}
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />

      {/* Measured Contrast Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/60 to-transparent" />

      {/* Top Tag */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#24A1DE]">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Featured Premiere</span>
      </div>

      {/* Duration Badge */}
      <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md font-mono text-xs text-white">
        {video.duration}
      </div>

      {/* Bottom Content Area */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 z-10 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="text-[#24A1DE] font-semibold">#{video.category}</span>
          <span aria-hidden="true">·</span>
          <span>{video.channelName}</span>
          <span aria-hidden="true">·</span>
          <span>{video.views.toLocaleString()} views</span>
        </div>

        <h2 className="text-base sm:text-2xl font-bold text-white group-hover:text-[#24A1DE] transition-colors line-clamp-2 max-w-2xl">
          {video.title}
        </h2>

        <p className="text-xs text-slate-300 line-clamp-1 sm:line-clamp-2 max-w-xl hidden sm:block">
          {video.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('medium');
              onPlay(video);
            }}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#24A1DE] hover:bg-[#1f93cc] active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#24A1DE]/30 transition-all"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Watch Premiere</span>
          </button>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-md border text-xs sm:text-sm font-medium transition-all ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Watch Later'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
