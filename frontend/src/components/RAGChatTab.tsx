import React, { useState, useEffect } from "react";
import { GroundedAnswer } from "../types";
import {
  Sparkles,
  Send,
  FileCode,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Terminal,
  Bot,
  User,
  AlertTriangle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio
} from "lucide-react";
import { api } from "../services/api";
import { voiceAssistant, VoiceState } from "../services/voiceAssistant";

interface Message {
  role: "user" | "assistant";
  content: string;
  groundedAnswer?: GroundedAnswer;
  timestamp: string;
}

interface RAGChatTabProps {
  repositoryId: string;
  onSelectFile: (filePath: string) => void;
  presetQuestion?: string;
}

export const RAGChatTab: React.FC<RAGChatTabProps> = ({
  repositoryId,
  onSelectFile,
  presetQuestion
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am RepoRAG, your repository intelligence copilot. Ask me anything about project architecture, authentication, database flow, security, or implementation details. Every answer is strictly grounded in indexed code evidence.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState(presetQuestion || "");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAssistant.getState());

  useEffect(() => {
    const unsub = voiceAssistant.onStateChange((state) => {
      setVoiceState(state);
      if (state === "idle") {
        setSpeakingText(null);
        setIsListening(false);
      } else if (state === "listening") {
        setIsListening(true);
      } else {
        setIsListening(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (presetQuestion && presetQuestion.trim().length > 0) {
      setInput(presetQuestion);
      handleSend(presetQuestion);
    }
  }, [presetQuestion]);

  const handleToggleSpeak = (text: string) => {
    if (speakingText === text && voiceState === "speaking") {
      voiceAssistant.stop();
      setSpeakingText(null);
    } else {
      setSpeakingText(text);
      voiceAssistant.speak(text, {
        onEnd: () => setSpeakingText(null)
      });
    }
  };

  const handleStartListening = () => {
    if (isListening) {
      voiceAssistant.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    voiceAssistant.listen(
      (transcript) => {
        setIsListening(false);
        setInput(transcript);
        handleSend(transcript);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleSend = async (q?: string) => {
    const query = q || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.askChat(repositoryId, query);
      const assistantMsg: Message = {
        role: "assistant",
        content: res.answer,
        groundedAnswer: res,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-speak response if enabled
      if (autoSpeak) {
        setSpeakingText(res.answer);
        voiceAssistant.speak(res.answer, {
          onEnd: () => setSpeakingText(null)
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Encountered an issue communicating with the RepoRAG intelligence backend.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Where is authentication implemented?",
    "Explain the architecture like I'm a beginner.",
    "How does data flow from the frontend to the database?",
    "Which files should I modify to add a new endpoint?",
    "Find potential security or maintenance risks.",
  ];

  return (
    <div className="flex flex-col h-[700px] rounded-2xl bg-card border border-cardBorder overflow-hidden animate-in fade-in duration-200">
      {/* Header bar with Voice Auto-Speak Toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cardBorder bg-[#0c0e17]/90 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-accent-cyan" />
          <span className="text-white font-bold">RepoRAG AI Grounded Copilot</span>
          {voiceState === "speaking" && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-pulse font-medium">
              <Radio className="w-3 h-3 text-emerald-400" /> Real Voice Narrating
            </span>
          )}
          {isListening && (
            <span className="flex items-center gap-1.5 text-[10px] text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 animate-pulse font-bold">
              <Mic className="w-3 h-3" /> Listening...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition text-[11px] ${
              autoSpeak
                ? "bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan font-semibold"
                : "bg-background border-cardBorder text-slate-400 hover:text-white"
            }`}
            title="Automatically read AI answers aloud"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>Auto-Voice: {autoSpeak ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl space-y-3 ${msg.role === "user" ? "text-right" : ""}`}>
              <div className="relative group">
                <div
                  className={`inline-block p-4 rounded-2xl text-xs md:text-sm font-sans leading-relaxed whitespace-pre-line text-left ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-[#0c0e17] border border-cardBorder text-slate-200 rounded-tl-none shadow-md pr-10"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Speak button on assistant messages */}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleToggleSpeak(msg.content)}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg border transition ${
                      speakingText === msg.content && voiceState === "speaking"
                        ? "bg-accent-cyan text-black border-accent-cyan shadow-md shadow-accent-cyan/20 animate-pulse"
                        : "bg-background/80 hover:bg-cardBorder border-cardBorder text-slate-400 hover:text-white opacity-70 group-hover:opacity-100"
                    }`}
                    title={speakingText === msg.content && voiceState === "speaking" ? "Stop speaking" : "Listen to answer"}
                  >
                    {speakingText === msg.content && voiceState === "speaking" ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Grounded Evidence Box */}
              {msg.groundedAnswer && msg.groundedAnswer.evidence.length > 0 && (
                <div className="p-3.5 rounded-xl bg-background/90 border border-cardBorder text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-cardBorder">
                    <span className="flex items-center gap-1.5 text-accent-cyan font-bold">
                      <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                      Grounded Code Evidence ({Math.round(msg.groundedAnswer.confidence * 100)}% Confidence)
                    </span>
                    <span className="text-slate-500 text-[11px]">{msg.groundedAnswer.model_used}</span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.groundedAnswer.evidence.map((ev, eIdx) => (
                      <div
                        key={eIdx}
                        onClick={() => onSelectFile(ev.file_path)}
                        className="p-2 rounded-lg bg-card/60 hover:bg-cardBorder border border-cardBorder/60 cursor-pointer transition text-xs font-mono group"
                      >
                        <div className="flex items-center justify-between text-slate-300 group-hover:text-accent-cyan mb-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-slate-500" />
                            {ev.file_path}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Lines {ev.start_line} - {ev.end_line}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono bg-background p-1.5 rounded truncate">
                          {ev.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-xs font-mono text-accent-cyan animate-pulse">
            <Bot className="w-5 h-5" />
            <span>RepoRAG is retrieving code chunks & synthesizing grounded response...</span>
          </div>
        )}
      </div>

      {/* Suggested Inquiries */}
      <div className="px-4 py-2 bg-background/50 border-t border-cardBorder flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-slate-500 shrink-0 text-[11px]">Inquire:</span>
        {sampleQuestions.map((sq) => (
          <button
            key={sq}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 rounded bg-card hover:bg-cardBorder border border-cardBorder text-slate-300 hover:text-white shrink-0 transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-background border-t border-cardBorder">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          {/* Speech-to-Text Microphone Button */}
          <button
            type="button"
            onClick={handleStartListening}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
              isListening
                ? "bg-rose-500 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/30"
                : "bg-card hover:bg-cardBorder border-cardBorder text-accent-cyan hover:text-white"
            }`}
            title={isListening ? "Listening... click to stop" : "Speak question using microphone"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening for your voice question..." : "Ask anything about this repository (or use mic to speak)..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-cardBorder text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan/50 font-mono transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-accent-cyan hover:bg-cyan-400 text-black font-bold transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
