import React, { useState, useEffect } from "react";
import { Zap, Brain, Sparkles, Check, ArrowRight, Gauge } from "lucide-react";

interface DepthModesSectionProps {
  activeMode: "auto" | "fast" | "think";
  onSelectMode: (mode: "auto" | "fast" | "think") => void;
}

export const DepthModesSection: React.FC<DepthModesSectionProps> = ({
  activeMode,
  onSelectMode,
}) => {
  // Fast mode motion line animation counter
  const [fastFrame, setFastFrame] = useState(0);
  const [thinkStep, setThinkStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setFastFrame((prev) => (prev + 1) % 6);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const thinkInterval = setInterval(() => {
      setThinkStep((prev) => (prev % 4) + 1);
    }, 1400);
    return () => clearInterval(thinkInterval);
  }, []);

  // Motion stream variations for Fast mode
  const motionLines = [
    ">((( <        ",
    "  >((( <      ",
    "    >((( <    ",
    "      >((( <  ",
    "        >((( <",
    " >((( <       ",
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
          <span className="text-[11px] font-mono tracking-wider text-cyan-400 font-semibold uppercase">
            [01] MODES
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight font-sans">
          Choose how <span className="font-semibold text-white">depth answers.</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-400 font-sans max-w-xl mx-auto">
          From instantaneous reflex replies to deep recursive multi-hop thought traces. Switch dynamically or let our neural router decide.
        </p>
      </div>

      {/* Cards Layout: Three interactive mode cards side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* CARD 1: AUTO */}
        <div
          onClick={() => onSelectMode("auto")}
          className={`cursor-pointer group relative rounded-2xl p-6 sm:p-7 transition-all duration-300 backdrop-blur-xl border ${
            activeMode === "auto"
              ? "bg-[#101217] border-indigo-400/50 shadow-xl ring-1 ring-indigo-400/30"
              : "bg-[#0B0D11] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#101217]"
          }`}
        >
          {/* Active Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-cyan-300 font-semibold uppercase">
                Adaptive
              </span>
            </div>
            {activeMode === "auto" && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/30">
                <Check className="w-3 h-3" />
                <span>Selected</span>
              </span>
            )}
          </div>

          <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">Auto</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            Picks the right speed for each question.
          </p>

          {/* Visual: Preview graphic of a simple animated pixel fish */}
          <div className="h-44 rounded-xl bg-black/40 border border-white/[0.06] p-4 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-cyan-400/30 transition">
            {/* Background coordinate grid */}
            <div className="absolute inset-0 bg-floating-grid opacity-30"></div>

            {/* Glowing pixel fish visual */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative animate-float-slow">
                {/* SVG Pixel Fish with undulating animation */}
                <svg
                  width="110"
                  height="64"
                  viewBox="0 0 110 64"
                  fill="none"
                  className="filter drop-shadow-[0_0_12px_rgba(0,242,254,0.45)]"
                >
                  {/* Tail pixels */}
                  <rect x="8" y="24" width="8" height="16" fill="#00f2fe" opacity="0.8" />
                  <rect x="16" y="20" width="8" height="24" fill="#00f2fe" />
                  <rect x="24" y="28" width="8" height="8" fill="#38bdf8" />

                  {/* Body pixels */}
                  <rect x="32" y="16" width="8" height="32" fill="#00f2fe" />
                  <rect x="40" y="12" width="16" height="40" fill="#38bdf8" />
                  <rect x="56" y="8" width="16" height="48" fill="#00f2fe" />
                  <rect x="72" y="12" width="16" height="40" fill="#38bdf8" />
                  <rect x="88" y="20" width="8" height="24" fill="#00f2fe" />

                  {/* Snout */}
                  <rect x="96" y="28" width="8" height="8" fill="#7dd3fc" />

                  {/* Eye */}
                  <rect x="80" y="20" width="6" height="6" fill="#ffffff" />
                  <rect x="83" y="22" width="3" height="3" fill="#0b0b0e" />

                  {/* Fin */}
                  <rect x="48" y="36" width="12" height="6" fill="#0284c7" />
                </svg>

                {/* Micro bubbles */}
                <div className="absolute -top-2 right-0 w-2 h-2 rounded-full bg-cyan-300/40 animate-ping"></div>
              </div>

              <div className="mt-4 flex items-center space-x-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Latency: Adaptive (60ms - 420ms)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Routing: Heuristic ML</span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
              Active mode <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* CARD 2: FAST */}
        <div
          onClick={() => onSelectMode("fast")}
          className={`cursor-pointer group relative rounded-2xl p-6 sm:p-7 transition-all duration-300 backdrop-blur-xl border ${
            activeMode === "fast"
              ? "bg-[#101217] border-indigo-400/50 shadow-xl ring-1 ring-indigo-400/30"
              : "bg-[#0B0D11] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#101217]"
          }`}
        >
          {/* Active Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-indigo-300 font-semibold uppercase">
                Sub-50ms
              </span>
            </div>
            {activeMode === "fast" && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/30">
                <Check className="w-3 h-3" />
                <span>Selected</span>
              </span>
            )}
          </div>

          <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">Fast</h3>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
            Quick answers for everyday questions.
          </p>

          {/* Visual: ASCII/text-based motion lines (>((( <) */}
          <div className="h-44 rounded-xl bg-black/40 border border-white/[0.06] p-4 flex flex-col justify-center relative overflow-hidden group-hover:border-indigo-400/30 transition">
            <div className="absolute inset-0 bg-floating-grid opacity-20"></div>

            <div className="relative z-10 font-mono text-xs text-indigo-300 space-y-2.5">
              <div className="text-[11px] text-slate-500 flex justify-between items-center border-b border-white/[0.05] pb-1">
                <span>STREAM SPEED: 140 tok/s</span>
                <span className="text-indigo-400 font-bold">42ms</span>
              </div>

              {/* Streaming ASCII motion lines */}
              <div className="py-2 space-y-1.5 font-bold tracking-widest text-indigo-200">
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-400 font-extrabold text-sm transition-all duration-75">
                    {motionLines[fastFrame]}
                  </span>
                  <span className="text-slate-600 text-[10px] tracking-normal font-normal">
                    &gt;&gt;&gt; token_burst [0x8A]
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-cyan-300 font-extrabold text-sm transition-all duration-75">
                    {motionLines[(fastFrame + 2) % 6]}
                  </span>
                  <span className="text-slate-600 text-[10px] tracking-normal font-normal">
                    &gt;&gt;&gt; pipeline_ready
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-400 font-extrabold text-sm transition-all duration-75">
                    {motionLines[(fastFrame + 4) % 6]}
                  </span>
                  <span className="text-slate-600 text-[10px] tracking-normal font-normal">
                    &gt;&gt;&gt; answer_delivered
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-[#A1A1AA]">
                <span className="flex items-center space-x-1">
                  <Gauge className="w-3 h-3 text-indigo-400" />
                  <span>Instant reflex</span>
                </span>
                <span className="text-indigo-400">Zero chain delay</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#A1A1AA]">
            <span>Model: Depth-Flash-9B</span>
            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
              Active mode <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* CARD 3: THINK */}
        <div
          onClick={() => onSelectMode("think")}
          className={`cursor-pointer group relative rounded-2xl p-6 sm:p-7 transition-all duration-300 backdrop-blur-xl border ${
            activeMode === "think"
              ? "bg-[#101217] border-purple-400/50 shadow-xl ring-1 ring-purple-400/30"
              : "bg-[#0B0D11] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#101217]"
          }`}
        >
          {/* Active Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-purple-300 font-semibold uppercase">
                Deep Reason
              </span>
            </div>
            {activeMode === "think" && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-400/30">
                <Check className="w-3 h-3" />
                <span>Selected</span>
              </span>
            )}
          </div>

          <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">Think</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            Takes longer to work through hard problems.
          </p>

          {/* Visual: Complex glowing ASCII octopus / grid visual */}
          <div className="h-44 rounded-xl bg-black/40 border border-white/[0.06] p-3 flex flex-col justify-between relative overflow-hidden group-hover:border-purple-400/30 transition">
            <div className="absolute inset-0 bg-floating-grid opacity-20"></div>

            <div className="relative z-10 flex items-center justify-between">
              {/* ASCII Octopus Art with Bioluminescent Glow */}
              <pre className="font-mono text-[9px] sm:text-[10px] leading-[11px] text-purple-300 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] select-none">
{`    .-""""-.
  .'  ____  '.
 /   (o)(o)   \\
|   /  ==  \\   |
 \\  '------'  /
  / /\\    /\\ \\
 ( (  )(  )  ) )
  \\ \\/  \\/  / /`}
              </pre>

              {/* Step-by-Step Reasoning Tree preview */}
              <div className="text-[10px] font-mono space-y-1.5 pl-2 border-l border-white/[0.08] text-slate-300">
                <div
                  className={`flex items-center space-x-1.5 ${
                    thinkStep >= 1 ? "text-purple-300 font-bold" : "text-slate-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>1. Decompose Query</span>
                </div>
                <div
                  className={`flex items-center space-x-1.5 ${
                    thinkStep >= 2 ? "text-purple-300 font-bold" : "text-slate-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>2. Branch Hypothesis</span>
                </div>
                <div
                  className={`flex items-center space-x-1.5 ${
                    thinkStep >= 3 ? "text-purple-300 font-bold" : "text-slate-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>3. Verify Invariants</span>
                </div>
                <div
                  className={`flex items-center space-x-1.5 ${
                    thinkStep >= 4 ? "text-cyan-300 font-bold" : "text-slate-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>4. Synthesize Truth</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-purple-400">
              <span>Reasoning Depth: 16k tokens</span>
              <span className="text-slate-400">Self-critique active</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Model: Depth-Reason-Ultra</span>
            <span className="text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center">
              Active mode <ArrowRight className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
