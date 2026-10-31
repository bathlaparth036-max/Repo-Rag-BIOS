import React, { useState } from "react";
import { GitCommit } from "../types";
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  GitPullRequest,
  User,
  Calendar,
  FileCode,
  Search,
  ExternalLink
} from "lucide-react";

interface GitTabProps {
  commits: GitCommit[];
  defaultBranch: string;
  onSelectFile?: (filePath: string) => void;
}

export const GitTab: React.FC<GitTabProps> = ({
  commits,
  defaultBranch,
  onSelectFile
}) => {
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(commits[0] || null);
  const [filter, setFilter] = useState("");

  const filtered = commits.filter(
    (c) =>
      c.message.toLowerCase().includes(filter.toLowerCase()) ||
      c.author.toLowerCase().includes(filter.toLowerCase()) ||
      c.short_hash.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-cardBorder">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-background border border-cardBorder text-xs font-mono text-accent-cyan">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branch: {defaultBranch}</span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {commits.length} commits indexed in current timeline
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search commits or authors..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg bg-background border border-cardBorder text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-accent-cyan/40"
          />
        </div>
      </div>

      {/* Main Grid: Commits List + Commit Impact Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Commits Timeline List */}
        <div className="lg:col-span-7 rounded-2xl bg-card border border-cardBorder p-3 h-[600px] overflow-y-auto space-y-2">
          {filtered.map((c) => {
            const isSelected = selectedCommit?.hash === c.hash;
            return (
              <div
                key={c.hash}
                onClick={() => setSelectedCommit(c)}
                className={`p-3 rounded-xl border cursor-pointer transition text-xs font-mono ${
                  isSelected
                    ? "bg-accent-cyan/15 border-accent-cyan/40 text-white"
                    : "bg-background/60 hover:bg-cardBorder/60 border-cardBorder text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-accent-cyan flex items-center gap-1.5">
                    <GitCommitIcon className="w-3.5 h-3.5" />
                    {c.short_hash}
                  </span>
                  <span className="text-[11px] text-slate-500">{c.date}</span>
                </div>

                <div className="font-sans text-sm text-slate-200 mb-2 line-clamp-2">
                  {c.message}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {c.author}
                  </span>
                  <span>{c.changed_files.length} changed files</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Commit Details Panel */}
        <div className="lg:col-span-5 rounded-2xl bg-card border border-cardBorder p-4 flex flex-col justify-between h-[600px]">
          {selectedCommit ? (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                  Commit Hash
                </span>
                <span className="text-sm font-bold text-white break-all">{selectedCommit.hash}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                  Commit Message
                </span>
                <p className="font-sans text-sm text-slate-200 p-3 rounded-lg bg-background border border-cardBorder">
                  {selectedCommit.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                    Author
                  </span>
                  <span className="text-slate-300">{selectedCommit.author}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                    Date
                  </span>
                  <span className="text-slate-300">{selectedCommit.date}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-2">
                  Files Impacted ({selectedCommit.changed_files.length})
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selectedCommit.changed_files.map((file) => (
                    <div
                      key={file}
                      onClick={() => onSelectFile && onSelectFile(file)}
                      className="p-2 rounded bg-background hover:bg-cardBorder border border-cardBorder flex items-center justify-between cursor-pointer text-slate-300 hover:text-accent-cyan transition"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-slate-500" />
                        {file}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        Modified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 p-8 font-mono text-xs">
              Select a commit from the timeline to inspect impact.
            </div>
          )}

          <div className="pt-3 border-t border-cardBorder text-[11px] font-mono text-slate-500 text-center">
            RepoRAG Git Intelligence Engine
          </div>
        </div>
      </div>
    </div>
  );
};
