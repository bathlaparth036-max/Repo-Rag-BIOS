import React, { useState, useEffect } from "react";
import { RepositoryIntelligence } from "../types";
import {
  voiceAssistant,
  VoiceState,
  VoiceEngineMode,
  REAL_PERSON_VOICE_MODELS,
  RealVoiceProfile,
} from "../services/voiceAssistant";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Sparkles,
  Radio,
  Sliders,
  ChevronDown,
  X,
  MessageSquare,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface VoiceAssistantHUDProps {
  repo: RepositoryIntelligence;
  onAskVoiceQuestion?: (question: string) => void;
  autoStartNarrative?: boolean;
}

export const VoiceAssistantHUD: React.FC<VoiceAssistantHUDProps> = ({
  repo,
  onAskVoiceQuestion,
  autoStartNarrative = false,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAssistant.getState());
  const [currentScriptType, setCurrentScriptType] = useState<"quick" | "deep" | "custom">("quick");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(voiceAssistant.getRate());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [voiceEngineMode, setVoiceEngineMode] = useState<VoiceEngineMode>(voiceAssistant.getMode());
  const [selectedRealVoiceId, setSelectedRealVoiceId] = useState<string>(voiceAssistant.getRealVoice());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [transcriptPreview, setTranscriptPreview] = useState<string>("");
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");

  // Get active real voice profile
  const activeRealVoice =
    REAL_PERSON_VOICE_MODELS.find((v) => v.id === selectedRealVoiceId) || REAL_PERSON_VOICE_MODELS[0];

  // Generate scripts for the repository
  const generateNarrativeScript = (type: "quick" | "deep"): string => {
    const topLangs = Object.keys(repo.languages || {}).slice(0, 3).join(", ") || "various languages";
    const entry =
      (repo.architecture.entry_points && repo.architecture.entry_points[0]) ||
      repo.architecture.frontend_entry ||
      repo.architecture.backend_entry ||
      "the primary source files";
    const impFiles =
      (repo.important_files || []).slice(0, 3).map((f) => f.name || f.path).join(", ") ||
      "core project files";
    const databases = (repo.architecture.databases || []).join(", ") || "standard data storage";
    const aiFootprint = repo.ai_usage
      ? ` The AI detection meter estimates generative code assistance at ${repo.ai_usage.overall_percentage} percent, classified as ${repo.ai_usage.classification}.`
      : "";

    if (type === "quick") {
      return `Welcome to the RepoRAG voice briefing for ${repo.repository_name}. This project is structured as a ${repo.architecture.style}, written primarily in ${topLangs}. The codebase contains ${repo.file_count} indexed files.${aiFootprint} The key entry point starts at ${entry}. Overall repository health is rated at ${repo.health.overall} out of 100. Feel free to speak or ask any technical question to explore deeper.`;
    } else {
      return `Here is your architectural deep dive for ${repo.repository_name}. The project adopts a ${repo.architecture.style}.${aiFootprint} Client interaction and incoming requests start at ${entry}. Logic flows across the modules and persists records into ${databases}. The top recommended files to inspect first are ${impFiles}. Codebase health is evaluated at ${repo.health.overall} percent with strong modular separation. You can ask me questions about authentication, data flow, or specific functions at any time.`;
    }
  };

  useEffect(() => {
    const unsubscribeState = voiceAssistant.onStateChange((state) => {
      setVoiceState(state);
    });

    const unsubscribeVoices = voiceAssistant.onVoicesChanged((voices) => {
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(voices[0].name);
      }
    });

    // Auto-narrate on load if requested
    if (autoStartNarrative) {
      const script = generateNarrativeScript("quick");
      setTranscriptPreview(script);
      voiceAssistant.speak(script);
    }

    return () => {
      unsubscribeState();
      unsubscribeVoices();
      voiceAssistant.stop();
    };
  }, [repo.id]);

  const handlePlayScript = (type: "quick" | "deep") => {
    setCurrentScriptType(type);
    const script = generateNarrativeScript(type);
    setTranscriptPreview(script);
    voiceAssistant.speak(script);
  };

  const handleTogglePlay = () => {
    if (voiceState === "speaking") {
      voiceAssistant.pause();
    } else if (voiceState === "paused") {
      voiceAssistant.resume();
    } else {
      const script = generateNarrativeScript(currentScriptType === "deep" ? "deep" : "quick");
      setTranscriptPreview(script);
      voiceAssistant.speak(script);
    }
  };

  const handleStop = () => {
    voiceAssistant.stop();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    voiceAssistant.setRate(speed);
  };

  const handleModeChange = (mode: VoiceEngineMode) => {
    setVoiceEngineMode(mode);
    voiceAssistant.setMode(mode);
  };

  const handleRealVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedRealVoiceId(id);
    voiceAssistant.setRealVoice(id);
  };

  const handleBrowserVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedVoiceName(name);
    voiceAssistant.setVoice(name);
  };

  const handleStartVoiceInquiry = () => {
    voiceAssistant.listen(
      (transcript) => {
        setSpokenTranscript(transcript);
        if (onAskVoiceQuestion) {
          onAskVoiceQuestion(transcript);
        }
      },
      (err) => {
        console.warn("Voice input error:", err);
      }
    );
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#0B0D11] border border-indigo-400/30 text-indigo-300 shadow-2xl backdrop-blur-xl hover:border-indigo-400 hover:text-white transition font-mono text-xs font-semibold"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          <span>Real Person Narrator ({activeRealVoice.name})</span>
          {voiceState === "speaking" && (
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-[#0B0D11] border border-white/[0.08] p-4 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold font-mono text-white tracking-wide">
                RepoRAG Real Person Narrator
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{voiceEngineMode === "real_person" ? activeRealVoice.name : "Browser"}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A1A1AA] border border-white/[0.08] uppercase font-medium">
                {voiceState === "speaking"
                  ? "Speaking"
                  : voiceState === "paused"
                  ? "Paused"
                  : voiceState === "listening"
                  ? "Listening..."
                  : "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition ${
              showSettings
                ? "bg-indigo-950/40 border-indigo-400/50 text-indigo-300"
                : "bg-[#101217] hover:bg-[#14171D] border-white/[0.08] text-[#A1A1AA] hover:text-white"
            }`}
            title="Narrator Voice Selection & Audio Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Voice Settings</span>
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg bg-[#101217] hover:bg-[#14171D] border border-white/[0.08] text-[#A1A1AA] hover:text-white transition"
            title="Minimize Assistant"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main HUD Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Quick Briefing Buttons */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePlayScript("quick")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-1.5 border ${
              voiceState === "speaking" && currentScriptType === "quick"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30"
                : "bg-[#101217] hover:bg-[#14171D] border-white/[0.08] text-[#A1A1AA] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>45s Briefing</span>
          </button>

          <button
            onClick={() => handlePlayScript("deep")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-1.5 border ${
              voiceState === "speaking" && currentScriptType === "deep"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30"
                : "bg-[#101217] hover:bg-[#14171D] border-white/[0.08] text-[#A1A1AA] hover:text-white"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>2-Min Deep Walkthrough</span>
          </button>

          <button
            onClick={handleStartVoiceInquiry}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-1.5 border ${
              voiceState === "listening"
                ? "bg-rose-500 text-white font-bold animate-pulse shadow-sm shadow-rose-500/30"
                : "bg-[#101217] hover:bg-[#14171D] border-white/[0.08] text-indigo-300"
            }`}
            title="Speak a question to the assistant"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{voiceState === "listening" ? "Listening..." : "Speak Question"}</span>
          </button>
        </div>

        {/* Center: Technical Equalizer Waveform */}
        <div className="md:col-span-4 flex items-center justify-center space-x-1 py-1">
          {[18, 28, 42, 22, 50, 36, 16, 44, 30, 24, 48, 20].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                voiceState === "speaking"
                  ? "bg-indigo-400"
                  : voiceState === "listening"
                  ? "bg-rose-400"
                  : "bg-white/[0.08]"
              }`}
              style={{
                height:
                  voiceState === "speaking" || voiceState === "listening"
                    ? `${Math.max(6, Math.sin(Date.now() / 200 + i) * h + 15)}px`
                    : "6px",
              }}
            />
          ))}
        </div>

        {/* Right: Audio Player Controls */}
        <div className="md:col-span-3 flex items-center justify-end space-x-2">
          {/* Play/Pause */}
          <button
            onClick={handleTogglePlay}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold transition"
            title={voiceState === "speaking" ? "Pause" : "Play"}
          >
            {voiceState === "speaking" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            disabled={voiceState === "idle"}
            className="p-2.5 rounded-xl bg-[#101217] hover:bg-[#14171D] border border-white/[0.08] text-[#A1A1AA] hover:text-white transition disabled:opacity-40"
            title="Stop Speech"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#101217] border border-white/[0.08] text-xs font-mono">
            {[1.0, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  playbackSpeed === spd
                    ? "bg-white/[0.1] text-white font-semibold"
                    : "text-[#686B73] hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript ticker when speaking */}
      {transcriptPreview && (voiceState === "speaking" || voiceState === "paused") && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-start gap-2 text-xs font-sans text-[#A1A1AA] animate-in fade-in">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2 italic leading-relaxed text-[#A1A1AA]">
            "{transcriptPreview}"
          </p>
        </div>
      )}

      {/* Spoken voice question feedback */}
      {spokenTranscript && (
        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-indigo-300">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Voice Prompt: "{spokenTranscript}"</span>
          </div>
        </div>
      )}

      {/* Real Person Voice Settings Panel */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono animate-in fade-in bg-[#101217] p-3 rounded-xl border border-white/[0.08]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-white font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voice Engine Mode</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleModeChange("real_person")}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    voiceEngineMode === "real_person"
                      ? "bg-emerald-500 text-black font-bold"
                      : "bg-[#070709] text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  Real Person (AI)
                </button>
                <button
                  onClick={() => handleModeChange("browser")}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    voiceEngineMode === "browser"
                      ? "bg-white text-black font-bold"
                      : "bg-[#070709] text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  Browser Synth
                </button>
              </div>
            </div>

            {voiceEngineMode === "real_person" ? (
              <div>
                <label className="text-[#A1A1AA] block mb-1 text-[11px]">Select Real Person Voice:</label>
                <select
                  value={selectedRealVoiceId}
                  onChange={handleRealVoiceChange}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070709] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-400 text-xs font-sans"
                >
                  {REAL_PERSON_VOICE_MODELS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.gender === "Female" ? "👩" : "👨"} {v.name} — {v.description} ({v.locale})
                      {v.recommended ? " ★ Recommended" : ""}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-emerald-400/90 block mt-1">
                  ✓ High-fidelity studio voice generated via Edge Neural Speech
                </span>
              </div>
            ) : (
              <div>
                <label className="text-[#A1A1AA] block mb-1 text-[11px]">Local Browser Voice:</label>
                <select
                  value={selectedVoiceName}
                  onChange={handleBrowserVoiceChange}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#070709] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-400 text-xs font-sans"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between text-[#A1A1AA] text-[11px] leading-relaxed border-l border-white/[0.08] pl-3">
            <div>
              <p className="text-white font-medium mb-1">
                Active: <span className="text-emerald-400">{activeRealVoice.name} ({activeRealVoice.gender}, {activeRealVoice.locale})</span>
              </p>
              <p className="text-[#A1A1AA] text-[11px]">
                {activeRealVoice.description}
              </p>
            </div>
            <div className="pt-2 border-t border-white/[0.08] text-[#686B73] text-[10px] flex items-center justify-between">
              <span>Latency: ~300ms stream</span>
              <span className="text-emerald-400 font-medium">100% Realistic Human Speech</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
