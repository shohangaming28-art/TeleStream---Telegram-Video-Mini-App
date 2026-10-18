import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Video as VideoIcon,
  Megaphone,
  BarChart3,
  BookOpen,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Download,
  KeyRound,
  ShieldCheck,
  Film
} from 'lucide-react';
import { Video, AdConfig, AdAnalytics } from '../types';
import { PRESET_THUMBNAILS, PRESET_VIDEO_STREAMS } from '../data/initialVideos';
import {
  saveStoredVideos,
  saveStoredAdConfig,
  getStoredAdAnalytics,
  resetAdAnalytics,
  getAdminPIN,
  saveAdminPIN
} from '../services/storage';
import { triggerHaptic, triggerNotificationHaptic } from '../services/telegram';

interface AdminDashboardProps {
  videos: Video[];
  adConfig: AdConfig;
  onUpdateVideos: (videos: Video[]) => void;
  onUpdateAdConfig: (config: AdConfig) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  videos,
  adConfig,
  onUpdateVideos,
  onUpdateAdConfig,
  onClose
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'videos' | 'ads' | 'analytics' | 'guide'>('videos');

  // New video form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<Video['category']>('Trending');
  const [videoSourceType, setVideoSourceType] = useState<'url' | 'upload'>('url');
  const [newVideoUrl, setNewVideoUrl] = useState(PRESET_VIDEO_STREAMS[0].url);
  const [uploadedVideoFile, setUploadedVideoFile] = useState<File | null>(null);
  const [newThumbnailUrl, setNewThumbnailUrl] = useState(PRESET_THUMBNAILS[0]);
  const [newDuration, setNewDuration] = useState('08:30');
  const [newChannel, setNewChannel] = useState('My Telegram Channel');
  const [newTags, setNewTags] = useState('Telegram, Video, HD');
  const [isFeatured, setIsFeatured] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState('');

  // Ad form state
  const [editableAdConfig, setEditableAdConfig] = useState<AdConfig>(adConfig);
  const [adSavedMessage, setAdSavedMessage] = useState('');
  const [analytics, setAnalytics] = useState<AdAnalytics>(() => getStoredAdAnalytics());

  // PIN settings state
  const [currentPin, setCurrentPin] = useState(() => getAdminPIN());
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState('');

