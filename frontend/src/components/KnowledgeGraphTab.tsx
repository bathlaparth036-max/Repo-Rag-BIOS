import React, { useState, useRef } from "react";
import { KnowledgeGraph, GraphNode } from "../types";
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Code2,
  Cpu,
  GitCommit
} from "lucide-react";

interface KnowledgeGraphTabProps {
  graph: KnowledgeGraph;
  onSelectNodeFile?: (file: string) => void;
}

export const KnowledgeGraphTab: React.FC<KnowledgeGraphTabProps> = ({ graph, onSelectNodeFile }) => {
  const [search, setSearch] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [zoom, setZoom] = useState(1);

  const filteredNodes = graph.nodes.filter((n) => {
    const matchesSearch = !search || n.label.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || n.node_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getNodeColor = (type: string) => {
    switch (type) {
      case "repository": return "#6366f1";
      case "file": return "#00f2fe";
      case "class": return "#a855f7";
      case "function": return "#38bdf8";
      case "api": return "#2cb67d";
      case "dependency": return "#f59e0b";
      case "commit": return "#ff5470";
      default: return "#94a3b8";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-cardBorder">
        {/* Search & Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-background border border-cardBorder text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-accent-cyan/40"
            />
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-lg bg-background border border-cardBorder text-xs font-mono">
            {["all", "file", "class", "function", "dependency"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 rounded capitalize transition ${
                  typeFilter === t
                    ? "bg-accent-cyan/20 text-accent-cyan font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded bg-background hover:bg-cardBorder border border-cardBorder text-slate-300"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Visualizer Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9 relative min-h-[560px] rounded-2xl bg-card border border-cardBorder overflow-hidden flex items-center justify-center p-6">
          <svg
            className="w-full h-full min-h-[500px]"
            viewBox="0 0 900 500"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
          >
            <defs>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Render Circular Orbit Graph */}
            {filteredNodes.slice(0, 30).map((node, idx) => {
              const total = Math.min(30, filteredNodes.length);
              const angle = (idx / total) * 2 * Math.PI;
              const radius = 180 + (idx % 2 === 0 ? 30 : -30);
              const cx = 450 + radius * Math.cos(angle);
              const cy = 250 + radius * Math.sin(angle);
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.node_type);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Line to center */}
                  <line
                    x1="450"
                    y1="250"
                    x2={cx}
                    y2={cy}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Node Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 16 : 10}
                    fill={color}
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  {/* Node Label */}
                  <text
                    x={cx}
                    y={cy + 22}
                    textAnchor="middle"
                    fill={isSelected ? "#00f2fe" : "#94a3b8"}
                    fontSize="10"
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 16 ? node.label.slice(0, 14) + ".." : node.label}
                  </text>
                </g>
              );
            })}

            {/* Central Repository Core Node */}
            <circle cx="450" cy="250" r="32" fill="#6366f1" className="shadow-lg" />
            <text
              x="450"
              y="254"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
              className="select-none pointer-events-none"
            >
              CORE
            </text>
          </svg>

          {/* Stats Badge */}
          <div className="absolute top-4 left-4 text-xs font-mono text-slate-400 bg-background/80 px-2.5 py-1 rounded-md border border-cardBorder">
            Nodes: <span className="text-white font-bold">{graph.total_nodes}</span> • Edges:{" "}
            <span className="text-white font-bold">{graph.total_edges}</span>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-card border border-cardBorder flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-accent-cyan" />
              Node Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[11px]">Label</span>
                  <span className="text-white font-bold">{selectedNode.label}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Type</span>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase mt-1"
                    style={{ backgroundColor: `${getNodeColor(selectedNode.node_type)}20`, color: getNodeColor(selectedNode.node_type) }}
                  >
                    {selectedNode.node_type}
                  </span>
                </div>

                {selectedNode.file_path && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">File Location</span>
                    <span className="text-accent-cyan break-all">{selectedNode.file_path}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block text-[11px]">Centrality Score</span>
                  <span className="text-white">{Math.round(selectedNode.importance * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Click any node on the graph to inspect relationships and definitions.
              </div>
            )}
          </div>

          {selectedNode?.file_path && onSelectNodeFile && (
            <button
              onClick={() => onSelectNodeFile(selectedNode.file_path!)}
              className="w-full py-2 rounded-lg bg-cardBorder hover:bg-slate-700 text-white text-xs font-mono transition"
            >
              Open in Source Tree
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
