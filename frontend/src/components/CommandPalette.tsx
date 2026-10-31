import React, { useState, useEffect } from "react";
import {
  Search,
  Code2,
  GitBranch,
  Network,
  Cpu,
  ShieldAlert,
  BookOpen,
  Sparkles,
  Layers,
  Trash2,
  X,
  CornerDownLeft,
  Wrench
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onLoadDemo: () => void;
  onPurge: () => void;
  onAskQuestion: (q: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onLoadDemo,
  onPurge,
  onAskQuestion
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: "overview", label: "Open Repository Dashboard", icon: Layers, action: () => onSelectTab("overview") },
    { id: "repair", label: "Open Repository Auto Repair & Bug Fixer", icon: Wrench, action: () => onSelectTab("repair") },
    { id: "archify", label: "Open Archify Architecture Diagrams", icon: Cpu, action: () => onSelectTab("archify") },
    { id: "tree", label: "Explore Interactive Source Tree & AST", icon: Code2, action: () => onSelectTab("tree") },
    { id: "graph", label: "Open Repository Knowledge Graph", icon: Network, action: () => onSelectTab("graph") },
    { id: "chat", label: "Ask Grounded AI (RAG Chat)", icon: Sparkles, action: () => onSelectTab("chat") },
    { id: "git", label: "Open Git GUI & Churn Timeline", icon: GitBranch, action: () => onSelectTab("git") },
    { id: "health", label: "Inspect Codebase Health & Security Scan", icon: ShieldAlert, action: () => onSelectTab("health") },
    { id: "onboarding", label: "Generate New Developer Onboarding Guide", icon: BookOpen, action: () => onSelectTab("onboarding") },
    { id: "auth_q", label: "Ask AI: Where is authentication implemented?", icon: Sparkles, action: () => { onSelectTab("chat"); onAskQuestion("Where is authentication implemented?"); } },
    { id: "demo", label: "Switch to Demo Repository (Nexus Platform)", icon: Sparkles, action: onLoadDemo },
    { id: "purge", label: "Purge Stored Repository Intelligence (Privacy)", icon: Trash2, action: onPurge },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#0B0D11] border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#070709]">
          <Search className="w-4 h-4 text-[#686B73] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or question (e.g. 'archify', 'auth', 'health')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-[#686B73] font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#686B73] hover:text-white hover:bg-white/[0.05] transition"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#14171D] hover:border hover:border-white/[0.08] text-xs text-left transition font-sans group border border-transparent"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#686B73] group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="flex-1 font-medium">{cmd.label}</span>
                  <CornerDownLeft className="w-3.5 h-3.5 text-[#686B73] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#686B73] font-mono">
              No matching commands. Try "architecture", "chat", or "demo".
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-[#070709] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#686B73]">
          <div className="flex items-center space-x-3">
            <span>Select: ⏎</span>
            <span>Close: ESC</span>
          </div>
          <span>RepoRAG Command Menu</span>
        </div>
      </div>
    </div>
  );
};
