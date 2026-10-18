import React from 'react';
import { Compass, Flame, Film, Bookmark, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

export type TabType = 'home' | 'trending' | 'shorts' | 'saved' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, savedCount }) => {
  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Explore', icon: Compass },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'shorts', label: 'Shorts', icon: Film },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'admin', label: 'Admin', icon: ShieldCheck }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-t border-slate-800/80 safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('selection');
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all ${
                isActive ? 'text-[#24A1DE]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 bg-amber-500 text-slate-950 text-[9px] font-bold rounded-full font-mono">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
