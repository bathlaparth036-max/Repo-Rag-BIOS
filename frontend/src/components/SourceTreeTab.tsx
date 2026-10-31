import React, { useState } from "react";
import { TreeNode, FileInfo } from "../types";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { api } from "../services/api";

interface SourceTreeTabProps {
  tree: TreeNode;
  repositoryId: string;
  importantFiles: FileInfo[];
  selectedPath?: string;
}

export const SourceTreeTab: React.FC<SourceTreeTabProps> = ({
  tree,
  repositoryId,
  importantFiles,
  selectedPath
}) => {
  const [activeFile, setActiveFile] = useState<string>(selectedPath || (importantFiles[0]?.path || ""));
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    "": true,
    "src": true,
    "backend": true,
    "app": true
  });

  const activeFileInfo = importantFiles.find((f) => f.path === activeFile);

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const loadFile = async (path: string) => {
    setActiveFile(path);
    setLoadingContent(true);
    try {
      const res = await api.getFileContent(repositoryId, path);
      setFileContent(res.content);
    } catch {
      setFileContent("// Source preview unavailable in local cache.");
    } finally {
      setLoadingContent(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    if (activeFile) {
      loadFile(activeFile);
    }
  }, [activeFile]);

  const renderTree = (node: TreeNode, depth: number = 0) => {
    if (!node) return null;
    const isDir = node.type === "directory";
    const isExpanded = expandedDirs[node.path] !== false;

    if (isDir) {
      return (
        <div key={node.path || "root"} className="text-xs font-mono">
          {node.name && (
            <div
              onClick={() => toggleDir(node.path)}
              style={{ paddingLeft: `${depth * 14}px` }}
              className="flex items-center space-x-1.5 py-1 px-2 rounded-md hover:bg-cardBorder/50 cursor-pointer text-slate-300 hover:text-white transition"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              {isExpanded ? <FolderOpen className="w-3.5 h-3.5 text-accent-indigo" /> : <Folder className="w-3.5 h-3.5 text-slate-400" />}
              <span className="font-semibold">{node.name}</span>
            </div>
          )}
          {isExpanded && node.children && (
            <div>
              {node.children
                .filter((child) => !filterQuery || child.path.toLowerCase().includes(filterQuery.toLowerCase()))
                .map((child) => renderTree(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const isSelected = activeFile === node.path;

    return (
      <div
        key={node.path}
        onClick={() => loadFile(node.path)}
        style={{ paddingLeft: `${(depth + 1) * 14}px` }}
        className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer text-xs font-mono transition ${
          isSelected
            ? "bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30"
            : "hover:bg-cardBorder/40 text-slate-400 hover:text-slate-200"
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate">
          <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{node.name}</span>
        </div>
        {node.ai_importance && node.ai_importance > 0.8 && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" title="High AI Centrality" />
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px] animate-in fade-in duration-200">
      {/* Left Tree Explorer */}
      <div className="lg:col-span-4 p-3 rounded-2xl bg-card border border-cardBorder flex flex-col h-[650px]">
        {/* Search Filter */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-cardBorder text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-accent-cyan/40"
          />
        </div>

        {/* Tree List */}
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {renderTree(tree)}
        </div>
      </div>

      {/* Right Intelligence Inspector & Code Viewer */}
      <div className="lg:col-span-8 space-y-4">
        {/* Intelligence Metadata Header */}
        <div className="p-4 rounded-2xl bg-card border border-cardBorder">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cardBorder">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm font-bold font-mono text-white">{activeFile || "Select a file"}</span>
            </div>

            {activeFileInfo && (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-background border border-cardBorder text-slate-300">
                  {activeFileInfo.language}
                </span>
                <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  Centrality: {Math.round(activeFileInfo.ai_importance_score * 100)}%
                </span>
                <span className="px-2 py-0.5 rounded bg-background border border-cardBorder text-slate-400">
                  {activeFileInfo.line_count} lines
                </span>
              </div>
            )}
          </div>

          {/* AST Extracted Entities & Relationships */}
          {activeFileInfo && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[11px] uppercase mb-1">AST Symbols Extracted</span>
                <div className="flex flex-wrap gap-1">
                  {activeFileInfo.symbols.length > 0 ? (
                    activeFileInfo.symbols.slice(0, 8).map((s) => (
                      <span key={s.name} className="px-1.5 py-0.5 rounded bg-background border border-cardBorder text-accent-cyan text-[11px]">
                        {s.symbol_type}: {s.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px] uppercase mb-1">Imported Dependencies</span>
                <div className="flex flex-wrap gap-1">
                  {activeFileInfo.imports.length > 0 ? (
                    activeFileInfo.imports.slice(0, 6).map((imp) => (
                      <span key={imp} className="px-1.5 py-0.5 rounded bg-background border border-cardBorder text-slate-300 text-[11px]">
                        {imp}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">Standard runtime</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code Content Viewer */}
        <div className="rounded-2xl bg-card border border-cardBorder overflow-hidden h-[480px] flex flex-col">
          <div className="px-4 py-2 bg-background/80 border-b border-cardBorder flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Source Code Preview</span>
            {loadingContent && <span className="text-accent-cyan animate-pulse">Loading source...</span>}
          </div>

          <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-slate-300 bg-[#090a0f] leading-relaxed select-text">
            <code>
              {fileContent.split("\n").map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="w-10 text-slate-600 select-none text-right pr-4 shrink-0">{idx + 1}</span>
                  <span className="text-slate-200">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
