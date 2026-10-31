import React, { useState } from "react";
import { HealthScore, SecurityIssue, ChangeImpactResult, FileInfo, AIDetectionReport } from "../types";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCode,
  Zap,
  CheckCircle2,
  ArrowRight,
  Info,
  Bot,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import { AIDetectionMeter } from "./AIDetectionMeter";

interface HealthTabProps {
  repositoryId: string;
  health: HealthScore;
  importantFiles: FileInfo[];
  onSelectFile: (filePath: string) => void;
  aiUsage?: AIDetectionReport;
  initialSubTab?: "health" | "security" | "impact" | "ai_meter";
  onNavigateToRepair?: (filePath?: string) => void;
}

export const HealthTab: React.FC<HealthTabProps> = ({
  repositoryId,
  health,
  importantFiles,
  onSelectFile,
  aiUsage,
  initialSubTab = "health",
  onNavigateToRepair
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"health" | "security" | "impact" | "ai_meter">(initialSubTab);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [secLoading, setSecLoading] = useState(false);
  const [secDisclaimer, setSecDisclaimer] = useState("");

  // Change Impact state
  const [targetFile, setTargetFile] = useState(importantFiles[0]?.path || "src/services/auth.ts");
  const [impactResult, setImpactResult] = useState<ChangeImpactResult | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);

  const loadSecurityScan = async () => {
    setSecLoading(true);
    try {
      const res = await api.getSecurityScan(repositoryId);
      setSecurityIssues(res.findings);
      setSecDisclaimer(res.disclaimer);
    } catch {
      // fallback
    } finally {
      setSecLoading(false);
    }
  };

  const handleRunImpact = async () => {
    if (!targetFile) return;
    setImpactLoading(true);
    try {
      const res = await api.checkChangeImpact(repositoryId, targetFile);
      setImpactResult(res);
    } catch {
      // fallback
    } finally {
      setImpactLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeSubTab === "security" && securityIssues.length === 0) {
      loadSecurityScan();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-tab navigation */}
      <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-card border border-cardBorder w-fit">
        <button
          onClick={() => setActiveSubTab("health")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
            activeSubTab === "health"
              ? "bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Codebase Health Telemetry
        </button>
        <button
          onClick={() => setActiveSubTab("ai_meter")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
            activeSubTab === "ai_meter"
              ? "bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>AI Detection Meter {aiUsage ? `(${aiUsage.overall_percentage}%)` : ""}</span>
        </button>
        <button
          onClick={() => setActiveSubTab("security")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
            activeSubTab === "security"
              ? "bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Security Scan
        </button>
        <button
          onClick={() => setActiveSubTab("impact")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
            activeSubTab === "impact"
              ? "bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Change Impact Engine
        </button>
      </div>

      {/* 1. HEALTH TELEMETRY */}
      {activeSubTab === "health" && (
        <div className="space-y-6">
          {/* Main Score Banner */}
          <div className="p-6 rounded-2xl bg-card border border-cardBorder flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-accent-indigo to-accent-cyan p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-background rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-accent-cyan">{health.overall}</span>
                  <span className="text-[10px] font-mono text-slate-500">/ 100</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-mono">Overall Repository Health</h2>
                <p className="text-xs text-slate-400 max-w-lg mt-1 font-sans leading-relaxed">
                  {health.summary}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  <Info className="w-3 h-3" />
                  <span>AI & Static Heuristic Estimate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Architecture", score: health.architecture, desc: "Modularity & Layering" },
              { label: "Maintainability", score: health.maintainability, desc: "Complexity & Churn" },
              { label: "Documentation", score: health.documentation, desc: "Docstrings & Guides" },
              { label: "Testing", score: health.testing, desc: "Test Suites & Coverage" },
              { label: "Security Posture", score: health.security, desc: "Pattern Audit" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-card border border-cardBorder">
                <div className="text-[11px] font-mono text-slate-400 mb-1">{s.label}</div>
                <div className="text-2xl font-bold font-mono text-white mb-1">{s.score}</div>
                <div className="w-full h-1 bg-background rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-accent-cyan rounded-full"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. AI CODE METER */}
      {activeSubTab === "ai_meter" && (
        <AIDetectionMeter
          report={aiUsage}
          onSelectFile={onSelectFile}
        />
      )}

      {/* 2. SECURITY SCAN */}
      {activeSubTab === "security" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-300 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Disclaimer:</span> Findings below are identified via static code pattern analysis and strictly categorized as <b>Potential issues</b> for developer review, not confirmed vulnerabilities.
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-cardBorder overflow-hidden">
            <div className="px-4 py-3 bg-background/60 border-b border-cardBorder flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Potential Code Issues ({securityIssues.length})</span>
              {secLoading && <span className="text-accent-cyan animate-pulse">Scanning patterns...</span>}
            </div>

            <div className="divide-y divide-cardBorder">
              {securityIssues.length > 0 ? (
                securityIssues.map((issue, idx) => (
                  <div key={idx} className="p-4 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          issue.severity === "High" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="font-bold text-white">{issue.category}</span>
                      </div>

                      <div
                        onClick={() => onSelectFile(issue.file_path)}
                        className="text-accent-cyan hover:underline cursor-pointer"
                      >
                        {issue.file_path}:{issue.line_number}
                      </div>
                    </div>

                    <p className="text-slate-300 font-sans">{issue.reason}</p>

                    {issue.snippet && (
                      <pre className="p-2 rounded bg-background text-[11px] text-slate-400 overflow-x-auto">
                        <code>{issue.snippet}</code>
                      </pre>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-emerald-400/90 bg-emerald-500/5 p-2 rounded border border-emerald-500/15">
                      <div className="flex-1">
                        💡 <b>Remediation:</b> {issue.suggested_remediation}
                      </div>
                      {onNavigateToRepair && (
                        <button
                          onClick={() => onNavigateToRepair(issue.file_path)}
                          className="shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 font-bold transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>✨ Auto Repair</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  {secLoading ? "Analyzing repository files..." : "No potential security patterns identified in scanned sample."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. CHANGE IMPACT ENGINE */}
      {activeSubTab === "impact" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-card border border-cardBorder space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-cyan" />
              Change Impact Analysis Engine
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Evaluate the blast radius, affected APIs, and regression risk before modifying any file in the repository.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={targetFile}
                onChange={(e) => setTargetFile(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-background border border-cardBorder text-xs text-white font-mono focus:outline-none focus:border-accent-cyan/50"
              >
                {importantFiles.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.path} ({f.language})
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunImpact}
                disabled={impactLoading}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-accent-cyan text-black font-semibold text-xs font-mono hover:bg-cyan-400 transition"
              >
                {impactLoading ? "Evaluating..." : "Analyze Blast Radius"}
              </button>
            </div>
          </div>

          {impactResult && (
            <div className="p-5 rounded-2xl bg-card border border-cardBorder space-y-4 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-cardBorder">
                <div>
                  <span className="text-slate-500 block text-[11px]">Target File</span>
                  <span className="font-bold text-white text-sm">{impactResult.target_file}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Assessed Blast Risk:</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    impactResult.risk_level === "High" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : impactResult.risk_level === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}>
                    {impactResult.risk_level} Risk
                  </span>
                </div>
              </div>

              <p className="text-slate-300 font-sans">{impactResult.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[11px] mb-2 uppercase">Direct Dependents</span>
                  <div className="space-y-1">
                    {impactResult.direct_dependents.length > 0 ? (
                      impactResult.direct_dependents.map((dep) => (
                        <div key={dep} className="p-2 rounded bg-background border border-cardBorder text-slate-300">
                          {dep}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px] mb-2 uppercase">Affects Test Suites</span>
                  <div className="space-y-1">
                    {impactResult.affected_tests.length > 0 ? (
                      impactResult.affected_tests.map((t) => (
                        <div key={t} className="p-2 rounded bg-background border border-cardBorder text-emerald-300">
                          {t}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">No matching test files</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
