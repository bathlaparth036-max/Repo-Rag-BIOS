import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import {
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Cpu,
  ArrowRightLeft,
  Key,
  Database,
  Share2
} from "lucide-react";

interface ArchifyTabProps {
  diagrams: Record<string, string>;
  repoName: string;
}

export const ArchifyTab: React.FC<ArchifyTabProps> = ({ diagrams, repoName }) => {
  const [activeView, setActiveView] = useState<string>("system");
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);

  const views = [
    { id: "system", label: "System Architecture", icon: Cpu },
    { id: "module", label: "Module Hierarchy", icon: Layers },
    { id: "dependencies", label: "Dependency Graph", icon: Share2 },
    { id: "data_flow", label: "Data Flow Sequence", icon: ArrowRightLeft },
    { id: "api_flow", label: "API Gateway Flow", icon: ArrowRightLeft },
    { id: "auth_flow", label: "Authentication Sequence", icon: Key },
    { id: "database", label: "Database / Entity Flow", icon: Database },
  ];

  const currentMermaid = diagrams[activeView] || "graph TD\n  Empty[No diagram available]";

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#090a0f",
        primaryColor: "#1e1b4b",
        primaryTextColor: "#f1f5f9",
        lineColor: "#38bdf8",
      },
      securityLevel: "loose",
    });

    const renderDiagram = async () => {
      if (!renderRef.current) return;
      try {
        renderRef.current.innerHTML = "";
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, currentMermaid);
        if (renderRef.current) {
          renderRef.current.innerHTML = svg;
          const svgEl = renderRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "100%";
            svgEl.style.maxHeight = "520px";
          }
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (renderRef.current) {
          renderRef.current.innerHTML = `<div class="p-4 text-xs text-rose-400 font-mono">Failed to render diagram syntax.</div>`;
        }
      }
    };

    renderDiagram();
  }, [activeView, currentMermaid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMermaid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSVG = () => {
    const svgEl = renderRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${repoName}-${activeView}-architecture.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 animate-in fade-in duration-200 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6" : ""}`} ref={containerRef}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-cardBorder">
        {/* Perspectives selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {views.map((v) => {
            const Icon = v.icon;
            const active = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  setActiveView(v.id);
                  setZoom(1);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                  active
                    ? "bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-bold"
                    : "bg-background/80 hover:bg-cardBorder border border-cardBorder text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom & Export Actions */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-cardBorder mx-1" />
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300 text-xs font-mono"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copy Code</span>
          </button>
          <button
            onClick={handleExportSVG}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-gradient-to-r from-accent-indigo to-accent-cyan text-black font-semibold text-xs font-mono hover:opacity-90 transition"
            title="Export as Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mermaid Canvas Display */}
      <div className="relative min-h-[500px] rounded-2xl bg-card border border-cardBorder overflow-hidden flex items-center justify-center p-6">
        <div
          ref={renderRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
          className="w-full h-full flex items-center justify-center"
        />

        {/* Watermark overlay */}
        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-600 pointer-events-none">
          RepoRAG Archify Engine • {repoName}
        </div>
      </div>
    </div>
  );
};
