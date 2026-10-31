import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, GitBranch, Shield, Zap, AlertCircle, Key, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";

interface HeroInputProps {
  onAnalyzeSuccess: (repoId: string) => void;
  onExploreDemo: () => void;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  onAnalyzeSuccess,
  onExploreDemo
}) => {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState(localStorage.getItem("reporag_github_token") || "");
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setError(null);
    setLoading(true);
    setProgressPercent(10);
    setProgressMsg("Validating repository URL...");

    try {
      // 1. Validate
      const val = await api.validateRepo(url);
      if (val.is_cached) {
        setProgressPercent(100);
        setProgressMsg("Repository loaded from cache!");
        setTimeout(() => {
          onAnalyzeSuccess(val.repository_id);
          setLoading(false);
        }, 500);
        return;
      }

      // 2. Start ingestion job (with optional token)
      const currentToken = localStorage.getItem("reporag_github_token") || undefined;
      const job = await api.startAnalysis(url, currentToken);
      setProgressPercent(20);
      setProgressMsg("Ingestion job queued...");

      // 3. Poll progress
      const pollInterval = setInterval(async () => {
        try {
          const status = await api.getJobStatus(job.job_id);
          setProgressPercent(status.progress || 30);
          setProgressMsg(status.message || "Processing repository...");

          if (status.stage === "READY" || status.progress === 100) {
            clearInterval(pollInterval);
            setTimeout(() => {
              onAnalyzeSuccess(status.repository_id);
              setLoading(false);
            }, 500);
          } else if (status.stage === "FAILED") {
            clearInterval(pollInterval);
            setError(status.error || "Ingestion encountered an error.");
            setLoading(false);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setError("Failed to track analysis progress.");
          setLoading(false);
        }
      }, 1200);

    } catch (err: any) {
      setError(err.message || "Failed to analyze repository. Check URL or rate limits.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-4 relative z-10">
      {/* Category / Platform Tag */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#A1A1AA] text-xs font-mono mb-6 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <span>Autonomous GitHub Intelligence Platform</span>
      </div>

      {/* Hero Editorial Heading */}
      <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white max-w-4xl font-sans mb-4 leading-[1.15]">
        Understand Any Repository.{" "}
        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400">
          Ask Anything.
        </span>
      </h1>

      <p className="text-[#A1A1AA] text-sm md:text-base max-w-2xl font-sans mb-10 leading-relaxed">
        Transform any public GitHub repository into a living knowledge graph, interactive architecture map, 
        and grounded RAG intelligence engine.
      </p>

      {/* Elevated Command Bar */}
      <div className="w-full max-w-2xl rounded-2xl bg-[#0B0D11]/90 border border-white/[0.1] p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl transition duration-200 focus-within:border-indigo-400/50 focus-within:ring-1 focus-within:ring-indigo-400/20">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#686B73]" />
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border border-transparent text-sm text-white placeholder:text-[#686B73] focus:outline-none font-mono transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-wider uppercase transition shadow-md disabled:opacity-50 active:scale-[0.99]"
          >
            <span>{loading ? "Analyzing..." : "Analyze"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Token Expander & Technical Footnote */}
        <div className="mt-2.5 flex items-center justify-between px-2 text-[11px] font-mono text-[#A1A1AA]">
          <button
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="hover:text-white flex items-center gap-1.5 transition text-[#A1A1AA]"
          >
            <Key className="w-3 h-3 text-indigo-400" />
            <span>{showTokenInput ? "Hide GitHub Token" : "GitHub Token (Optional for Private Repos)"}</span>
          </button>
          <span className="text-[#686B73] hidden sm:inline">⚡ Rate-limit free via Git shallow protocol</span>
        </div>

        {/* Token Input Drawer */}
        {showTokenInput && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#101217] border border-white/[0.08] flex items-center gap-2 text-xs font-mono animate-in fade-in">
            <input
              type="password"
              placeholder="Paste GitHub PAT (e.g. ghp_...)"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (e.target.value.trim()) {
                  localStorage.setItem("reporag_github_token", e.target.value.trim());
                } else {
                  localStorage.removeItem("reporag_github_token");
                }
              }}
              className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-[#686B73] font-mono text-xs"
            />
            {token && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Token Active</span>
              </span>
            )}
          </div>
        )}

        {/* Live Ingestion Progress Bar */}
        {loading && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] px-2 text-left animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>{progressMsg}</span>
              </span>
              <span className="text-indigo-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#14171D] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quick Demo Button */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <span className="text-xs text-[#686B73] font-mono">Or explore instantly:</span>
        <button
          onClick={onExploreDemo}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0B0D11] hover:bg-[#101217] border border-white/[0.08] hover:border-white/[0.16] text-[#A1A1AA] hover:text-white text-xs font-mono transition duration-150"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>reporag-demo/nexus-platform (Full-Stack AI)</span>
        </button>
      </div>

      {/* Value Pillars Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full text-left">
        <div className="p-5 rounded-2xl bg-[#0B0D11] border border-white/[0.08] hover:border-white/[0.14] transition duration-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <GitBranch className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1.5">Deep AST & Symbol Extraction</h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Extracts classes, interfaces, endpoints, imports, and calls across 12+ programming languages.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D11] border border-white/[0.08] hover:border-white/[0.14] transition duration-200">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1.5">Archify Architecture Engine</h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Auto-generates Mermaid architecture, API flow, authentication sequences, and database schemas.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0D11] border border-white/[0.08] hover:border-white/[0.14] transition duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-white mb-1.5">Grounded Zero-Hallucination RAG</h2>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Every answer is anchored by exact file paths, line ranges, AST symbols, and confidence scores.
          </p>
        </div>
      </div>
    </div>
  );
};
