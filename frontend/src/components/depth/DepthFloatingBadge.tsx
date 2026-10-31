import React, { useState } from "react";
import { Sparkles, X, ChevronUp, ArrowRight, Tag } from "lucide-react";

interface DepthFloatingBadgeProps {
  onOpenPricing: () => void;
}

export const DepthFloatingBadge: React.FC<DepthFloatingBadgeProps> = ({
  onOpenPricing,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-in fade-in zoom-in-90 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#11121b]/95 border border-indigo-500/40 text-slate-200 shadow-2xl backdrop-blur-xl hover:border-cyan-400 hover:text-white transition group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono font-semibold">ALL-ACCESS $49</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm sm:max-w-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative group rounded-2xl bg-[#0e0f17]/90 border border-white/[0.12] p-3.5 sm:p-4 backdrop-blur-2xl shadow-2xl shadow-black/80 hover:border-indigo-400/50 transition-all">
        {/* Soft glowing ambient edge */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition duration-500 -z-10"></div>

        {/* Close / Minimize button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(true);
          }}
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#161724] border border-white/[0.15] text-slate-400 hover:text-white flex items-center justify-center transition shadow-md"
          title="Minimize badge"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Content row */}
        <div
          onClick={onOpenPricing}
          className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
        >
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-mono font-bold text-indigo-300">
                <Tag className="w-2.5 h-2.5 mr-0.5" />
                LIMITED OFFER
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold animate-pulse">
                • 94% OFF
              </span>
            </div>

            {/* Promotional tier text requested: ALL-ACCESS $999 $49 | Lifetime • 200+ Templates */}
            <div className="text-xs sm:text-sm font-sans text-slate-200 tracking-tight flex items-center flex-wrap gap-1.5">
              <span className="font-bold text-white tracking-wider font-mono text-xs">
                ALL-ACCESS
              </span>
              <span className="line-through text-slate-500 text-xs">$999</span>
              <span className="text-emerald-400 font-bold font-mono">$49</span>
              <span className="text-slate-400 text-xs">| Lifetime • 200+ Templates</span>
            </div>
          </div>

          {/* Right Action / Made in Framer Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Made in Framer Badge */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/[0.1] text-[10px] font-sans text-slate-300">
              {/* Framer Logo mark */}
              <svg className="w-2.5 h-3" viewBox="0 0 12 16" fill="currentColor">
                <path d="M0 0h12v5.333H6L0 0zm0 5.333h6l6 5.334H0V5.333zm0 5.334h6L0 16v-5.333z" />
              </svg>
              <span>Made in Framer</span>
            </div>

            {/* Click to claim CTA */}
            <button
              onClick={onOpenPricing}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              title="View deal"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
