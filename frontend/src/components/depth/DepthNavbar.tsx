import React, { useState } from "react";
import { Sparkles, Menu, X, ArrowUpRight } from "lucide-react";

interface DepthNavbarProps {
  onOpenApp: () => void;
  onOpenChangelog: () => void;
  onOpenAbout: () => void;
  onOpenPricing: () => void;
  onOpenContact: () => void;
}

export const DepthNavbar: React.FC<DepthNavbarProps> = ({
  onOpenApp,
  onOpenChangelog,
  onOpenAbout,
  onOpenPricing,
  onOpenContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0b0e]/75 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Minimalist Brand Text ("depth") */}
        <div className="flex items-center space-x-3">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
            className="group flex items-center space-x-2 text-white tracking-tight hover:opacity-90 transition"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center p-[1px] shadow-sm shadow-indigo-500/30">
              <div className="w-full h-full bg-[#0b0b0e] rounded-[5px] flex items-center justify-center text-[11px] font-mono font-bold text-cyan-300">
                d
              </div>
            </div>
            <span className="font-sans font-semibold text-xl tracking-tight text-white group-hover:text-cyan-200 transition">
              depth
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08] ml-1">
              v2.4
            </span>
          </a>
        </div>

        {/* Centered / Right-aligned Subtle Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-sans text-slate-300">
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-white transition-colors duration-200 tracking-wide"
          >
            Features
          </button>
          <button
            onClick={onOpenPricing}
            className="hover:text-white transition-colors duration-200 tracking-wide"
          >
            Pricing
          </button>
          <button
            onClick={onOpenChangelog}
            className="hover:text-white transition-colors duration-200 tracking-wide flex items-center space-x-1"
          >
            <span>Changelog</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block"></span>
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:text-white transition-colors duration-200 tracking-wide"
          >
            About
          </button>
          <button
            onClick={onOpenContact}
            className="hover:text-white transition-colors duration-200 tracking-wide"
          >
            Contact
          </button>
        </nav>

        {/* Right CTA Button: Pill-shaped, glowing blue/indigo "Open depth" */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={onOpenApp}
            className="relative group inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-medium text-white transition-all duration-300 overflow-hidden shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #06b6d4 100%)",
              boxShadow: "0 0 20px -2px rgba(79, 70, 229, 0.45)",
            }}
          >
            <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            <div className="relative flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span className="tracking-wide font-semibold">Open depth</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            {/* Soft border highlight */}
            <span className="absolute inset-0 rounded-full border border-white/30 pointer-events-none"></span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={onOpenApp}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white"
          >
            Open
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0b0b0e] px-4 py-4 space-y-3 font-sans text-sm">
          <button
            onClick={() => scrollToSection("features")}
            className="block w-full text-left py-2 text-slate-300 hover:text-white"
          >
            Features
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPricing();
            }}
            className="block w-full text-left py-2 text-slate-300 hover:text-white"
          >
            Pricing
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenChangelog();
            }}
            className="block w-full text-left py-2 text-slate-300 hover:text-white"
          >
            Changelog
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAbout();
            }}
            className="block w-full text-left py-2 text-slate-300 hover:text-white"
          >
            About
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenContact();
            }}
            className="block w-full text-left py-2 text-slate-300 hover:text-white"
          >
            Contact
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApp();
              }}
              className="w-full py-2.5 rounded-full text-center text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
            >
              Open depth
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
