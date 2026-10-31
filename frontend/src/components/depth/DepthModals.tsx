import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Command,
  FileText,
  Bookmark,
  Check,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Tag,
  Send,
  Mail,
  ExternalLink,
  Code2
} from "lucide-react";

interface DepthModalsProps {
  isCommandPaletteOpen: boolean;
  onCloseCommandPalette: () => void;
  isPricingOpen: boolean;
  onClosePricing: () => void;
  isChangelogOpen: boolean;
  onCloseChangelog: () => void;
  isAboutOpen: boolean;
  onCloseAbout: () => void;
  isContactOpen: boolean;
  onCloseContact: () => void;
  isAppPlaygroundOpen: boolean;
  onCloseAppPlayground: () => void;
  initialPrompt?: string;
  onSelectPrompt: (p: string) => void;
  onLaunchRepoIntelligence: () => void;
}

export const DepthModals: React.FC<DepthModalsProps> = ({
  isCommandPaletteOpen,
  onCloseCommandPalette,
  isPricingOpen,
  onClosePricing,
  isChangelogOpen,
  onCloseChangelog,
  isAboutOpen,
  onCloseAbout,
  isContactOpen,
  onCloseContact,
  isAppPlaygroundOpen,
  onCloseAppPlayground,
  initialPrompt = "",
  onSelectPrompt,
  onLaunchRepoIntelligence,
}) => {
  // Global ⌘K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isCommandPaletteOpen) {
          onCloseCommandPalette();
        } else {
          // Open
          const evt = new CustomEvent("open-depth-command-palette");
          window.dispatchEvent(evt);
        }
      }
      if (e.key === "Escape") {
        onCloseCommandPalette();
        onClosePricing();
        onCloseChangelog();
        onCloseAbout();
        onCloseContact();
        onCloseAppPlayground();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Command palette search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const searchableItems = [
    { type: "chat", title: "Plan next week around the product launch", time: "2 hours ago" },
    { type: "chat", title: "Summarise the notes from Monday's call", time: "Yesterday" },
    { type: "chat", title: "Architecture review for real-time sync engine", time: "3 days ago" },
    { type: "template", title: "Weekly report", detail: "Leadership summary with metrics" },
    { type: "template", title: "Inbox triage", detail: "Prioritize incoming tasks" },
    { type: "template", title: "Executive brief", detail: "3-bullet decision matrix" },
    { type: "action", title: "/explore ideas", detail: "Generate novel technical concepts" },
    { type: "action", title: "/refire my writing", detail: "Polish syntax and remove filler" },
    { type: "action", title: "/plan a project", detail: "Deconstruct milestones and dependencies" },
    { type: "action", title: "/research a topic", detail: "Deep synthesis of academic/tech papers" },
  ];

  const filteredItems = searchableItems.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Playground conversation state
  const [playgroundInput, setPlaygroundInput] = useState(initialPrompt);
  const [playgroundMode, setPlaygroundMode] = useState<"auto" | "fast" | "think">("auto");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "depth"; text: string; mode?: string }>
  >([
    {
      role: "depth",
      text: "Depth is ready. How can I accelerate your thinking today?",
      mode: "auto",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setPlaygroundInput(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendPlayground = () => {
    if (!playgroundInput.trim()) return;
    const userMsg = playgroundInput.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setPlaygroundInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      if (playgroundMode === "fast") {
        reply = `[FAST STREAM - 38ms]\nResolved: "${userMsg}". Here is your immediate synthesized directive:\n• Core action identified\n• Redundant steps pruned\n• Ready for downstream execution.`;
      } else if (playgroundMode === "think") {
        reply = `[THINK MODE - 14k tokens reasoning trace]\nDeconstructing "${userMsg}":\n1. Premise evaluation: Validated domain bounds.\n2. Invariant checking: Assured contextual consistency with past memories.\n3. Synthesis: Generated optimized, verified architectural solution.`;
      } else {
        reply = `[AUTO ADAPTIVE]\nProcessed: "${userMsg}". Analyzed against your continuous memory matrix. Everything is indexed and linked to your project workspace.`;
      }
      setMessages((prev) => [...prev, { role: "depth", text: reply, mode: playgroundMode }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. COMMAND PALETTE MODAL (⌘K) */}
      {/* ======================================================== */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#0f1018] border border-white/[0.14] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Input bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#141520]">
              <Search className="w-4 h-4 text-cyan-400 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIdx(0);
                }}
                placeholder="Search chats, templates, or run /commands..."
                autoFocus
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 font-sans outline-none"
              />
              <button
                onClick={onCloseCommandPalette}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results list */}
            <div className="p-2 overflow-y-auto space-y-1">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No matching items found.
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectPrompt(item.title);
                      onCloseCommandPalette();
                    }}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`cursor-pointer px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition ${
                      selectedIdx === idx
                        ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                        : "text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.type === "chat" ? (
                        <FileText className="w-4 h-4 text-cyan-400" />
                      ) : item.type === "template" ? (
                        <Bookmark className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <div className="font-medium text-slate-200">{item.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {"time" in item ? item.time : item.detail}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {item.type}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#0b0b0e] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center space-x-3">
                <span>Navigate: ↑↓</span>
                <span>Select: ⏎</span>
                <span>Close: ESC</span>
              </div>
              <span className="text-cyan-400">Depth Fast Search</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PRICING MODAL */}
      {/* ======================================================== */}
      {isPricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0f1018] border border-white/[0.14] shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClosePricing}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
                <Tag className="w-3 h-3 mr-1" />
                FOUNDING MEMBER PROMOTION
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Lifetime All-Access Pass
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                One-time payment. Never pay monthly subscriptions again.
              </p>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-black/60 to-cyan-950/40 border border-indigo-500/30 p-6 mb-8 text-center relative overflow-hidden">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <span className="text-xl line-through text-slate-500">$999</span>
                <span className="text-5xl font-black text-white font-mono">$49</span>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  / lifetime
                </span>
              </div>
              <div className="text-xs text-cyan-300 font-mono">
                Over 200+ Production Templates • Unlimited Memory Vector Vault
              </div>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs text-slate-300 font-sans">
              {[
                "Unlimited Auto, Fast & Think reasoning cycles",
                "200+ Curated Executive & Engineering Templates",
                "Permanent Encrypted Memory Matrix (AES-256)",
                "Full Repository Intelligence & RAG Exploration",
                "Global ⌘K unified workspace search",
                "Zero telemetry, private offline-first sync",
                "Lifetime free updates to v3.0+",
                "Direct Slack/Discord access to core engineers",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                alert("Thank you for your interest! The All-Access $49 license has been activated for this browser session.");
                onClosePricing();
              }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white transition shadow-lg shadow-indigo-600/40 flex items-center justify-center space-x-2"
            >
              <span>Claim Lifetime All-Access for $49</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CHANGELOG MODAL */}
      {/* ======================================================== */}
      {isChangelogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#0f1018] border border-white/[0.14] shadow-2xl p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={onCloseChangelog}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Releases & Updates
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-1">Changelog</h3>
            </div>

            <div className="space-y-6 text-xs text-slate-300 font-sans">
              <div className="border-l-2 border-cyan-400 pl-4 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">v2.4 "Abyssal Engine"</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300">
                    Latest
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Introduced antigravity ASCII marine life background canvas with interactive flocking algorithms, sub-50ms Fast answering mode, and persistent memory vault.
                </p>
              </div>

              <div className="border-l-2 border-indigo-400 pl-4 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">v2.3 "Neural Current"</span>
                  <span className="text-[10px] font-mono text-slate-500">October 2026</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Global ⌘K command palette integration with recent chat persistence and 200+ executive templates.
                </p>
              </div>

              <div className="border-l-2 border-purple-400 pl-4 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">v2.2 "Weightless Mind"</span>
                  <span className="text-[10px] font-mono text-slate-500">September 2026</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Initial dark mode release with deep charcoal `#0b0b0e` aesthetic and client-side cryptographic storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ABOUT MODAL */}
      {/* ======================================================== */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1018] border border-white/[0.14] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={onCloseAbout}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-mono font-bold text-lg mb-4 shadow-lg shadow-indigo-500/30">
              d
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight mb-3">About Depth</h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              <p>
                Depth was built on a single conviction: modern software interfaces are too noisy, too fragmented, and demand too much repetition.
              </p>
              <p>
                Inspired by deep-sea ecosystems and the concept of weightlessness ("antigravity"), Depth operates as an ambient cognitive layer. It observes your work quietly, holds memory perpetually, and answers with mathematical precision at whatever speed you require.
              </p>
              <p className="text-slate-400 font-mono text-xs pt-2">
                Engineered with zero third-party tracking, 100% private memory partitions, and native WebAssembly acceleration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. CONTACT MODAL */}
      {/* ======================================================== */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1018] border border-white/[0.14] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={onCloseContact}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Contact Depth</h3>
            <p className="text-xs text-slate-400 mb-6">
              Have questions, feedback, or need enterprise self-hosting support?
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message received! The Depth core team will respond within 24 hours.");
                onCloseContact();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="How can we help your team?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center space-x-2"
              >
                <span>Send Dispatch</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FULL "OPEN DEPTH" INTERACTIVE APP PLAYGROUND / WORKSPACE */}
      {/* ======================================================== */}
      {isAppPlaygroundOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[88vh] rounded-2xl bg-[#0c0d14] border border-white/[0.15] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#10111a] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-mono font-bold text-white">
                  d
                </div>
                <span className="font-semibold text-sm text-white font-sans">
                  depth interactive studio
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                  v2.4 Live
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Switch to Repository Intelligence */}
                <button
                  onClick={() => {
                    onCloseAppPlayground();
                    onLaunchRepoIntelligence();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/50 transition"
                  title="Switch to GitHub Repository Intelligence"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Analyze GitHub Repo</span>
                </button>

                <button
                  onClick={onCloseAppPlayground}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/[0.05]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Bar */}
            <div className="px-5 py-2.5 bg-[#0e0f17] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">Active Engine:</span>
                {(["auto", "fast", "think"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPlaygroundMode(m)}
                    className={`px-2.5 py-1 rounded-md capitalize transition ${
                      playgroundMode === m
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-400 hover:bg-white/[0.05]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Context Synchronized</span>
              </span>
            </div>

            {/* Messages Chat Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm font-sans leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-[#141520] border border-white/[0.08] text-slate-200"
                    }`}
                  >
                    {msg.role === "depth" && (
                      <div className="text-[10px] font-mono text-cyan-400 uppercase mb-1">
                        depth • {msg.mode} mode
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl bg-[#141520] border border-white/[0.08] text-xs font-mono text-cyan-400 animate-pulse">
                    Synthesizing response...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#10111a] border-t border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={playgroundInput}
                  onChange={(e) => setPlaygroundInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendPlayground()}
                  placeholder="Type a message or press Enter..."
                  className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/[0.1] text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendPlayground}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs font-semibold flex items-center space-x-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
