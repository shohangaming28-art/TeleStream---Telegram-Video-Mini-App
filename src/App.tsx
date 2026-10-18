import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Bookmark,
  Film,
  Sparkles,
  RefreshCw,
  VideoOff
} from 'lucide-react';
import { Video, AdConfig, TelegramWebAppUser } from './types';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { VideoCard } from './components/VideoCard';
import { HeroBanner } from './components/HeroBanner';
import { VideoPlayerView } from './components/VideoPlayerView';
import { AdminDashboard } from './components/AdminDashboard';
import { DeviceFrame } from './components/DeviceFrame';
import {
  getStoredVideos,
  getStoredAdConfig,
  getSavedVideoIds
} from './services/storage';
import {
  initTelegramSDK,
  getTelegramUser,
  triggerHaptic
} from './services/telegram';

export default function App() {
  const [videos, setVideos] = useState<Video[]>(() => getStoredVideos());
  const [adConfig, setAdConfig] = useState<AdConfig>(() => getStoredAdConfig());
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'duration'>('popular');
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedVideoIds());
  const [isFrameMode, setIsFrameMode] = useState<boolean>(false);
  const [telegramUser, setTelegramUser] = useState<TelegramWebAppUser | null>(null);

  // Initialize Telegram SDK on startup
  useEffect(() => {
    initTelegramSDK();
    const user = getTelegramUser();
    if (user) {
      setTelegramUser(user);
    }
  }, []);

  // Sync Telegram WebApp BackButton
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp?.BackButton) return;
    const bb = window.Telegram.WebApp.BackButton;

    const handleBackClick = () => {
      triggerHaptic('light');
      if (selectedVideo) {
        setSelectedVideo(null);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      }
    };

    if (selectedVideo || activeTab === 'admin') {
      bb.show();
      bb.onClick(handleBackClick);
    } else {
      bb.hide();
      bb.offClick(handleBackClick);
    }

    return () => {
      bb.offClick(handleBackClick);
    };
  }, [selectedVideo, activeTab]);

  const refreshSavedIds = () => {
    setSavedIds(getSavedVideoIds());
  };

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by tab
    if (activeTab === 'trending') {
      result = result.sort((a, b) => b.views - a.views);
    } else if (activeTab === 'shorts') {
      // Videos under 8 minutes or marked as shorts
      result = result.filter((v) => v.durationSeconds <= 480 || v.isShort);
    } else if (activeTab === 'saved') {
      result = result.filter((v) => savedIds.includes(v.id));
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((v) => v.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort order (for home / generic views)
    if (activeTab !== 'trending') {
      if (sortBy === 'popular') {
        result.sort((a, b) => b.views - a.views);
      } else if (sortBy === 'duration') {
        result.sort((a, b) => b.durationSeconds - a.durationSeconds);
      }
    }

    return result;
  }, [videos, activeTab, selectedCategory, searchQuery, sortBy, savedIds]);

  const featuredVideo = useMemo(() => {
    return videos.find((v) => v.isFeatured) || videos[0];
  }, [videos]);

  const relatedVideos = useMemo(() => {
    if (!selectedVideo) return [];
    return videos.filter((v) => v.id !== selectedVideo.id);
  }, [videos, selectedVideo]);

  // Categories list
  const categories = ['All', 'Trending', 'Gaming', 'Tech', 'Cinema', 'Tutorials', 'Music'];

  return (
    <DeviceFrame
      isFrameMode={isFrameMode}
      onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
    >
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between">
        {/* Render Video Player View if a video is active */}
        {selectedVideo ? (
          <VideoPlayerView
            video={selectedVideo}
            adConfig={adConfig}
            relatedVideos={relatedVideos}
            onSelectVideo={(v) => {
              setSelectedVideo(v);
              refreshSavedIds();
            }}
            onBack={() => {
              setSelectedVideo(null);
              refreshSavedIds();
            }}
          />
        ) : activeTab === 'admin' ? (
          /* Render Admin Dashboard if Admin tab is active */
          <AdminDashboard
            videos={videos}
            adConfig={adConfig}
            onUpdateVideos={(updated) => {
              setVideos(updated);
              refreshSavedIds();
            }}
            onUpdateAdConfig={setAdConfig}
            onClose={() => setActiveTab('home')}
          />
        ) : (
          /* Main Mini App Video Feed */
          <div className="pb-24">
            {/* Header */}
            <Header
              user={telegramUser}
              onOpenAdmin={() => {
                setActiveTab('admin');
              }}
              isFrameMode={isFrameMode}
              onToggleFrameMode={() => setIsFrameMode(!isFrameMode)}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              selectedCategory={selectedCategory}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, games, topics, or channels..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121926] border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#24A1DE] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 text-[11px]">Sort:</span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
                    <button
                      onClick={() => {
                        triggerHaptic('selection');
                        setSortBy('popular');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        sortBy === 'popular' ? 'bg-[#24A1DE] text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Popular
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('selection');
                        setSortBy('latest');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        sortBy === 'latest' ? 'bg-[#24A1DE] text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('selection');
                        setSortBy('duration');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        sortBy === 'duration' ? 'bg-[#24A1DE] text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Longest
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Segmented Scrollable Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedCategory(cat);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                        isActive
                          ? 'bg-[#24A1DE] text-white shadow-md shadow-[#24A1DE]/25 font-semibold'
                          : 'bg-[#121926] text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Featured Premiere Banner (Shown on Home Explore when no search query is active) */}
              {activeTab === 'home' && !searchQuery && selectedCategory === 'All' && featuredVideo && (
                <section>
                  <HeroBanner
                    video={featuredVideo}
                    onPlay={(v) => {
                      setSelectedVideo(v);
                      refreshSavedIds();
                    }}
                    onSavedUpdated={refreshSavedIds}
                  />
                </section>
              )}

              {/* Feed Title & Count */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {activeTab === 'trending' ? (
                    <Flame className="w-5 h-5 text-amber-500" />
                  ) : activeTab === 'shorts' ? (
                    <Film className="w-5 h-5 text-[#24A1DE]" />
                  ) : activeTab === 'saved' ? (
                    <Bookmark className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-[#24A1DE]" />
                  )}
                  <h2 className="text-base font-bold text-white">
                    {activeTab === 'trending'
                      ? 'Trending on Telegram'
                      : activeTab === 'shorts'
                      ? 'Short Clips & Highlights'
                      : activeTab === 'saved'
                      ? 'Saved Watch Later'
                      : selectedCategory === 'All'
                      ? 'Recommended Feed'
                      : `${selectedCategory} Videos`}
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
                </span>
              </div>

              {/* Video Grid */}
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVideos.map((vid) => (
                    <VideoCard
                      key={vid.id}
                      video={vid}
                      onSelect={(v) => {
                        setSelectedVideo(v);
                        refreshSavedIds();
                      }}
                      onUpdated={refreshSavedIds}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-[#121926]/40 border border-slate-800/60 rounded-3xl p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <VideoOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No videos found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {activeTab === 'saved'
                      ? 'You have not saved any videos yet. Tap the bookmark icon on any video to add it to your Watch Later list.'
                      : 'No videos match your search or filter. Try clearing the filter or adding a new video in the Admin panel.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </main>
          </div>
        )}

        {/* Fixed Thumb-Friendly Bottom Tab Bar */}
        {!selectedVideo && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            savedCount={savedIds.length}
          />
        )}
      </div>
    </DeviceFrame>
  );
}
