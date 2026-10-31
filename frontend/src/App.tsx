import React, { useState } from "react";
import { RepositoryIntelligence, TreeNode, KnowledgeGraph } from "./types";
import { api } from "./services/api";
import { Navbar } from "./components/Navbar";
import { CommandPalette } from "./components/CommandPalette";
import { HeroInput } from "./components/HeroInput";
import { OverviewTab } from "./components/OverviewTab";
import { ArchifyTab } from "./components/ArchifyTab";
import { SourceTreeTab } from "./components/SourceTreeTab";
import { KnowledgeGraphTab } from "./components/KnowledgeGraphTab";
import { RAGChatTab } from "./components/RAGChatTab";
import { GitTab } from "./components/GitTab";
import { DependenciesTab } from "./components/DependenciesTab";
import { HealthTab } from "./components/HealthTab";
import { AutoRepairTab } from "./components/AutoRepairTab";
import { OnboardingTab } from "./components/OnboardingTab";
import { VoiceAssistantHUD } from "./components/VoiceAssistantHUD";
import { DepthBackgroundCanvas } from "./components/depth/DepthBackgroundCanvas";
import { DepthModesSection } from "./components/depth/DepthModesSection";
import { DepthSearchAndMemorySection } from "./components/depth/DepthSearchAndMemorySection";
import { DepthFloatingBadge } from "./components/depth/DepthFloatingBadge";
import { DepthModals } from "./components/depth/DepthModals";
import {
  Layers,
  Cpu,
  Code2,
  Network,
  Sparkles,
  GitBranch,
  ShieldAlert,
  BookOpen,
  Package,
  ArrowLeft,
  Wrench,
} from "lucide-react";

