import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ThumbsUp,
  Bookmark,
  Share2,
  MessageSquare,
  Sparkles,
  Settings,
  Send,
  Eye,
  Check,
  Copy
} from 'lucide-react';
import { Video, AdConfig, Comment } from '../types';
import { PreRollAdSlot } from './PreRollAdSlot';
import {
  getStoredComments,
  addStoredComment,
  getLikedVideoIds,
  toggleLikedVideoId,
  getSavedVideoIds,
  toggleSavedVideoId
} from '../services/storage';
import { triggerHaptic, shareToTelegram } from '../services/telegram';

interface VideoPlayerViewProps {
  video: Video;
  adConfig: AdConfig;
  relatedVideos: Video[];
  onSelectVideo: (video: Video) => void;
  onBack: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  video,
  adConfig,
  relatedVideos,
  onSelectVideo,
  onBack
}) => {
  const [isPlayingAd, setIsPlayingAd] = useState<boolean>(adConfig.enabled);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(video.durationSeconds || 100);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [quality, setQuality] = useState<string>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Engagement states
  const [liked, setLiked] = useState<boolean>(() => getLikedVideoIds().includes(video.id));
  const [saved, setSaved] = useState<boolean>(() => getSavedVideoIds().includes(video.id));
  const [likeCount, setLikeCount] = useState<number>(video.likes);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(() => getStoredComments(video.id));
  const [newComment, setNewComment] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset ad state when video changes
  useEffect(() => {
    setIsPlayingAd(adConfig.enabled);
    setIsPlaying(false);
    setCurrentTime(0);
    setComments(getStoredComments(video.id));
    setLiked(getLikedVideoIds().includes(video.id));
    setSaved(getSavedVideoIds().includes(video.id));
    setLikeCount(video.likes);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [video.id, adConfig.enabled, video.likes]);

  // Handle controls auto-hide
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }
    }, 3200);
  };

  const handlePlayPause = () => {
    triggerHaptic('light');
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.durationSeconds);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    triggerHaptic('light');
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.8);
        videoRef.current.volume = 0.8;
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    triggerHaptic('selection');
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    triggerHaptic('medium');
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleLike = () => {
    triggerHaptic('medium');
    const { liked: nowLiked } = toggleLikedVideoId(video.id);
    setLiked(nowLiked);
    setLikeCount((prev) => (nowLiked ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleToggleSave = () => {
    triggerHaptic('light');
    const updated = toggleSavedVideoId(video.id);
    setSaved(updated.includes(video.id));
  };

  const handleShare = () => {
    triggerHaptic('light');
    const shareText = `Check out this video on TeleStream: "${video.title}"`;
    const appUrl = window.location.href;
    shareToTelegram(shareText, appUrl);
  };

  const handleCopyLink = () => {
    triggerHaptic('light');
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    triggerHaptic('medium');
    const commentObj: Comment = {
      id: `comm_${Date.now()}`,
      videoId: video.id,
      userName: 'You (Telegram Member)',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CurrentUser',
      text: newComment.trim(),
      timestamp: 'Just now',
      likes: 0
    };
    const updated = addStoredComment(video.id, commentObj);
    setComments(updated);
    setNewComment('');
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 pb-24">
      {/* Sticky Top Mini-Bar */}
      <div className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          aria-label="Back to videos"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider truncate max-w-[180px]">
          {video.category}
        </span>

        <button
          onClick={handleShare}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors"
          title="Share to Telegram"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Video Viewport Container */}
      <div
        ref={playerContainerRef}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
        className="relative w-full aspect-video max-h-[72vh] bg-black overflow-hidden select-none group"
      >
        {isPlayingAd ? (
          <PreRollAdSlot
            config={adConfig}
            onAdFinished={() => {
              setIsPlayingAd(false);
              // Auto-play the main video once ad finishes
              setTimeout(() => {
                if (videoRef.current) {
                  videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                }
              }, 200);
            }}
          />
        ) : (
          <>
            {/* The Main Video Element */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={handlePlayPause}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Tap Overlay to Play / Pause */}
            {!isPlaying && (
              <div
                onClick={handlePlayPause}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shadow-xl shadow-[#24A1DE]/40 hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Custom Interactive Controls Bar */}
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Scrub Progress Bar */}
              <div className="flex items-center gap-2 mb-2 group/scrub">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#24A1DE] hover:h-2 transition-all"
                />
              </div>

              {/* Bottom Row Controls */}
              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className="p-1 hover:text-[#24A1DE] transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <div className="flex items-center gap-1.5 group/vol">
                    <button onClick={toggleMute} className="p-1 hover:text-[#24A1DE] transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 sm:w-20 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-[#24A1DE]"
                    />
                  </div>

                  <span className="font-mono text-[11px] text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 relative">
                  {/* Speed Selector */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(!showSpeedMenu);
                        setShowQualityMenu(false);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-slate-200 transition-colors"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-8 right-0 bg-[#161f30] border border-slate-700 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 z-30 min-w-[70px]">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => changeSpeed(s)}
                            className={`px-2 py-1 text-left text-xs rounded-lg transition-colors ${
                              playbackSpeed === s ? 'bg-[#24A1DE] text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quality Selector */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[11px] font-mono text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{quality}</span>
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-8 right-0 bg-[#161f30] border border-slate-700 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 z-30 min-w-[90px]">
                        {['1080p HD', '720p', '480p', 'Auto'].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              triggerHaptic('selection');
                              setQuality(q.split(' ')[0]);
                              setShowQualityMenu(false);
                            }}
                            className={`px-2 py-1 text-left text-xs rounded-lg transition-colors ${
                              quality === q.split(' ')[0] ? 'bg-[#24A1DE] text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-[#24A1DE] transition-colors"
                    aria-label="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Video Metadata & Actions Container */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {video.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span>{video.views.toLocaleString()} views</span>
            <span aria-hidden="true">·</span>
            <span>{video.createdAt}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#24A1DE] font-medium">#{video.category}</span>
          </div>
        </div>

        {/* Channel & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
            />
            <div>
              <div className="text-sm font-semibold text-white">{video.channelName}</div>
              <div className="text-[11px] text-slate-400">Telegram Verified Creator</div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsSubscribed(!isSubscribed);
              }}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSubscribed
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-[#24A1DE] text-white hover:bg-[#1e92c9]'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {/* Like */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                liked
                  ? 'bg-[#24A1DE]/20 text-[#24A1DE] border border-[#24A1DE]/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="font-mono">{likeCount.toLocaleString()}</span>
            </button>

            {/* Save / Bookmark */}
            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                saved
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Share to Telegram */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              <Share2 className="w-4 h-4 text-[#24A1DE]" />
              <span>Share</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-4 text-sm text-slate-300 leading-relaxed">
          <p>{video.description}</p>
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs text-[#24A1DE]">
              {video.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Telegram Mini App Banner Notice */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#17212b] to-[#121c29] border border-[#24A1DE]/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#24A1DE]/15 text-[#24A1DE] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Stream directly in Telegram</div>
              <div className="text-[11px] text-slate-400">Low bandwidth mode · Zero app install required</div>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-[#24A1DE] hover:bg-[#1e92c9] text-white text-xs font-medium shrink-0 shadow-sm"
          >
            Forward
          </button>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#24A1DE]" />
              <span>Comments ({comments.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Telegram Community</span>
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment from Telegram..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#24A1DE]"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2.5 bg-[#24A1DE] disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shadow-[#24A1DE]/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-800/50 rounded-xl">
                <img
                  src={c.userAvatar}
                  alt={c.userName}
                  className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{c.userName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Up Next / Related Videos */}
        {relatedVideos.length > 0 && (
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Up Next</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedVideos.slice(0, 4).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectVideo(rel);
                  }}
                  className="flex gap-3 p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition-all group"
                >
                  <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-slate-950">
                    <img
                      src={rel.thumbnailUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white">
                      {rel.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <h4 className="text-xs font-semibold text-white group-hover:text-[#24A1DE] line-clamp-2 transition-colors">
                      {rel.title}
                    </h4>
                    <div className="text-[11px] text-slate-400">
                      <span>{rel.views.toLocaleString()} views</span>
                      <span className="mx-1">·</span>
                      <span>{rel.channelName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
