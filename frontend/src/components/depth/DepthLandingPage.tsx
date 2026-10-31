import React, { useState } from "react";
import { DepthBackgroundCanvas } from "./DepthBackgroundCanvas";
import { DepthNavbar } from "./DepthNavbar";
import { DepthHero } from "./DepthHero";
import { DepthModesSection } from "./DepthModesSection";
import { DepthSearchAndMemorySection } from "./DepthSearchAndMemorySection";
import { DepthFloatingBadge } from "./DepthFloatingBadge";
import { DepthModals } from "./DepthModals";
import { Sparkles, Terminal, Code2, ArrowUpRight } from "lucide-react";

interface DepthLandingPageProps {
  onLaunchRepoAnalysis: () => void;
  onExploreDemo: () => void;
}

export const DepthLandingPage: React.FC<DepthLandingPageProps> = ({
  onLaunchRepoAnalysis,
  onExploreDemo,
}) => {
  // Global Mode selection ("auto" | "fast" | "think")
  const [activeMode, setActiveMode] = useState<"auto" | "fast" | "think">("auto");

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAppPlaygroundOpen, setIsAppPlaygroundOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const handleOpenAppWithPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    setIsAppPlaygroundOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b0e] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* 1. Immersive Antigravity ASCII Marine Canvas Background */}
      <DepthBackgroundCanvas />

      {/* 2. Top Navigation Bar */}
      <DepthNavbar
        onOpenApp={() => setIsAppPlaygroundOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Content Container */}
      <main className="relative z-10">
        {/* 3. Hero Section with Personalized Greeting & Cycling Typewriter */}
        <DepthHero
          activeMode={activeMode}
          onSelectMode={setActiveMode}
          onOpenAppWithPrompt={handleOpenAppWithPrompt}
        />

        {/* 4. Feature Section: [01] MODES ("Choose how depth answers") */}
        <DepthModesSection
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />

        {/* 5. Search & Memory Section: [02] SEARCH & [01] MEMORY */}
        <DepthSearchAndMemorySection
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onSelectPrompt={handleOpenAppWithPrompt}
        />

        {/* 6. Repository Intelligence Hybrid Bridge Banner */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#11121c]/90 to-cyan-950/40 border border-white/[0.1] p-8 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-mono">
                <Code2 className="w-3 h-3 mr-0.5" />
                <span>GITHUB REPO INTELLIGENCE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Inspect Any Codebase with Depth RAG
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                Connect your GitHub repositories to generate interactive architectural graphs, AST dependency trees, voice narrations, and AI code triage.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-mono font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.15] transition text-center"
              >
                Launch Demo Repo
              </button>
              <button
                onClick={onLaunchRepoAnalysis}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition text-center flex items-center justify-center space-x-1.5"
              >
                <span>Analyze Custom URL</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Floating Pricing & Made in Framer Badge */}
      <DepthFloatingBadge onOpenPricing={() => setIsPricingOpen(true)} />

      {/* 8. Minimalist Dark Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#090a0d]/90 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-mono">
          <div className="flex items-center space-x-3">
            <span className="font-sans font-bold text-base text-white tracking-tight">depth</span>
            <span>•</span>
            <span>Antigravity Cognition Engine</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Changelog (v2.4)
            </button>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Lifetime License
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Design Manifesto
            </button>
            <button
              onClick={() => setIsContactOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All systems operational • 0.04ms edge</span>
          </div>
        </div>
      </footer>

      {/* 9. Interactive Modals (⌘K Command Palette, Pricing, Changelog, Studio) */}
      <DepthModals
        isCommandPaletteOpen={isCommandPaletteOpen}
        onCloseCommandPalette={() => setIsCommandPaletteOpen(false)}
        isPricingOpen={isPricingOpen}
        onClosePricing={() => setIsPricingOpen(false)}
        isChangelogOpen={isChangelogOpen}
        onCloseChangelog={() => setIsChangelogOpen(false)}
        isAboutOpen={isAboutOpen}
        onCloseAbout={() => setIsAboutOpen(false)}
        isContactOpen={isContactOpen}
        onCloseContact={() => setIsContactOpen(false)}
        isAppPlaygroundOpen={isAppPlaygroundOpen}
        onCloseAppPlayground={() => setIsAppPlaygroundOpen(false)}
        initialPrompt={selectedPrompt}
        onSelectPrompt={handleOpenAppWithPrompt}
        onLaunchRepoIntelligence={onLaunchRepoAnalysis}
      />
    </div>
  );
};
