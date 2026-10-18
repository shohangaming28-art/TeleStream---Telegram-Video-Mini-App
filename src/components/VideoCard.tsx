import React, { useState } from 'react';
import { Play, Bookmark, Share2, ThumbsUp } from 'lucide-react';
import { Video } from '../types';
import { triggerHaptic, shareToTelegram } from '../services/telegram';
import { toggleLikedVideoId, toggleSavedVideoId, getLikedVideoIds, getSavedVideoIds } from '../services/storage';

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
  onUpdated?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, onUpdated }) => {
  const [isLiked, setIsLiked] = useState<boolean>(() => getLikedVideoIds().includes(video.id));
  const [isSaved, setIsSaved] = useState<boolean>(() => getSavedVideoIds().includes(video.id));
  const [likes, setLikes] = useState<number>(video.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    const { liked } = toggleLikedVideoId(video.id);
    setIsLiked(liked);
    setLikes((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
    onUpdated?.();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const updated = toggleSavedVideoId(video.id);
    setIsSaved(updated.includes(video.id));
    onUpdated?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    const text = `Watch "${video.title}" on TeleStream Telegram Mini App`;
    shareToTelegram(text, window.location.href);
  };

  return (
    <article
      onClick={() => {
        triggerHaptic('light');
        onSelect(video);
      }}
      className="group flex flex-col bg-[#121926]/90 hover:bg-[#162030] border border-slate-800/80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99] shadow-sm hover:shadow-lg hover:shadow-black/40"
    >
      {/* 16:9 Thumbnail Frame */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Centered Play Button on hover / touch */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shadow-lg shadow-[#24A1DE]/40">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[11px] font-mono font-medium text-white shadow">
          {video.duration}
        </div>

        {/* Featured badge (unobtrusive) */}
        {video.isFeatured && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#24A1DE]/90 text-[10px] font-semibold text-white tracking-wider uppercase">
            Featured
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
        <div className="flex gap-3 items-start">
          <img
            src={video.channelAvatar}
            alt={video.channelName}
            className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 shrink-0 mt-0.5"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white group-hover:text-[#24A1DE] line-clamp-2 leading-snug transition-colors">
              {video.title}
            </h3>
            {/* Clean unboxed metadata with separators */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span className="truncate max-w-[110px]">{video.channelName}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{video.views.toLocaleString()} views</span>
              <span aria-hidden="true">·</span>
              <span>{video.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span className="text-[#24A1DE] font-medium text-[11px]">#{video.category}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                isLiked ? 'text-[#24A1DE]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Like"
              aria-label="Like video"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleSave}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                isSaved ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Save to Watch Later"
              aria-label="Save to Watch Later"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Share to Telegram"
              aria-label="Share video"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
