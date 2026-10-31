// Voice Assistant Service with Real Person AI Neural Voice & Web Speech fallback
import { API_BASE } from "./api";

export type VoiceState = "idle" | "speaking" | "paused" | "listening";
export type VoiceEngineMode = "real_person" | "browser";


export interface RealVoiceProfile {
  id: string;
  name: string;
  gender: "Female" | "Male";
  locale: string;
  description: string;
  recommended?: boolean;
}

export const REAL_PERSON_VOICE_MODELS: RealVoiceProfile[] = [
  {
    id: "en-US-JennyNeural",
    name: "Jenny",
    gender: "Female",
    locale: "en-US",
    description: "Real human conversational female (Warm & Expressive)",
    recommended: true,
  },
  {
    id: "en-US-GuyNeural",
    name: "Guy",
    gender: "Male",
    locale: "en-US",
    description: "Real human conversational male (Natural & Clear)",
    recommended: true,
  },
  {
    id: "en-US-AriaNeural",
    name: "Aria",
    gender: "Female",
    locale: "en-US",
    description: "Dynamic expressive female narrator",
    recommended: false,
  },
  {
    id: "en-US-ChristopherNeural",
    name: "Christopher",
    gender: "Male",
    locale: "en-US",
    description: "Authoritative natural male narrator (Tech & Briefing)",
    recommended: false,
  },
  {
    id: "en-GB-SoniaNeural",
    name: "Sonia (UK)",
    gender: "Female",
    locale: "en-GB",
    description: "Natural British real human female narrator",
    recommended: false,
  },
  {
    id: "en-GB-RyanNeural",
    name: "Ryan (UK)",
    gender: "Male",
    locale: "en-GB",
    description: "Natural British real human male narrator",
    recommended: false,
  },
  {
    id: "en-US-AvaNeural",
    name: "Ava",
    gender: "Female",
    locale: "en-US",
    description: "Modern casual real human female voice",
    recommended: false,
  },
  {
    id: "en-US-AndrewNeural",
    name: "Andrew",
    gender: "Male",
    locale: "en-US",
    description: "Warm conversational real human male",
    recommended: false,
  },
];

const ROBOTIC_VOICE_NAMES = [
  "alex", "albert", "bad news", "bahh", "bells", "boing", "bubbles",
  "cellos", "good news", "jester", "junior", "kathy", "organ",
  "superstar", "ralph", "trinoids", "whisper", "wobble", "zarvox", "fred"
];

