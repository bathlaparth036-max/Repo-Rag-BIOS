import React, { useEffect, useState } from "react";
import { RepositoryIntelligence } from "../types";
import { BookOpen, Terminal, CheckCircle, AlertTriangle, Layers, ArrowRight } from "lucide-react";
import { api } from "../services/api";

interface OnboardingTabProps {
  repo: RepositoryIntelligence;
  onSelectFile: (filePath: string) => void;
}

export const OnboardingTab: React.FC<OnboardingTabProps> = ({ repo, onSelectFile }) => {
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      try {
        const res = await api.getOnboardingGuide(repo.id);
        setGuide(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [repo.id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-accent-cyan animate-pulse">
        Generating AI Developer Onboarding Guide...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Title Card */}
      <div className="p-6 rounded-2xl bg-card border border-cardBorder">
        <div className="flex items-center space-x-2 text-accent-cyan text-xs font-mono mb-2">
          <BookOpen className="w-4 h-4" />
          <span>New Developer Mode</span>
        </div>
        <h2 className="text-xl font-bold font-mono text-white mb-2">
          Developer Onboarding Guide — {repo.repository_name}
        </h2>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {guide?.project_overview || repo.overview_summary}
        </p>
      </div>

      {/* How to Run */}
      <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          How to Run & Spin Up Locally
        </h3>
        <div className="space-y-2 text-xs font-mono">
          {guide?.how_to_run?.map((step: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-background border border-cardBorder text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Entry Points & Main Logic */}
      <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-cyan" />
          Where Key Logic & Entrypoints Live
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {repo.architecture.entry_points.map((ep) => (
            <div
              key={ep}
              onClick={() => onSelectFile(ep)}
              className="p-3 rounded-xl bg-background hover:bg-cardBorder border border-cardBorder cursor-pointer text-accent-cyan hover:underline transition flex items-center justify-between"
            >
              <span>{ep}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Common Mistakes to Avoid */}
      <div className="p-6 rounded-2xl bg-card border border-cardBorder space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Common Pitfalls & Architectural Conventions
        </h3>
        <div className="space-y-2 text-xs font-sans">
          {guide?.common_mistakes_to_avoid?.map((item: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-slate-300 flex items-center gap-2">
              <span className="text-amber-400 font-bold shrink-0">⚠️</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