export function App() {
  const [currentRepo, setCurrentRepo] = useState<RepositoryIntelligence | null>(null);
  const [sourceTree, setSourceTree] = useState<TreeNode | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [diagrams, setDiagrams] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedFileForTree, setSelectedFileForTree] = useState<string>("");
  const [targetIssueFile, setTargetIssueFile] = useState<string | null>(null);
  const [presetChatQuestion, setPresetChatQuestion] = useState<string>("");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidepanelMode, setIsSidepanelMode] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Mode selection state (Auto, Fast, Think)
  const [activeMode, setActiveMode] = useState<"auto" | "fast" | "think">("auto");

  // Auxiliary Modals State (Pricing, Changelog, About, etc.)
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAppPlaygroundOpen, setIsAppPlaygroundOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const tabs = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "repair", label: "Auto Repair", icon: Wrench },
    { id: "archify", label: "Archify", icon: Cpu },
    { id: "tree", label: "Source Tree", icon: Code2 },
    { id: "graph", label: "Knowledge Graph", icon: Network },
    { id: "chat", label: "RAG Chat", icon: Sparkles },
    { id: "git", label: "Git Map", icon: GitBranch },
    { id: "dependencies", label: "Dependencies", icon: Package },
    { id: "health", label: "Health & Security", icon: ShieldAlert },
    { id: "onboarding", label: "Onboarding", icon: BookOpen },
  ];

  // Loads repository artifacts once analyzed
  const loadRepositoryData = async (repoId: string) => {
    try {
      const [repo, tree, graph, diags] = await Promise.all([
        api.getRepository(repoId),
        api.getSourceTree(repoId),
        api.getKnowledgeGraph(repoId),
        api.getDiagrams(repoId),
      ]);
      setCurrentRepo(repo);
      setSourceTree(tree);
      setKnowledgeGraph(graph);
      setDiagrams(diags);
      setActiveTab("overview");
    } catch (err) {
      console.error("Failed to load repo data:", err);
    }
  };

  const handleExploreDemo = async () => {
    setLoadingInitial(true);
    try {
      const demoRepo = await api.getDemoRepo();
      await loadRepositoryData(demoRepo.id);
    } catch (err) {
      console.error("Failed to load demo:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handlePurge = async () => {
    if (currentRepo) {
      await api.purgeRepository(currentRepo.id);
      setCurrentRepo(null);
      setSourceTree(null);
      setKnowledgeGraph(null);
      setDiagrams({});
      setActiveTab("overview");
    }
  };

  const handleSelectFile = (path: string) => {
    setSelectedFileForTree(path);
    setActiveTab("tree");
  };

  return (
    <div
      className={`min-h-screen bg-[#070709] text-[#F5F5F5] flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden ${
        isSidepanelMode ? "max-w-[420px] mx-auto border-x border-white/[0.08] shadow-2xl" : ""
      }`}
    >
      {/* 1. Subtle Digital Atmosphere Canvas (strictly background) */}
      <DepthBackgroundCanvas />

      {/* 2. Header Navigation */}
      <Navbar
        currentRepo={currentRepo}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onLoadDemo={handleExploreDemo}
        onReset={() => setCurrentRepo(null)}
        isSidepanelMode={isSidepanelMode}
        onToggleSidepanelMode={() => setIsSidepanelMode(!isSidepanelMode)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 relative z-10">
        {!currentRepo ? (
          <div className="space-y-16">
            {/* Elevated Hero Command Area */}
            <HeroInput
              onAnalyzeSuccess={(repoId) => loadRepositoryData(repoId)}
              onExploreDemo={handleExploreDemo}
            />

            {/* [01] MODES Section (Auto, Fast, Think) */}
            <DepthModesSection
              activeMode={activeMode}
              onSelectMode={setActiveMode}
            />

            {/* [02] SEARCH & [01] MEMORY Section */}
            <DepthSearchAndMemorySection
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              onSelectPrompt={(p) => {
                setSelectedPrompt(p);
                setIsCommandPaletteOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Back Button / Quick Context Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D11] border border-white/[0.08] text-xs font-mono">
              <button
                onClick={() => setCurrentRepo(null)}
                className="flex items-center space-x-2 text-[#A1A1AA] hover:text-white transition duration-150"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>← Back to Repository Search</span>
              </button>
              <span className="text-[#686B73] hidden sm:inline">
                Workspace active: <strong className="text-white">{currentRepo.repository_name}</strong> ({currentRepo.default_branch})
              </span>
            </div>

            {/* AI Voice Assistant Narrator HUD */}
            <VoiceAssistantHUD
              repo={currentRepo}
              onAskVoiceQuestion={(question) => {
                setPresetChatQuestion(question);
                setActiveTab("chat");
              }}
              autoStartNarrative={true}
            />

            {/* Tab Navigation Bar */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0B0D11] border border-white/[0.08] overflow-x-auto text-xs font-mono scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg shrink-0 transition duration-150 border ${
                      active
                        ? "bg-[#14171D] border-white/[0.14] text-white font-semibold shadow-sm"
                        : "border-transparent text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-400" : "text-[#686B73]"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Views */}
            {activeTab === "overview" && (
              <OverviewTab
                repo={currentRepo}
                onSelectFile={handleSelectFile}
                onSwitchTab={setActiveTab}
                onNavigateToRepair={(file) => {
                  setTargetIssueFile(file || null);
                  setActiveTab("repair");
                }}
              />
            )}

            {activeTab === "repair" && (
              <AutoRepairTab
                repositoryId={currentRepo.id}
                repoData={currentRepo}
                onSelectFile={handleSelectFile}
                targetIssueFile={targetIssueFile}
              />
            )}

            {activeTab === "archify" && (
              <ArchifyTab diagrams={diagrams} repoName={currentRepo.repository_name} />
            )}

            {activeTab === "tree" && sourceTree && (
              <SourceTreeTab
                tree={sourceTree}
                repositoryId={currentRepo.id}
                importantFiles={currentRepo.important_files}
                selectedPath={selectedFileForTree}
              />
            )}

            {activeTab === "graph" && knowledgeGraph && (
              <KnowledgeGraphTab
                graph={knowledgeGraph}
                onSelectNodeFile={handleSelectFile}
              />
            )}

            {activeTab === "chat" && (
              <RAGChatTab
                repositoryId={currentRepo.id}
                onSelectFile={handleSelectFile}
                presetQuestion={presetChatQuestion}
              />
            )}

            {activeTab === "git" && (
              <GitTab
                commits={currentRepo.recent_commits}
                defaultBranch={currentRepo.default_branch}
                onSelectFile={handleSelectFile}
              />
            )}

            {activeTab === "dependencies" && (
              <DependenciesTab dependencies={currentRepo.dependencies} />
            )}

            {activeTab === "health" && (
              <HealthTab
                repositoryId={currentRepo.id}
                health={currentRepo.health}
                importantFiles={currentRepo.important_files}
                onSelectFile={handleSelectFile}
                aiUsage={currentRepo.ai_usage}
                onNavigateToRepair={(file) => {
                  setTargetIssueFile(file || null);
                  setActiveTab("repair");
                }}
              />
            )}

            {activeTab === "onboarding" && (
              <OnboardingTab repo={currentRepo} onSelectFile={handleSelectFile} />
            )}
          </div>
        )}
      </main>

      {/* 4. Floating Pricing Badge */}
      <DepthFloatingBadge onOpenPricing={() => setIsPricingOpen(true)} />

      {/* 5. Minimal Technical Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#070709] py-8 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#686B73]">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">RepoRAG</span>
            <span>•</span>
            <span>Autonomous Repository Intelligence</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational • 0.04ms edge</span>
          </div>
        </div>
      </footer>

      {/* 6. Global Command Palette (`⌘K`) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(t) => {
          if (!currentRepo) handleExploreDemo();
          setActiveTab(t);
        }}
        onLoadDemo={handleExploreDemo}
        onPurge={handlePurge}
        onAskQuestion={(q) => {
          setPresetChatQuestion(q);
          setActiveTab("chat");
        }}
      />

      {/* 7. Auxiliary Modals (Pricing, Changelog, About, etc.) */}
      <DepthModals
        isCommandPaletteOpen={false}
        onCloseCommandPalette={() => {}}
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
        onSelectPrompt={(p) => {
          setPresetChatQuestion(p);
          if (currentRepo) setActiveTab("chat");
        }}
        onLaunchRepoIntelligence={() => {
          if (!currentRepo) handleExploreDemo();
        }}
      />
    </div>
  );
}

export default App;