class VoiceAssistantService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private state: VoiceState = "idle";
  private stateListeners: ((state: VoiceState) => void)[] = [];
  private voiceListeners: ((voices: SpeechSynthesisVoice[]) => void)[] = [];
  private voices: SpeechSynthesisVoice[] = [];
  private selectedBrowserVoice: SpeechSynthesisVoice | null = null;
  
  // Real Person Neural Voice State
  private engineMode: VoiceEngineMode = "real_person";
  private selectedRealVoiceId: string = "en-US-JennyNeural";
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private abortController: AbortController | null = null;
  private playbackRate: number = 1.0;

  constructor() {
    // Restore saved user preference if available
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("reporag_voice_mode");
      if (savedMode === "real_person" || savedMode === "browser") {
        this.engineMode = savedMode as VoiceEngineMode;
      }
      const savedVoiceId = localStorage.getItem("reporag_real_voice_id");
      if (savedVoiceId && REAL_PERSON_VOICE_MODELS.some((v) => v.id === savedVoiceId)) {
        this.selectedRealVoiceId = savedVoiceId;
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadBrowserVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadBrowserVoices();
      }
    }

    // Initialize SpeechRecognition if available
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = "en-US";
      }
    }
  }

  private loadBrowserVoices() {
    if (!this.synth) return;
    const all = this.synth.getVoices();
    // Exclude overtly robotic legacy synthesizers
    const filtered = all.filter((v) => {
      const name = v.name.toLowerCase();
      return !ROBOTIC_VOICE_NAMES.some((bad) => name.startsWith(bad) || name === bad);
    });
    this.voices = filtered.length > 0 ? filtered : all;

    // Prioritize natural / enhanced / Siri / Google voices
    const preferred = this.voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Enhanced") ||
          v.name.includes("Premium") ||
          v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Siri") ||
          v.name.includes("Samantha"))
    );
    this.selectedBrowserVoice =
      preferred || this.voices.find((v) => v.lang.startsWith("en")) || this.voices[0] || null;
    this.voiceListeners.forEach((l) => l(this.getVoices()));
  }

  public getMode(): VoiceEngineMode {
    return this.engineMode;
  }

  public setMode(mode: VoiceEngineMode) {
    this.engineMode = mode;
    if (typeof window !== "undefined") {
      localStorage.setItem("reporag_voice_mode", mode);
    }
  }

  public getRealVoices(): RealVoiceProfile[] {
    return REAL_PERSON_VOICE_MODELS;
  }

  public getRealVoice(): string {
    return this.selectedRealVoiceId;
  }

  public setRealVoice(voiceId: string) {
    if (REAL_PERSON_VOICE_MODELS.some((v) => v.id === voiceId)) {
      this.selectedRealVoiceId = voiceId;
      if (typeof window !== "undefined") {
        localStorage.setItem("reporag_real_voice_id", voiceId);
      }
    }
  }

  public onVoicesChanged(listener: (voices: SpeechSynthesisVoice[]) => void) {
    this.voiceListeners.push(listener);
    if (this.voices.length > 0) {
      listener(this.getVoices());
    }
    return () => {
      this.voiceListeners = this.voiceListeners.filter((l) => l !== listener);
    };
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices.filter((v) => v.lang.startsWith("en"));
  }

  public setVoice(voiceName: string) {
    const found = this.voices.find((v) => v.name === voiceName);
    if (found) this.selectedBrowserVoice = found;
  }

  public setRate(rate: number) {
    this.playbackRate = Math.min(2.0, Math.max(0.75, rate));
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = this.playbackRate;
    }
  }

  public getRate(): number {
    return this.playbackRate;
  }

  public getState(): VoiceState {
    return this.state;
  }

  public onStateChange(listener: (state: VoiceState) => void) {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  private notifyState(state: VoiceState) {
    this.state = state;
    this.stateListeners.forEach((l) => l(state));
  }

  public async speak(
    text: string,
    options?: {
      onEnd?: () => void;
      onSentence?: (sentence: string) => void;
      rate?: number;
      voiceId?: string;
    }
  ) {
    // Cancel any current speech or audio
    this.stop();

    const cleanText = this.sanitizeTextForSpeech(text);
    if (!cleanText) return;

    // Use Real Person AI Neural Voice if selected
    if (this.engineMode === "real_person") {
      try {
        const rateParam = this.getRateString(options?.rate || this.playbackRate);
        const voiceId = options?.voiceId || this.selectedRealVoiceId;

        this.notifyState("speaking");
        this.abortController = new AbortController();

        const response = await fetch(`${API_BASE}/voice/synthesize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: cleanText,
            voice: voiceId,
            rate: rateParam,
          }),
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Real person voice synthesis failed: ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        this.currentAudioUrl = audioUrl;

        const audio = new Audio(audioUrl);
        this.currentAudioElement = audio;
        audio.playbackRate = options?.rate || this.playbackRate;

        audio.onended = () => {
          this.notifyState("idle");
          this.cleanupAudio();
          if (options?.onEnd) options.onEnd();
        };

        audio.onerror = (e) => {
          console.warn("Audio playback error, falling back to browser synthesis:", e);
          this.cleanupAudio();
          this.speakWithBrowserSynth(cleanText, options);
        };

        await audio.play();
        return;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.warn("Real person speech API error, falling back to browser voice:", err);
        // Fall back seamlessly to browser speech synthesis
        this.speakWithBrowserSynth(cleanText, options);
        return;
      }
    }

    // Default Browser Speech
    this.speakWithBrowserSynth(cleanText, options);
  }

  private speakWithBrowserSynth(
    cleanText: string,
    options?: {
      onEnd?: () => void;
      rate?: number;
    }
  ) {
    if (!this.synth) {
      console.warn("SpeechSynthesis not supported on this browser.");
      this.notifyState("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    if (this.selectedBrowserVoice) {
      utterance.voice = this.selectedBrowserVoice;
    }
    utterance.rate = options?.rate || this.playbackRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.notifyState("speaking");
    };

    utterance.onend = () => {
      this.notifyState("idle");
      this.currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech error:", e);
      this.notifyState("idle");
      this.currentUtterance = null;
    };

    this.synth.speak(utterance);
  }

  private getRateString(rate: number): string {
    const diff = Math.round((rate - 1.0) * 100);
    if (diff === 0) return "+0%";
    return diff > 0 ? `+${diff}%` : `${diff}%`;
  }

  private cleanupAudio() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  public pause() {
    if (this.currentAudioElement && this.state === "speaking") {
      this.currentAudioElement.pause();
      this.notifyState("paused");
    } else if (this.synth && this.state === "speaking") {
      this.synth.pause();
      this.notifyState("paused");
    }
  }

  public resume() {
    if (this.currentAudioElement && this.state === "paused") {
      this.currentAudioElement.play();
      this.notifyState("speaking");
    } else if (this.synth && this.state === "paused") {
      this.synth.resume();
      this.notifyState("speaking");
    }
  }

  public stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.cleanupAudio();

    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
    this.notifyState("idle");
  }

  public togglePlay(text: string, onEnd?: () => void) {
    if (this.state === "speaking") {
      this.pause();
    } else if (this.state === "paused") {
      this.resume();
    } else {
      this.speak(text, { onEnd });
    }
  }

  // Speech-to-Text for Voice Inquiries
  public listen(onResult: (transcript: string) => void, onError?: (err: any) => void) {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    this.stop();
    this.notifyState("listening");

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.notifyState("idle");
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event);
      this.notifyState("idle");
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      if (this.state === "listening") {
        this.notifyState("idle");
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.notifyState("idle");
    }
  }

  public stopListening() {
    if (this.recognition && this.state === "listening") {
      this.recognition.stop();
      this.notifyState("idle");
    }
  }

  public sanitizeTextForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, "Code block omitted.") // Remove code fences
      .replace(/\|[^\n]+\|/g, " ") // Clean markdown tables
      .replace(/`([^`]+)`/g, "$1") // Clean inline code ticks
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Clean bold
      .replace(/\*([^*]+)\*/g, "$1") // Clean italics
      .replace(/#+\s/g, "") // Clean headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Clean markdown links
      .replace(/[-*•]\s+/g, "") // Clean bullet points
      .replace(/\bAPI\b/g, "A.P.I.")
      .replace(/\bRAG\b/g, "rag")
      .replace(/\bUI\b/g, "U.I.")
      .replace(/\bRepoRAG\b/g, "Repo Rag")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const voiceAssistant = new VoiceAssistantService();