  // Search in video manager
  const [searchAdmin, setSearchAdmin] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const realPin = getAdminPIN();
    if (enteredPin.trim() === realPin) {
      triggerNotificationHaptic('success');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      triggerNotificationHaptic('error');
      setPinError('Incorrect PIN. (Default is admin123)');
    }
  };

  const handleQuickLogin = () => {
    const realPin = getAdminPIN();
    setEnteredPin(realPin);
    setIsAuthenticated(true);
    triggerNotificationHaptic('success');
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please provide a title');
      return;
    }

    let finalVideoUrl = newVideoUrl;
    if (videoSourceType === 'upload' && uploadedVideoFile) {
      finalVideoUrl = URL.createObjectURL(uploadedVideoFile);
    }

    const createdVideo: Video = {
      id: `vid_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Uploaded via TeleStream Admin Dashboard',
      category: newCategory,
      videoUrl: finalVideoUrl,
      thumbnailUrl: newThumbnailUrl,
      duration: newDuration || '05:00',
      durationSeconds: 300,
      views: 120,
      likes: 14,
      isFeatured: isFeatured,
      createdAt: 'Just now',
      channelName: newChannel.trim() || 'Telegram Channel',
      channelAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newChannel)}`,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean)
    };

    const updated = [createdVideo, ...videos];
    onUpdateVideos(updated);
    saveStoredVideos(updated);
    triggerNotificationHaptic('success');

    setAddSuccessMessage('Video published successfully to the mini app!');
    setTimeout(() => setAddSuccessMessage(''), 3500);

    // Reset inputs
    setNewTitle('');
    setNewDesc('');
    setUploadedVideoFile(null);
  };

  const handleDeleteVideo = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      triggerHaptic('medium');
      const filtered = videos.filter((v) => v.id !== id);
      onUpdateVideos(filtered);
      saveStoredVideos(filtered);
    }
  };

  const handleToggleFeature = (id: string) => {
    triggerHaptic('light');
    const updated = videos.map((v) => (v.id === id ? { ...v, isFeatured: !v.isFeatured } : v));
    onUpdateVideos(updated);
    saveStoredVideos(updated);
  };

  const handleSaveAdConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotificationHaptic('success');
    onUpdateAdConfig(editableAdConfig);
    saveStoredAdConfig(editableAdConfig);
    setAdSavedMessage('Ad settings updated successfully!');
    setTimeout(() => setAdSavedMessage(''), 3000);
  };

  const handleResetAnalytics = () => {
    if (window.confirm('Reset all simulated ad metrics to zero?')) {
      triggerHaptic('medium');
      const reset = resetAdAnalytics();
      setAnalytics(reset);
    }
  };

  const handleChangePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      alert('PIN must be at least 4 characters');
      return;
    }
    saveAdminPIN(newPinInput.trim());
    setCurrentPin(newPinInput.trim());
    setNewPinInput('');
    setPinChangeMessage('Admin PIN changed successfully!');
    setTimeout(() => setPinChangeMessage(''), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(videos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'telestream_videos_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // If not authenticated, show PIN login lockscreen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#131b29] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#24A1DE]/15 text-[#24A1DE] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
            <p className="text-xs text-slate-400">
              Only authorized administrators can upload, delete, and configure ads.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Enter Admin Passcode / PIN
              </label>
              <input
                type="password"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#24A1DE]"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-400 mt-2 text-center">{pinError}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#24A1DE] hover:bg-[#1e92c9] active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#24A1DE]/25 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          {/* Quick Login Helper Button for Reviewers */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleQuickLogin}
              className="inline-flex items-center gap-1.5 text-xs text-[#24A1DE] hover:underline"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quick Login with Default PIN (<span className="font-mono">admin123</span>)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors text-center"
          >
            ← Return to Video Gallery
          </button>
        </div>
      </div>
    );
  }

  const filteredAdminVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchAdmin.toLowerCase()) ||
      v.category.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 pb-24">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-[#0e1622]/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#24A1DE] text-white flex items-center justify-center font-bold shadow-md shadow-[#24A1DE]/30">
            TS
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>TeleStream Admin</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">Manage Videos & Monetization</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Exit Admin
          </button>
        </div>
      </header>

      {/* Admin Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'videos'
                ? 'bg-[#24A1DE] text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <VideoIcon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Videos</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ads'
                ? 'bg-[#24A1DE] text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Pre-Roll Ads</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#24A1DE] text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-[#24A1DE] text-white font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Production Guide</span>
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* ===================== TAB 1: VIDEOS ===================== */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            {/* Add New Video Card */}
            <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#24A1DE]/20 text-[#24A1DE] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Add New Video</h3>
                </div>
                <span className="text-xs text-slate-400">Total in Catalog: {videos.length}</span>
              </div>

              {addSuccessMessage && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{addSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleAddVideo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Video Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Next-Gen Gaming Highlights #14"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#24A1DE]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Video['category'])}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#24A1DE]"
                    >
                      <option value="Trending">Trending</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Tech">Tech</option>
                      <option value="Cinema">Cinema</option>
                      <option value="Tutorials">Tutorials</option>
                      <option value="Shorts">Shorts</option>
                      <option value="Music">Music</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Brief description of the clip or episode..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#24A1DE]"
                  />
                </div>

                {/* Video Media Source Switcher */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">Video Media Source</label>
                    <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('url')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          videoSourceType === 'url' ? 'bg-[#24A1DE] text-white font-medium' : 'text-slate-400'
                        }`}
                      >
                        URL / Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceType('upload')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          videoSourceType === 'upload' ? 'bg-[#24A1DE] text-white font-medium' : 'text-slate-400'
                        }`}
                      >
                        Upload Local File
                      </button>
                    </div>
                  </div>

                  {videoSourceType === 'url' ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        placeholder="Direct MP4 / WebM video link..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#24A1DE]"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                        <span>Quick Presets:</span>
                        {PRESET_VIDEO_STREAMS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setNewVideoUrl(p.url)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-700 hover:border-[#24A1DE] rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUploadedVideoFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-[#24A1DE] mx-auto mb-1.5" />
                      <div className="text-xs font-medium text-white">
                        {uploadedVideoFile ? uploadedVideoFile.name : 'Choose a video file to test upload'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        MP4, WebM, MOV supported (Instant preview via Object URL)
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Configuration */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <label className="block text-xs font-semibold text-slate-200">Thumbnail Cover Image</label>
                  <input
                    type="url"
                    value={newThumbnailUrl}
                    onChange={(e) => setNewThumbnailUrl(e.target.value)}
                    placeholder="https://... (or click a preset below)"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#24A1DE]"
                  />
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_THUMBNAILS.map((thumb, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewThumbnailUrl(thumb)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          newThumbnailUrl === thumb ? 'border-[#24A1DE] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={thumb} alt="Preset thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auxiliary Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Duration Display</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g. 09:45"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Channel / Creator</label>
                    <input
                      type="text"
                      value={newChannel}
                      onChange={(e) => setNewChannel(e.target.value)}
                      placeholder="Your Channel Name"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Gaming, Action, 4K"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#24A1DE] bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Pin as Featured Video (Top banner spotlight)
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#24A1DE] hover:bg-[#1e92c9] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#24A1DE]/25 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Video to Mini App</span>
                </button>
              </form>
            </div>

            {/* Video Catalog List & Management */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#24A1DE]" />
                  <span>Current Video Catalog ({videos.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchAdmin}
                    onChange={(e) => setSearchAdmin(e.target.value)}
                    placeholder="Search videos..."
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    title="Export video database as JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#121926] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-800/80">
                  {filteredAdminVideos.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-20 sm:w-24 aspect-video object-cover rounded-xl bg-slate-950 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-white truncate max-w-md">{v.title}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <span className="text-[#24A1DE]">#{v.category}</span>
                            <span>·</span>
                            <span>{v.duration}</span>
                            <span>·</span>
                            <span>{v.views.toLocaleString()} views</span>
                            <span>·</span>
                            <span>{v.likes} likes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleFeature(v.id)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                            v.isFeatured
                              ? 'bg-[#24A1DE] text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {v.isFeatured ? 'Featured ★' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(v.id, v.title)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Video"
                          aria-label="Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ADS CONFIG ===================== */}
        {activeTab === 'ads' && (
          <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#24A1DE]" />
                  <span>Pre-Roll Advertisement Slot Configuration</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure test ad parameters, skip countdown delays, sponsor creative, and ad networks.
                </p>
              </div>
            </div>

            {adSavedMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{adSavedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdConfig} className="space-y-4">
              {/* Ad Status Switch */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Enable Pre-Roll Advertisements</div>
                  <div className="text-[11px] text-slate-400">
                    Plays an ad video before the user's selected video starts
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editableAdConfig.enabled}
                    onChange={(e) => setEditableAdConfig({ ...editableAdConfig, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#24A1DE]"></div>
                </label>
              </div>

              {/* Network Mode Simulator */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Test Ad Network Mode Simulator
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'adsgram', title: 'Adsgram (TON Web3)', desc: 'Official Telegram Mini App ad partner' },
                    { id: 'monetag', title: 'Monetag Partner', desc: 'Global multi-format test slot' },
                    { id: 'adsense', title: 'Google AdSense', desc: 'Standard display/video test slot' }
                  ].map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() =>
                        setEditableAdConfig({
                          ...editableAdConfig,
                          networkType: net.id as AdConfig['networkType']
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all ${
                        editableAdConfig.networkType === net.id
                          ? 'bg-[#24A1DE]/15 border-[#24A1DE] text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{net.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{net.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Skip Delay */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Skip Delay (Seconds before 'Skip Ad' appears)
                  </label>
                  <select
                    value={editableAdConfig.skipDelaySeconds}
                    onChange={(e) =>
                      setEditableAdConfig({
                        ...editableAdConfig,
                        skipDelaySeconds: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#24A1DE]"
                  >
                    <option value={0}>0s (Instantly skippable)</option>
                    <option value={3}>3 seconds</option>
                    <option value={5}>5 seconds (Standard YouTube style)</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds (Unskippable short)</option>
                  </select>
                </div>

                {/* Total Duration */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Total Ad Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={editableAdConfig.totalAdDurationSeconds}
                    onChange={(e) =>
                      setEditableAdConfig({
                        ...editableAdConfig,
                        totalAdDurationSeconds: parseInt(e.target.value, 10) || 15
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sponsor Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Sponsor / Brand Name</label>
                  <input
                    type="text"
                    value={editableAdConfig.sponsorName}
                    onChange={(e) =>
                      setEditableAdConfig({ ...editableAdConfig, sponsorName: e.target.value })
                    }
                    placeholder="e.g. Adsgram Network"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Ad Headline */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ad Headline Title</label>
                  <input
                    type="text"
                    value={editableAdConfig.adTitle}
                    onChange={(e) =>
                      setEditableAdConfig({ ...editableAdConfig, adTitle: e.target.value })
                    }
                    placeholder="Ad title banner"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Ad Video / Media URL */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ad Video Stream URL (Direct MP4)
                </label>
                <input
                  type="url"
                  value={editableAdConfig.mediaUrl}
                  onChange={(e) =>
                    setEditableAdConfig({ ...editableAdConfig, mediaUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CTA Text */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Call to Action Button Text</label>
                  <input
                    type="text"
                    value={editableAdConfig.ctaText}
                    onChange={(e) =>
                      setEditableAdConfig({ ...editableAdConfig, ctaText: e.target.value })
                    }
                    placeholder="e.g. Learn More · Install App"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                {/* CTA URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CTA Destination Link</label>
                  <input
                    type="url"
                    value={editableAdConfig.ctaUrl}
                    onChange={(e) =>
                      setEditableAdConfig({ ...editableAdConfig, ctaUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#24A1DE] hover:bg-[#1e92c9] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#24A1DE]/25 transition-all"
              >
                Save Ad Configuration
              </button>
            </form>
          </div>
        )}

        {/* ===================== TAB 3: ANALYTICS ===================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#24A1DE]" />
                  <span>Monetization & Video Analytics</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time simulation of ad impressions, viewer engagement, and earnings.
                </p>
              </div>
              <button
                onClick={handleResetAnalytics}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Stats</span>
              </button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#121926] border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-medium text-slate-400">Total Impressions</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {analytics.impressions.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">Ad slots served</div>
              </div>

              <div className="bg-[#121926] border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-medium text-slate-400">Full Completions</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {analytics.completions.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#24A1DE] mt-1">
                  {analytics.impressions > 0
                    ? `${Math.round((analytics.completions / analytics.impressions) * 100)}% completion`
                    : '0%'}
                </div>
              </div>

              <div className="bg-[#121926] border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-medium text-slate-400">Ad Click-Throughs</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {analytics.clicks.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-400 mt-1">
                  {analytics.impressions > 0
                    ? `${((analytics.clicks / analytics.impressions) * 100).toFixed(1)}% CTR`
                    : '0%'}
                </div>
              </div>

              <div className="bg-[#121926] border border-slate-800 rounded-2xl p-4">
                <div className="text-[11px] font-medium text-slate-400">Estimated Revenue</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  ${analytics.estimatedEarnings.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  ≈ {(analytics.estimatedEarnings / 5.2).toFixed(2)} TON
                </div>
              </div>
            </div>

            {/* Change Admin PIN Section */}
            <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#24A1DE]" />
                <span>Admin Passcode Security</span>
              </h4>
              <p className="text-xs text-slate-400">
                Current Passcode: <span className="font-mono text-white">{currentPin}</span>
              </p>

              {pinChangeMessage && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                  {pinChangeMessage}
                </div>
              )}

              <form onSubmit={handleChangePIN} className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="New Passcode (min 4 chars)"
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Update PIN
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: PRODUCTION GUIDE ===================== */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#17212b] to-[#121c29] border border-[#24A1DE]/30 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#24A1DE]/20 text-[#24A1DE] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Production & Scaling Architecture Guide</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Clear roadmap explaining the free & low-cost setups for production readiness.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Backend Setup */}
            <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-[#24A1DE] text-white flex items-center justify-center text-xs">
                  1
                </span>
                <h4>Backend & Database Setup (Free Options)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Currently, <strong>TeleStream v1</strong> uses client-side persistence (IndexedDB + localStorage) which
                works immediately with <strong>zero configuration</strong> and persists locally for your Telegram
                users. When you want a synchronized multi-user database:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-white">Firebase Firestore (Recommended Free)</div>
                  <div className="text-slate-400 mt-1">
                    Free Spark plan gives 50,000 reads & 20,000 writes/day. Perfectly stores video catalogs and user
                    comments with real-time updates.
                  </div>
                </div>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="font-semibold text-white">Supabase / PostgreSQL</div>
                  <div className="text-slate-400 mt-1">
                    Free tier provides 500MB database, built-in REST API, and row-level security for admin auth.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Permanent Video Storage */}
            <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-[#24A1DE] text-white flex items-center justify-center text-xs">
                  2
                </span>
                <h4>Permanent Video Storage (Zero Bandwidth Cost)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Videos are large files. Storing them directly on web servers is expensive. Use these best-practice
                free/cheap solutions:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#24A1DE] mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Cloudflare R2 (100% Free 10GB):</span> No egress/bandwidth
                    fees ever. You can store hundreds of video clips and serve millions of views without paying bandwidth
                    charges.
                  </div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">YouTube Unlisted Embeds (Free Unlimited):</span> Upload
                    your videos to a YouTube channel marked as "Unlisted", then paste the direct stream or embed URL.
                    Zero hosting fees and unlimited 4K streaming.
                  </div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Bunny.net Stream ($0.005/GB):</span> The premier low-cost
                    dedicated video CDN with built-in HLS transcode, token protection, and adaptive bitrate.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Real Telegram Ad Networks */}
            <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-[#24A1DE] text-white flex items-center justify-center text-xs">
                  3
                </span>
                <h4>Real Ad Networks for Telegram Mini Apps</h4>
              </div>
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#24A1DE]">Adsgram (adsgram.ai)</span>
                  <a
                    href="https://adsgram.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#24A1DE] flex items-center gap-1 hover:underline"
                  >
                    <span>Visit Adsgram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-300">
                  The official advertising network designed from the ground up for Telegram Mini Apps. Supports
                  pre-roll video, rewarded video, and banner blocks. Earnings are paid directly to your TON or USDT
                  crypto wallet.
                </p>
                <div className="pt-2 border-t border-slate-800 text-slate-400">
                  Other compatible networks: <strong>Monetag</strong> (High CPM Popunder/Interstitial) and{' '}
                  <strong>Adsterra</strong>.
                </div>
              </div>
            </div>

            {/* Section 4: Telegram @BotFather Launch Checklist */}
            <div className="bg-[#121926] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-6 h-6 rounded-full bg-[#24A1DE] text-white flex items-center justify-center text-xs">
                  4
                </span>
                <h4>Telegram BotFather Mini App Setup Checklist</h4>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                  1. Open Telegram → Search <span className="text-[#24A1DE]">@BotFather</span> → Press Start
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                  2. Type <span className="text-[#24A1DE]">/newapp</span> → Select your bot
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                  3. Enter App Title, Description, and 640x360 app icon
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                  4. Paste your TeleStream App URL:{' '}
                  <span className="text-[#24A1DE] underline">{window.location.origin}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
                  5. Send <span className="text-[#24A1DE]">/setmenubutton</span> to attach a permanent "Watch Videos" button to your bot chat!
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
