import React, { useState } from "react";
import {
  Search,
  Command,
  Clock,
  FileText,
  Bookmark,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  Check,
  Eye,
  Key
} from "lucide-react";

interface DepthSearchAndMemorySectionProps {
  onOpenCommandPalette: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export const DepthSearchAndMemorySection: React.FC<DepthSearchAndMemorySectionProps> = ({
  onOpenCommandPalette,
  onSelectPrompt,
}) => {
  // Search preview active selection
  const [selectedSearchItem, setSelectedSearchItem] = useState<string>("chat-1");

  // Memory block active preview
  const [activeMemoryId, setActiveMemoryId] = useState<string>("mem-1");

  const recentChats = [
    {
      id: "chat-1",
      title: "Plan next week around the product launch",
      time: "2 hours ago",
      tags: ["Launch", "Sprint"],
      preview:
        "Drafted timeline for v2.4 launch: Press kit release on Tuesday, team AMA on Wednesday, rollout canary to 20% on Thursday.",
    },
    {
      id: "chat-2",
      title: "Summarise the notes from Monday's call",
      time: "Yesterday",
      tags: ["Meeting", "Synthesis"],
      preview:
        "Synthesized 45-minute sync with infra team: Prioritize zero-downtime database migration and reduce API latency to sub-50ms.",
    },
    {
      id: "chat-3",
      title: "Architecture review for real-time sync engine",
      time: "3 days ago",
      tags: ["Engineering"],
      preview:
        "Evaluated CRDTs vs OT. Settled on Yjs with local SQLite edge storage for offline-first state synchronization.",
    },
  ];

  const libraryTemplates = [
    {
      id: "tmpl-1",
      title: "Weekly report",
      category: "Operations",
      description: "Auto-extracts milestones, blockers, metrics, and objectives for leadership.",
    },
    {
      id: "tmpl-2",
      title: "Inbox triage",
      category: "Productivity",
      description: "Groups unread communications into Urgent, Review, and Delegate buckets.",
    },
    {
      id: "tmpl-3",
      title: "Executive brief",
      category: "Strategy",
      description: "Distills complex multi-page memos into a 3-bullet decision matrix.",
    },
  ];

  const memories = [
    {
      id: "mem-1",
      category: "Engineering Conventions",
      title: "Tech Stack & Code Guidelines",
      content:
        "Prefers TypeScript + Vite + Tailwind. Enforces strict zero-telemetry, clean modular architecture, and sub-100ms response targets.",
      lastRecalled: "Used 4 mins ago",
      confidence: "99.4%",
    },
    {
      id: "mem-2",
      category: "Writing Style",
      title: "Executive Voice Preferences",
      content:
        "Tone should be direct, crisp, and high-density. Avoid filler phrases, buzzwords, and redundant introductions.",
      lastRecalled: "Used 18 mins ago",
      confidence: "98.9%",
    },
    {
      id: "mem-3",
      category: "Team Hierarchy",
      title: "Stakeholder Alignment",
      content:
        "Maya leads product design, Liam leads distributed infrastructure, and Elena audits security & cryptographic keys.",
      lastRecalled: "Used 1 hour ago",
      confidence: "97.8%",
    },
    {
      id: "mem-4",
      category: "Active Milestone",
      title: "Sprint Objective: v2.4 Launch",
      content:
        "Release v2.4 Abyssal Engine with deep ASCII marine aesthetics, responsive command palette, and lifetime license portal.",
      lastRecalled: "Active in context",
      confidence: "100%",
    },
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative space-y-32">
      {/* ======================================================== */}
      {/* SECTION [02] SEARCH */}
      {/* ======================================================== */}
      <section id="search" className="relative">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
            <span className="text-[11px] font-mono tracking-wider text-indigo-400 font-semibold uppercase">
              [02] SEARCH
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight font-sans">
            Find anything with <span className="font-semibold text-white">⌘K</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-sans max-w-xl">
            A unified command palette that indexes past discussions, workflow templates, and knowledge repositories with zero latency.
          </p>
        </div>

        {/* Global Command Menu Dropdown Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Command Menu Interface Mockup */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0f1018]/90 border border-white/[0.1] shadow-2xl backdrop-blur-2xl p-4 sm:p-6 overflow-hidden">
            {/* Interactive Search Header */}
            <div
              onClick={onOpenCommandPalette}
              className="group cursor-pointer flex items-center justify-between p-3.5 rounded-xl bg-[#161722] border border-white/[0.08] hover:border-indigo-400/50 transition mb-6 shadow-inner"
            >
              <div className="flex items-center space-x-3 text-slate-400 group-hover:text-white transition">
                <Search className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-sans text-slate-300">
                  Find anything with <span className="font-semibold text-white">⌘K</span>...
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white/[0.07] border border-white/[0.12] text-[11px] font-mono text-slate-300 shadow-sm">
                  <Command className="w-3 h-3 mr-0.5" />
                  <span>K</span>
                </kbd>
                <span className="text-xs font-mono text-indigo-400 group-hover:underline">
                  Open Palette
                </span>
              </div>
            </div>

            {/* Dropdown Section 1: Recent Chats */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 px-1">
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recent chats</span>
                </span>
                <span className="text-[10px] text-slate-500">History</span>
              </div>

              <div className="space-y-1.5">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedSearchItem(chat.id);
                      onSelectPrompt(chat.title);
                    }}
                    onMouseEnter={() => setSelectedSearchItem(chat.id)}
                    className={`cursor-pointer p-3 rounded-xl transition flex items-center justify-between border ${
                      selectedSearchItem === chat.id
                        ? "bg-indigo-600/15 border-indigo-400/40 text-white"
                        : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium truncate">{chat.title}</div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>{chat.time}</span>
                          <span>•</span>
                          <span>{chat.tags.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        selectedSearchItem === chat.id
                          ? "text-indigo-400 translate-x-1"
                          : "text-slate-600 opacity-0"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdown Section 2: Library Templates */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 px-1">
                <span className="flex items-center space-x-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                  <span>Library templates</span>
                </span>
                <span className="text-[10px] text-slate-500">200+ Available</span>
              </div>

              <div className="space-y-1.5">
                {libraryTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedSearchItem(tmpl.id);
                      onSelectPrompt(`Run template: ${tmpl.title}`);
                    }}
                    onMouseEnter={() => setSelectedSearchItem(tmpl.id)}
                    className={`cursor-pointer p-3 rounded-xl transition flex items-center justify-between border ${
                      selectedSearchItem === tmpl.id
                        ? "bg-purple-600/15 border-purple-400/40 text-white"
                        : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium flex items-center space-x-2">
                          <span>{tmpl.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {tmpl.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {tmpl.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        selectedSearchItem === tmpl.id
                          ? "text-purple-400 translate-x-1"
                          : "text-slate-600 opacity-0"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Interactive Selected Preview Inspector */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0e0f17]/80 border border-white/[0.08] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 mb-4 border-b border-white/[0.06]">
              <span className="flex items-center space-x-1.5 text-cyan-400">
                <Eye className="w-3.5 h-3.5" />
                <span>Instant Peek</span>
              </span>
              <span className="text-slate-500">Live Context Buffer</span>
            </div>

            {selectedSearchItem.startsWith("chat") ? (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Chat Session
                </span>
                <h4 className="text-lg font-semibold text-white mt-2 mb-3">
                  {recentChats.find((c) => c.id === selectedSearchItem)?.title}
                </h4>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-sans text-slate-300 leading-relaxed mb-4">
                  {recentChats.find((c) => c.id === selectedSearchItem)?.preview}
                </div>
                <button
                  onClick={() =>
                    onSelectPrompt(
                      recentChats.find((c) => c.id === selectedSearchItem)?.title || ""
                    )
                  }
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center space-x-2"
                >
                  <span>Resume this thread</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Template Spec
                </span>
                <h4 className="text-lg font-semibold text-white mt-2 mb-3">
                  {libraryTemplates.find((t) => t.id === selectedSearchItem)?.title}
                </h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {libraryTemplates.find((t) => t.id === selectedSearchItem)?.description}
                </p>
                <button
                  onClick={() =>
                    onSelectPrompt(
                      `Execute template: ${libraryTemplates.find((t) => t.id === selectedSearchItem)?.title}`
                    )
                  }
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center space-x-2"
                >
                  <span>Apply template to canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION [01] MEMORY */}
      {/* ======================================================== */}
      <section id="memory" className="relative pt-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 font-semibold uppercase">
              [01] MEMORY
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight font-sans">
            It remembers <span className="font-semibold text-white">what you tell it.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-sans max-w-xl">
            Depth connects past answers, style constraints, and repository decisions into a permanent encrypted memory matrix. Continuous context without prompt fatigue.
          </p>
        </div>

        {/* Memory Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memories.map((mem) => {
            const isSelected = activeMemoryId === mem.id;
            return (
              <div
                key={mem.id}
                onClick={() => setActiveMemoryId(mem.id)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 backdrop-blur-xl border ${
                  isSelected
                    ? "bg-[#11131c]/95 border-emerald-400/50 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-400/20"
                    : "bg-[#0d0e14]/60 border-white/[0.07] hover:border-white/[0.18] hover:bg-[#11131c]/70"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono text-emerald-300 uppercase tracking-wide">
                      {mem.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{mem.confidence} Match</span>
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                  {mem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {mem.content}
                </p>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400">{mem.lastRecalled}</span>
                  <span className="hover:text-white transition flex items-center space-x-1">
                    <span>Inspect Node</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continuous Context Guarantee Banner */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-cyan-950/30 border border-white/[0.08] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Client-Side Encrypted Vector Vault
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Memories are isolated per user, salted with AES-256-GCM, and never used to train public models.
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectPrompt("Show me everything stored in my Depth memory graph")}
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-mono text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition"
          >
            Review Memory Graph →
          </button>
        </div>
      </section>
    </div>
  );
};
