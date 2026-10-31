import React from "react";
import { RepositoryIntelligence } from "../types";
import { Command, Sparkles, PanelLeft, ExternalLink } from "lucide-react";

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface NavbarProps {
  currentRepo: RepositoryIntelligence | null;
  onOpenCommandPalette: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
  isSidepanelMode: boolean;
  onToggleSidepanelMode: () => void;
  onOpenPricing?: () => void;
  onOpenChangelog?: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRepo,
  onOpenCommandPalette,
  onLoadDemo,
  onReset,
  isSidepanelMode,
  onToggleSidepanelMode,
  onOpenPricing,
  onOpenChangelog,
  onOpenAbout,
  onOpenContact
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070709]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 overflow-hidden">
        {/* Brand Area */}
        <div
          onClick={onReset}
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0 select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-[#101217] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-xs text-white group-hover:border-indigo-400/50 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.25)] transition duration-200">
            &lt;◉&gt;
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-semibold tracking-tight text-white font-sans text-sm sm:text-base group-hover:text-indigo-200 transition">
              RepoRAG
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#A1A1AA] border border-white/[0.08] hidden sm:inline-block">
              v1.0 Engine
            </span>
            {!isSidepanelMode && !currentRepo && (
              <span className="text-xs text-[#686B73] hidden xl:inline pl-1 border-l border-white/[0.08]">
                Understand Any Repository. Ask Anything.
              </span>
            )}
          </div>
        </div>

        {/* Center Menu Links (when on home screen) */}
        {!currentRepo && !isSidepanelMode && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-mono text-[#A1A1AA]">
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="px-2.5 py-1 rounded-lg hover:text-white hover:bg-white/[0.04] transition"
              >
                Pricing
              </button>
            )}
            {onOpenChangelog && (
              <button
                onClick={onOpenChangelog}
                className="px-2.5 py-1 rounded-lg hover:text-white hover:bg-white/[0.04] transition"
              >
                Changelog
              </button>
            )}
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="px-2.5 py-1 rounded-lg hover:text-white hover:bg-white/[0.04] transition"
              >
                About
              </button>
            )}
            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="px-2.5 py-1 rounded-lg hover:text-white hover:bg-white/[0.04] transition"
              >
                Contact
              </button>
            )}
          </nav>
        )}

        {/* Current Active Repo Badge (Centrally or inline) */}
        {currentRepo && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0B0D11] border border-white/[0.08] text-xs text-[#A1A1AA] max-w-sm truncate">
            <GithubIcon className="w-3.5 h-3.5 text-[#686B73] shrink-0" />
            <span className="font-medium text-white truncate">{currentRepo.full_name}</span>
            <span className="text-[#686B73]">•</span>
            <span className="text-indigo-300 font-mono text-[11px] shrink-0">{currentRepo.default_branch}</span>
            <span className="text-[#686B73]">•</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Indexed
            </span>
          </div>
        )}

        {/* Action Controls - cleanly contained with zero overflow */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B0D11] hover:bg-[#101217] border border-white/[0.08] hover:border-white/[0.16] text-[#A1A1AA] hover:text-white text-xs font-mono transition duration-150"
            title="Open Command Palette (Cmd + K)"
          >
            <Command className="w-3.5 h-3.5 text-[#686B73]" />
            <span className="hidden sm:inline">⌘K</span>
          </button>

          {/* Explore Demo Button (when not loaded) */}
          {!currentRepo && (
            <button
              onClick={onLoadDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-900/60 to-cyan-900/60 hover:from-indigo-800/80 hover:to-cyan-800/80 border border-indigo-500/30 text-white text-xs font-sans font-medium transition duration-150 shadow-sm shadow-indigo-950/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Explore Demo</span>
            </button>
          )}

          {/* SidePanel Mode Toggle Button */}
          <button
            onClick={onToggleSidepanelMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition duration-150 border ${
              isSidepanelMode
                ? "bg-indigo-950/40 border-indigo-400/50 text-indigo-300 shadow-sm shadow-indigo-950"
                : "bg-[#0B0D11] hover:bg-[#101217] border-white/[0.08] hover:border-white/[0.16] text-[#686B73] hover:text-[#A1A1AA]"
            }`}
            title="Toggle Chrome Side Panel Simulation Mode"
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">SidePanel</span>
          </button>

          {/* External GitHub Link (when repo is loaded) */}
          {currentRepo && (
            <a
              href={currentRepo.html_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white bg-[#0B0D11] hover:bg-[#101217] border border-white/[0.08] hover:border-white/[0.16] transition duration-150"
              title="Open GitHub Repository"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
