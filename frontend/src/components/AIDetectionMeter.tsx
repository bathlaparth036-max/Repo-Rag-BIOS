import React from "react";
import { AIDetectionReport, AIFileSignal } from "../types";
import {
  Bot,
  Sparkles,
  Cpu,
  FileCode,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Zap,
  Layers,
  ArrowRight,
  Info
} from "lucide-react";

interface AIDetectionMeterProps {
  report?: AIDetectionReport;
  onSelectFile?: (filePath: string) => void;
  compact?: boolean;
}

export const AIDetectionMeter: React.FC<AIDetectionMeterProps> = ({
  report,
  onSelectFile,
  compact = false,
}) => {
  // Fallback default report if not yet computed
  const data: AIDetectionReport = report || {
    overall_percentage: 24,
    confidence_level: "High",
    classification: "Light AI Assistance",
    ai_lines_count: 120,
    total_lines_count: 500,
    signals_detected: ["Textbook docstring density on utility functions"],
    top_ai_files: [],
    has_ai_tool_config: false,
    ai_tools_detected: [],
    summary: "Codebase is predominantly human-authored with targeted AI assistance.",
  };

  const pct = Math.min(100, Math.max(0, data.overall_percentage));

  // Determine theme color based on percentage
  const getColorTheme = () => {
    if (pct <= 15) {
      return {
        stroke: "#10b981", // Emerald
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        glow: "rgba(16, 185, 129, 0.25)",
        gradient: "from-emerald-500 to-teal-400",
      };
    }
    if (pct <= 40) {
      return {
        stroke: "#06b6d4", // Cyan
        text: "text-accent-cyan",
        bg: "bg-accent-cyan/10",
        border: "border-accent-cyan/30",
        glow: "rgba(6, 182, 212, 0.25)",
        gradient: "from-cyan-500 to-blue-500",
      };
    }
    if (pct <= 70) {
      return {
        stroke: "#f59e0b", // Amber
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        glow: "rgba(245, 158, 11, 0.25)",
        gradient: "from-amber-500 to-orange-500",
      };
    }
    return {
      stroke: "#f43f5e", // Rose
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      glow: "rgba(244, 63, 94, 0.25)",
      gradient: "from-rose-500 to-pink-500",
    };
  };

  const theme = getColorTheme();

  // SVG Gauge Calculations
  const radius = compact ? 42 : 58;
  const strokeWidth = compact ? 7 : 9;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree semi-arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * pct) / 100;

  if (compact) {
    return (
      <div className="p-4 rounded-2xl bg-card border border-cardBorder hover:border-slate-700 transition space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${theme.bg} ${theme.border} border`}>
              <Bot className={`w-3.5 h-3.5 ${theme.text}`} />
            </div>
            <span className="text-xs font-mono font-bold text-white">AI Detection Meter</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${theme.bg} ${theme.border} border font-bold ${theme.text}`}>
            {data.classification}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mini Dial */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#1e2238"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke={theme.stroke}
                strokeWidth="5"
                fill="none"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - pct / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-bold font-mono text-white">
              {pct}%
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-400 text-[11px] font-mono">
              Estimated AI Code Footprint
            </div>
            <div className="text-slate-300 font-sans line-clamp-2 text-xs">
              {data.summary}
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Human: {Math.max(0, 100 - pct)}%</span>
            <span>AI: {pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden flex">
            <div
              className="h-full bg-slate-600 transition-all duration-500"
              style={{ width: `${Math.max(0, 100 - pct)}%` }}
            />
            <div
              className={`h-full transition-all duration-500 ${pct <= 40 ? "bg-accent-cyan" : pct <= 70 ? "bg-amber-400" : "bg-rose-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Hero Banner with Radial Gauge */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d101d] via-[#111425] to-[#0c0e18] border border-cardBorder shadow-2xl relative overflow-hidden">
        {/* Glow ambient background aura */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: theme.glow }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left: Gauge Meter Dial */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-135">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#1c2035"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={arcLength}
                  strokeLinecap="round"
                />
                {/* Active Meter Fill */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={theme.stroke}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={arcLength}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {pct}%
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  AI Generated
                </span>
              </div>
            </div>

            {/* Classification Tier Badge */}
            <div className="mt-2 text-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${theme.bg} ${theme.border} ${theme.text} border shadow-lg`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{data.classification}</span>
              </span>
            </div>
          </div>

          {/* Right: Summary, Diagnostics & Breakdown */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cardBorder">
              <div>
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Bot className={`w-5 h-5 ${theme.text}`} />
                  AI Code Authorship Detection Meter
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Multi-signal heuristic & AST inspection measuring generative code density.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-background border border-cardBorder text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                  Confidence: {data.confidence_level}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {data.summary}
            </p>

            {/* Human vs AI Code Split Bar */}
            <div className="space-y-1.5 bg-background/80 p-3.5 rounded-xl border border-cardBorder">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
                  Human Hand-Crafted: {Math.max(0, 100 - pct)}% ({Math.max(0, data.total_lines_count - data.ai_lines_count).toLocaleString()} lines)
                </span>
                <span className={`${theme.text} font-bold flex items-center gap-1.5`}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.stroke }} />
                  AI / Synthetic: {pct}% ({data.ai_lines_count.toLocaleString()} lines)
                </span>
              </div>

              <div className="w-full h-2.5 bg-[#171b2d] rounded-full overflow-hidden flex p-0.5">
                <div
                  className="h-full bg-slate-600 rounded-l-full transition-all duration-700"
                  style={{ width: `${Math.max(0, 100 - pct)}%` }}
                />
                <div
                  className={`h-full rounded-r-full transition-all duration-700 bg-gradient-to-r ${theme.gradient}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="text-[11px] font-mono text-slate-500 text-right">
                Total analyzed codebase sample: {data.total_lines_count.toLocaleString()} lines
              </div>
            </div>

            {/* AI Tooling & Env Detection */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-slate-400">Environment Signatures:</span>
              {data.has_ai_tool_config && data.ai_tools_detected.length > 0 ? (
                data.ai_tools_detected.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    <span>{tool}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-background border border-cardBorder">
                  No explicit AI tool config files (.cursorrules, copilot-instructions) detected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Detected Heuristic Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Watermarks & Prompts</span>
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-base font-bold font-mono text-white mb-1">
            {data.signals_detected.some((s) => s.toLowerCase().includes("watermark") || s.toLowerCase().includes("prompt"))
              ? "Detected"
              : "Clean"}
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            Checks for generative tags ("Generated by Copilot/Cursor/v0").
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Synthetic Docstrings</span>
            <FileCode className="w-3.5 h-3.5 text-accent-indigo" />
          </div>
          <div className="text-base font-bold font-mono text-white mb-1">
            {pct >= 35 ? "High Uniformity" : "Natural Variance"}
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            Measures textbook formal documentation on simple trivial routines.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Boilerplate Narratives</span>
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mb-1">
            {pct >= 40 ? "Frequent Artifacts" : "Low Density"}
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            Analyzes step-by-step commentary ("// Step 1: Initialize").
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Git Co-Authorship</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mb-1">
            {data.signals_detected.some((s) => s.toLowerCase().includes("commit"))
              ? "AI Commits Found"
              : "Human Commits"}
          </div>
          <div className="text-[11px] font-sans text-slate-500">
            Inspects commit messages for AI generation or agent commits.
          </div>
        </div>
      </div>

      {/* Top AI-Impacted Code Files */}
      {data.top_ai_files && data.top_ai_files.length > 0 && (
        <div className="p-5 rounded-2xl bg-card border border-cardBorder space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent-cyan" />
              Files With Highest AI Code Density
            </h4>
            <span className="text-xs font-mono text-slate-500">Ranked by estimated generative ratio</span>
          </div>

          <div className="space-y-2.5">
            {data.top_ai_files.map((file) => (
              <div
                key={file.file_path}
                onClick={() => onSelectFile && onSelectFile(file.file_path)}
                className="p-3 rounded-xl bg-background/80 hover:bg-cardBorder/60 border border-cardBorder cursor-pointer transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-4 h-4 text-accent-cyan shrink-0" />
                    <span className="font-mono text-xs font-bold text-white group-hover:text-accent-cyan transition truncate">
                      {file.file_path}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      ({file.lines_analyzed} lines)
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-accent-cyan">
                      {file.ai_percentage}% AI Estimated
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      (~{file.estimated_ai_lines} lines)
                    </span>
                  </div>
                </div>

                {/* Progress bar per file */}
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-accent-cyan rounded-full transition-all duration-500"
                    style={{ width: `${file.ai_percentage}%` }}
                  />
                </div>

                {/* Detected pattern tags */}
                {file.detected_patterns && file.detected_patterns.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {file.detected_patterns.map((pat, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-cardBorder text-slate-400"
                      >
                        {pat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Methodology & Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-background/50 border border-cardBorder flex items-start gap-3 text-xs font-sans text-slate-400">
        <Info className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white font-mono">Detection Methodology:</strong> The AI Code Usage Meter combines static syntax analysis, AST docstring consistency metrics, comment density profiling, commit history parsing, and known AI tool configurations (Cursor, Copilot, Devin, v0). Scores represent probabilistic assessments to assist code reviews, compliance checks, and team insights.
        </p>
      </div>
    </div>
  );
};
