import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  Compass,
  PenTool,
  Calendar,
  Search,
  CheckCircle2,
  Copy,
  Zap,
  Bot,
  CornerDownLeft,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface DepthHeroProps {
  activeMode: "auto" | "fast" | "think";
  onSelectMode: (mode: "auto" | "fast" | "think") => void;
  onOpenAppWithPrompt: (prompt: string) => void;
}

export const DepthHero: React.FC<DepthHeroProps> = ({
  activeMode,
  onSelectMode,
  onOpenAppWithPrompt,
}) => {
  // Personalized Greeting
  const [userName, setUserName] = useState("Maya");
  const [isEditingName, setIsEditingName] = useState(false);
  const [greetingTime, setGreetingTime] = useState("Good evening");

  // Dynamic Typewriter Headline
  const headlines = [
    "write this week's update",
    "what's on your mind",
    "clear your inbox",
    "plan a project roadmap",
    "synthesize team research",
  ];
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Command bar input & interactive response
  const [inputVal, setInputVal] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewResponse, setPreviewResponse] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Greeting based on real local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime("Good morning");
    else if (hour < 18) setGreetingTime("Good afternoon");
    else setGreetingTime("Good evening");
  }, []);

  // Typewriter effect loop
  useEffect(() => {
    const currentFullText = headlines[headlineIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (displayedText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 65);
      } else {
        // Pause at end of sentence
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setHeadlineIndex((prev) => (prev + 1) % headlines.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, headlineIndex]);

  // Command Pills
  const commandPills = [
    {
      id: "explore",
      label: "/explore ideas",
      icon: Compass,
      query: "Brainstorm 3 high-impact feature specs for an antigravity collaborative workspace",
      response:
        "Here are 3 high-impact feature specs tailored for depth:\n\n1. Floating Thought Threads: Ephemeral branch points that let team members brainstorm asynchronously without cluttering main specs.\n2. Ambient Memory Pulse: Passive retrieval that surfaces relevant decisions made in previous sprint reviews as you type.\n3. Antigravity Canvas: Infinite spatial board with real-time physics-based grouping for complex architectural nodes.",
    },
    {
      id: "refire",
      label: "/refire my writing",
      icon: PenTool,
      query: "Refire this announcement into an executive-ready product release dispatch",
      response:
        "Refired Output (Executive Dispatch):\n\n\"We are announcing Depth v2.4—an ambient intelligence workspace engineered for frictionless deep work. By pairing sub-50ms deterministic routing with persistent associative memory, teams reclaim up to 14 hours each week previously lost to contextual friction.\"",
    },
    {
      id: "plan",
      label: "/plan a project",
      icon: Calendar,
      query: "Break down a 4-week zero-latency sync engine rollout into phased milestones",
      response:
        "4-Week Zero-Latency Rollout Plan:\n\n• Phase 1 (Week 1): CRDT synchronization primitives & WebSocket heartbeat fabric.\n• Phase 2 (Week 2): Multi-region edge caching with local SQLite persistence.\n• Phase 3 (Week 3): Stress test 50k concurrent peer connections under simulated network jitter.\n• Phase 4 (Week 4): Staged canary release & telemetry verification.",
    },
    {
      id: "research",
      label: "/research a topic",
      icon: Search,
      query: "Synthesize the state of local-first LLM memory compaction algorithms",
      response:
        "State of Local-First Memory Compaction (2026):\n\nKey advancements center on Hierarchical Episodic Embeddings paired with vector quantization. Rather than storing raw token windows, depth compresses contextual clusters into dense knowledge centroids, delivering 94% recall at 1/12th the compute overhead.",
    },
  ];

  const handlePillClick = (pill: (typeof commandPills)[0]) => {
    setActivePreset(pill.id);
    setInputVal(pill.query);
    triggerLiveAnswer(pill.query, pill.response);
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    // Check if matched known pill or generate custom response
    const matched = commandPills.find(
      (p) => p.query.toLowerCase() === inputVal.trim().toLowerCase()
    );
    const mockResponse =
      matched?.response ||
      `Analysis for: "${inputVal}"\n\nMode: [${activeMode.toUpperCase()}]\nSynthesized response: Depth has processed your request against active context. Key insights:\n• Objective confirmed and indexed into session memory.\n• Next deterministic step: Decompose dependencies and generate verifiable output.\n• Status: Ready to execute or export to repository workspace.`;

    triggerLiveAnswer(inputVal, mockResponse);
  };

  const triggerLiveAnswer = (prompt: string, fullResponse: string) => {
    setIsStreaming(true);
    setPreviewResponse("");
    let charIdx = 0;

    const interval = setInterval(() => {
      charIdx += 4;
      if (charIdx >= fullResponse.length) {
        setPreviewResponse(fullResponse);
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setPreviewResponse(fullResponse.slice(0, charIdx));
      }
    }, 18);
  };

  const copyToClipboard = () => {
    if (previewResponse) {
      navigator.clipboard.writeText(previewResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="hero" className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center z-10">
      {/* Floating Personalized Greeting */}
      <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md mb-8 transition-all hover:border-cyan-400/30 hover:bg-white/[0.06] group shadow-inner shadow-white/[0.05]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-xs font-mono text-slate-300">
          {greetingTime},{" "}
          {isEditingName ? (
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
              autoFocus
              className="bg-transparent border-b border-cyan-400 text-white font-semibold outline-none w-16 px-0 text-xs"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-white font-semibold hover:text-cyan-300 underline decoration-dotted underline-offset-2 transition"
              title="Click to personalize name"
            >
              {userName}
            </button>
          )}
        </span>
        <span className="text-slate-500 font-mono text-[10px] hidden sm:inline-block">
          • antigravity active
        </span>
      </div>

      {/* Prominent Cycling Typewriter Headline */}
      <div className="min-h-[110px] sm:min-h-[140px] flex items-center justify-center mb-6">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white font-sans max-w-4xl leading-[1.15]">
          <span className="text-slate-400 font-normal">“</span>
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            {displayedText}
          </span>
          <span className="text-slate-400 font-normal">”</span>
          <span className="inline-block w-[3px] h-9 sm:h-12 bg-cyan-400 ml-1.5 align-middle animate-blink shadow-sm shadow-cyan-400"></span>
        </h1>
      </div>

      {/* Hero Subtitle */}
      <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-10 font-sans leading-relaxed">
        The minimal intelligent canvas that remembers your work, shifts into high gear, and lets you think without friction.
      </p>

      {/* Command Bar / Sleek Frosted Glass Input Box */}
      <div className="w-full max-w-2xl relative mb-6">
        <form
          onSubmit={handleFormSubmit}
          className="relative rounded-2xl p-1 bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 transition-all focus-within:ring-2 focus-within:ring-indigo-500/40"
        >
          <div className="relative flex items-center bg-[#101117]/90 rounded-xl px-4 py-3.5 border border-white/[0.08]">
            <div className="mr-3 text-slate-400 flex items-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask depth anything..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 font-sans outline-none"
            />

            {/* Mode Tag in Command Bar */}
            <div className="hidden sm:flex items-center space-x-1.5 mr-3">
              <button
                type="button"
                onClick={() => {
                  const modes: ("auto" | "fast" | "think")[] = ["auto", "fast", "think"];
                  const next = modes[(modes.indexOf(activeMode) + 1) % modes.length];
                  onSelectMode(next);
                }}
                className="text-[11px] font-mono px-2 py-1 rounded bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border border-white/[0.08] flex items-center space-x-1 transition"
                title="Toggle reasoning mode"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="capitalize">{activeMode}</span>
              </button>
            </div>

            {/* Submit / Trigger button */}
            <button
              type="submit"
              disabled={isStreaming}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 shadow-md shadow-indigo-600/30"
              title="Execute command (Enter)"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Command Shortcut Pills Below Input */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-2">
          {commandPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected = activePreset === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => handlePillClick(pill)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-400 text-cyan-300 shadow-sm shadow-indigo-500/20"
                    : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400/80" />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Live Streaming Preview Card */}
      {previewResponse !== null && (
        <div className="w-full max-w-2xl mt-4 text-left animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-xl border border-indigo-500/30 bg-[#0e0f17]/90 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden">
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-white font-semibold">depth engine</span>
                <span className="text-slate-500">[{activeMode.toUpperCase()}]</span>
                {isStreaming && (
                  <span className="text-cyan-400 animate-pulse text-[11px]">
                    streaming tokens...
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.04] transition"
                  title="Copy synthesized response"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onOpenAppWithPrompt(inputVal)}
                  className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 transition"
                >
                  <span>Open in App</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Response content */}
            <pre className="text-slate-200 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed selection:bg-indigo-500 selection:text-white">
              {previewResponse}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle"></span>
              )}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};
