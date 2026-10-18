import React from 'react';
import { ShieldCheck, Smartphone, Monitor, PlaySquare, Send } from 'lucide-react';
import { TelegramWebAppUser } from '../types';
import { triggerHaptic } from '../services/telegram';

interface HeaderProps {
  user: TelegramWebAppUser | null;
  onOpenAdmin: () => void;
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAdmin,
  isFrameMode,
  onToggleFrameMode,
  onSelectCategory,
  selectedCategory
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Strict 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#24A1DE] to-[#38bdf8] flex items-center justify-center text-white shadow-md shadow-[#24A1DE]/30">
            <PlaySquare className="w-4 h-4 fill-current text-white" />
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('All');
            }}
            className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-[#24A1DE] transition-colors"
          >
            TeleStream
          </a>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean text links) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          {['All', 'Trending', 'Gaming', 'Tech', 'Cinema', 'Tutorials'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic('selection');
                onSelectCategory(cat);
              }}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat ? 'text-[#24A1DE] font-semibold' : ''
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Desktop Frame / Fullscreen Simulator Switch */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleFrameMode();
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
            title="Toggle between Telegram Mobile Shell view and Full Responsive layout"
          >
            {isFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#24A1DE]" />
                <span>Full Layout</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#24A1DE]" />
                <span>Telegram View</span>
              </>
            )}
          </button>

          {/* Telegram User Badge or Guest Avatar */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shrink-0">
            <div className="w-5 h-5 rounded-full bg-[#24A1DE]/20 text-[#24A1DE] flex items-center justify-center text-[10px] font-bold">
              {user ? user.first_name[0] : <Send className="w-3 h-3 text-[#24A1DE]" />}
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate max-w-[90px] sm:max-w-[120px]">
              {user ? user.first_name : 'TG User'}
            </span>
          </div>

          {/* Admin Dashboard Trigger */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenAdmin();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24A1DE] hover:bg-[#1f93cc] active:scale-95 text-white text-xs font-semibold shadow-md shadow-[#24A1DE]/25 transition-all whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
