import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, MoreVertical, Send } from 'lucide-react';

interface DeviceFrameProps {
  isFrameMode: boolean;
  onToggleFrameMode: () => void;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ isFrameMode, onToggleFrameMode, children }) => {
  if (!isFrameMode) {
    return <div className="min-h-screen bg-[#0b0f17]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#06090e] py-4 sm:py-8 flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Top Simulator Control Bar */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[430px] px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Telegram Mini App Simulator</span>
        </div>
        <button
          onClick={onToggleFrameMode}
          className="text-xs text-[#24A1DE] hover:underline"
        >
          Expand to Full Screen
        </button>
      </div>

      {/* Phone Shell */}
      <div className="w-full max-w-[420px] h-[860px] bg-[#0b0f17] border-[10px] border-slate-800 rounded-[44px] shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative">
        {/* Dynamic Island / Notch */}
        <div className="w-full bg-[#0b0f17] pt-2 px-6 pb-1 flex items-center justify-between text-white text-[11px] font-medium shrink-0 select-none z-50">
          <span>9:41</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Telegram Header Bar */}
        <div className="w-full bg-[#17212b] px-3 py-2 flex items-center justify-between border-b border-[#0f1620] text-white shrink-0 select-none z-50">
          <div className="flex items-center gap-2">
            <button className="text-[#24A1DE] hover:opacity-80">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1">
                <span>TeleStream Bot</span>
                <Send className="w-2.5 h-2.5 text-[#24A1DE]" />
              </div>
              <div className="text-[10px] text-slate-400">bot · mini app</div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Viewport Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
