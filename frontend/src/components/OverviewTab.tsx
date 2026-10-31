import React, { useState, useEffect } from "react";
import { RepositoryIntelligence } from "../types";
import {
  FileCode,
  Folder,
  Users,
  GitCommit as GitCommitIcon,
  Star,
  GitFork,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Volume2,
  VolumeX,
  Radio,
  Bot,
  Wrench
} from "lucide-react";
import { voiceAssistant, VoiceState } from "../services/voiceAssistant";
import { AIDetectionMeter } from "./AIDetectionMeter";

interface OverviewTabProps {
  repo: RepositoryIntelligence;
  onSelectFile: (filePath: string) => void;
  onSwitchTab: (tab: string) => void;
  onNavigateToRepair?: (filePath?: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  repo,
  onSelectFile,
  onSwitchTab,
  onNavigateToRepair
}) => {
  const [summaryMode, setSummaryMode] = useState<"30s" | "2m" | "5m">("30s");
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAssistant.getState());
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  useEffect(() => {
    const unsub = voiceAssistant.onStateChange((state) => {
      setVoiceState(state);
      if (state === "idle") {
        setIsSpeakingSummary(false);
      }
    });
    return () => unsub();
  }, []);

  const getSummaryContent = () => {
    if (summaryMode === "30s") return repo.summary_30s || repo.overview_summary;
    if (summaryMode === "2m") return repo.summary_2m || repo.overview_summary;
    return repo.summary_5m || repo.overview_summary;
  };

  const handleToggleSpeakSummary = () => {
    if (isSpeakingSummary && voiceState === "speaking") {
      voiceAssistant.stop();
      setIsSpeakingSummary(false);
    } else {
      setIsSpeakingSummary(true);
      voiceAssistant.speak(getSummaryContent(), {
        onEnd: () => setIsSpeakingSummary(false)
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Files</span>
            <FileCode className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{repo.file_count}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Directories</span>
            <Folder className="w-3.5 h-3.5 text-accent-indigo" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{repo.directory_count}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Dependencies</span>
            <Cpu className="w-3.5 h-3.5 text-accent-purple" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{repo.dependencies.length}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Commits</span>
            <GitCommitIcon className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{repo.commit_count}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Stars</span>
            <Star className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{repo.stars.toLocaleString()}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-cardBorder">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span>Health Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-accent-cyan">{repo.health.overall}/100</div>
        </div>

        <div
          onClick={() => onSwitchTab("health")}
          className="p-3.5 rounded-xl bg-card border border-cardBorder hover:border-accent-cyan/50 cursor-pointer transition group"
          title="Click to view AI Usage Detection Audit"
        >
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
            <span className="group-hover:text-accent-cyan transition">AI Meter</span>
            <Bot className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-accent-cyan flex items-baseline gap-1">
            <span>{repo.ai_usage?.overall_percentage ?? 0}%</span>
            <span className="text-[10px] text-slate-400 font-normal truncate">
              {repo.ai_usage ? repo.ai_usage.classification.split(" ")[0] : "AI"}
            </span>
          </div>
        </div>
      </div>

      {/* Auto Repair Quick Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-card to-indigo-950/20 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono text-white">AUTO REPAIR ENGINE READY</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                SAFE PATCHES READY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Identified null dereferences, missing reject handlers, and security risks with verified Git-style diffs.
            </p>
          </div>
        </div>

        <button
          onClick={() => (onNavigateToRepair ? onNavigateToRepair() : onSwitchTab("repair"))}
          className="shrink-0 flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-cyan to-indigo-500 text-black font-bold text-xs font-mono hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/15"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Auto Repair</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: AI Summary + Architecture Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Codebase Explanation */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-cardBorder flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                  AI Codebase Intelligence Summary
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {/* Audio Listen Button */}
                <button
                  onClick={handleToggleSpeakSummary}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
                    isSpeakingSummary && voiceState === "speaking"
                      ? "bg-accent-cyan text-black border-accent-cyan font-bold shadow-md shadow-accent-cyan/20 animate-pulse"
                      : "bg-background hover:bg-cardBorder border-cardBorder text-accent-cyan hover:text-white"
                  }`}
                  title={isSpeakingSummary && voiceState === "speaking" ? "Stop reading" : "Listen to this AI summary"}
                >
                  {isSpeakingSummary && voiceState === "speaking" ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                {/* Mode toggles */}
                <div className="flex items-center space-x-1 p-1 rounded-lg bg-background border border-cardBorder text-xs font-mono">
                  <button
                    onClick={() => setSummaryMode("30s")}
                    className={`px-2.5 py-1 rounded transition ${
                      summaryMode === "30s" ? "bg-accent-cyan/20 text-accent-cyan font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    30s Pitch
                  </button>
                  <button
                    onClick={() => setSummaryMode("2m")}
                    className={`px-2.5 py-1 rounded transition ${
                      summaryMode === "2m" ? "bg-accent-cyan/20 text-accent-cyan font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    2m Overview
                  </button>
                  <button
                    onClick={() => setSummaryMode("5m")}
                    className={`px-2.5 py-1 rounded transition ${
                      summaryMode === "5m" ? "bg-accent-cyan/20 text-accent-cyan font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    5m Deep Dive
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line mb-6">
              {getSummaryContent()}
            </p>
          </div>

          {/* Quick Questions to ask */}
          <div className="pt-4 border-t border-cardBorder">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
              Recommended Inquiries
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "Where is authentication implemented?",
                "How does data flow from frontend to database?",
                "Which modules are tightly coupled?",
                "Generate onboarding documentation"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    onSwitchTab("chat");
                  }}
                  className="px-2.5 py-1 rounded-md bg-background/80 hover:bg-cardBorder border border-cardBorder text-slate-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Spec Card */}
        <div className="p-5 rounded-2xl bg-card border border-cardBorder flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-4 h-4 text-accent-indigo" />
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                Architecture Blueprint
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 block font-mono text-[11px] mb-1">Architectural Pattern</span>
                <span className="inline-block px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                  {repo.architecture.style}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-mono text-[11px] mb-1">Entry Points</span>
                <div className="space-y-1">
                  {repo.architecture.entry_points.length > 0 ? (
                    repo.architecture.entry_points.map((ep) => (
                      <div
                        key={ep}
                        onClick={() => onSelectFile(ep)}
                        className="font-mono text-accent-cyan hover:underline cursor-pointer truncate"
                      >
                        {ep}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500">Root / default dispatcher</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-mono text-[11px] mb-1">Storage & Persistence</span>
                <div className="flex flex-wrap gap-1.5">
                  {repo.architecture.databases.map((db) => (
                    <span key={db} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                      {db}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSwitchTab("archify")}
            className="mt-6 w-full py-2.5 rounded-xl bg-cardBorder hover:bg-slate-700 text-white text-xs font-mono font-medium transition flex items-center justify-center gap-2"
          >
            <span>Open Archify Diagrams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Code Authorship & Detection Meter Section */}
      <AIDetectionMeter
        report={repo.ai_usage}
        onSelectFile={onSelectFile}
      />

      {/* Languages and Important Files */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Languages Breakdown */}
        <div className="p-5 rounded-2xl bg-card border border-cardBorder">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider mb-4">
            Languages & Frameworks
          </h3>

          <div className="space-y-3">
            {Object.entries(repo.languages).map(([lang, pct]) => (
              <div key={lang}>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">{lang}</span>
                  <span className="text-slate-500">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-cyan rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {repo.frameworks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-cardBorder">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                Frameworks Detected
              </span>
              <div className="flex flex-wrap gap-1.5">
                {repo.frameworks.map((fw) => (
                  <span key={fw} className="px-2 py-1 rounded bg-background border border-cardBorder text-slate-300 font-mono text-xs">
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Important Files */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-cardBorder">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Top Important Code Files
            </h3>
            <span className="text-xs text-slate-500 font-mono">Ranked by AI Centrality</span>
          </div>

          <div className="space-y-2">
            {repo.important_files.slice(0, 5).map((f) => (
              <div
                key={f.path}
                onClick={() => onSelectFile(f.path)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 hover:bg-cardBorder/60 border border-cardBorder cursor-pointer transition group"
              >
                <div className="flex items-center space-x-3 truncate">
                  <FileCode className="w-4 h-4 text-accent-cyan shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-mono text-white group-hover:text-accent-cyan transition">
                      {f.path}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      ({f.language} • {f.line_count} lines)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                    AI Importance: {Math.round(f.ai_importance_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
