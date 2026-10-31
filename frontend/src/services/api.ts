import {
  RepositoryIntelligence,
  TreeNode,
  KnowledgeGraph,
  GroundedAnswer,
  SecurityIssue,
  ChangeImpactResult,
  AIDetectionReport,
  CodeIssue,
  RepairHistoryItem,
  RepairSummary,
  RepairValidation
} from "../types";

export const API_BASE =
  typeof window !== "undefined" && window.location.origin.includes(":8000")
    ? `${window.location.origin}/api`
    : "http://127.0.0.1:8000/api";


export const api = {
  async validateRepo(url: string) {
    const res = await fetch(`${API_BASE}/repositories/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Validation failed");
    }
    return res.json();
  },

  async startAnalysis(url: string, token?: string): Promise<{ job_id: string; repository_id: string; message: string }> {
    const res = await fetch(`${API_BASE}/ingestion/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, token: token || undefined }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to start analysis");
    }
    return res.json();
  },

  async getJobStatus(jobId: string) {
    const res = await fetch(`${API_BASE}/ingestion/status/${jobId}`);
    if (!res.ok) throw new Error("Could not fetch job status");
    return res.json();
  },

  async getDemoRepo(): Promise<RepositoryIntelligence> {
    const res = await fetch(`${API_BASE}/repositories/demo`);
    if (!res.ok) throw new Error("Failed to load demo repository");
    return res.json();
  },

  async getRepository(repositoryId: string): Promise<RepositoryIntelligence> {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}`);
    if (!res.ok) throw new Error("Failed to fetch repository intelligence");
    return res.json();
  },

  async getSourceTree(repositoryId: string): Promise<TreeNode> {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}/tree`);
    if (!res.ok) throw new Error("Failed to fetch source tree");
    return res.json();
  },

  async getKnowledgeGraph(repositoryId: string): Promise<KnowledgeGraph> {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}/graph`);
    if (!res.ok) throw new Error("Failed to fetch knowledge graph");
    return res.json();
  },

  async getDiagrams(repositoryId: string): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}/diagrams`);
    if (!res.ok) throw new Error("Failed to fetch diagrams");
    return res.json();
  },

  async getFileContent(repositoryId: string, path: string): Promise<{ path: string; content: string }> {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}/file?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error("File content not found");
    return res.json();
  },

  async askChat(repositoryId: string, query: string): Promise<GroundedAnswer> {
    const res = await fetch(`${API_BASE}/chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repository_id: repositoryId, query }),
    });
    if (!res.ok) throw new Error("Failed to synthesize response");
    return res.json();
  },

  async hybridSearch(repositoryId: string, query: string) {
    const res = await fetch(`${API_BASE}/search/hybrid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repository_id: repositoryId, query }),
    });
    if (!res.ok) throw new Error("Search failed");
    return res.json();
  },

  async getSecurityScan(repositoryId: string): Promise<{ findings: SecurityIssue[]; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/security/${repositoryId}/scan`);
    if (!res.ok) throw new Error("Security scan failed");
    return res.json();
  },

  async getOnboardingGuide(repositoryId: string) {
    const res = await fetch(`${API_BASE}/health/${repositoryId}/onboarding`);
    if (!res.ok) throw new Error("Failed to generate onboarding guide");
    return res.json();
  },

  async checkChangeImpact(repositoryId: string, targetFile: string): Promise<ChangeImpactResult> {
    const res = await fetch(`${API_BASE}/health/${repositoryId}/change-impact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_file: targetFile }),
    });
    if (!res.ok) throw new Error("Change impact analysis failed");
    return res.json();
  },

  async getAIDetectionReport(repositoryId: string): Promise<AIDetectionReport> {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}/ai-detection`);
    if (!res.ok) throw new Error("Failed to fetch AI detection report");
    return res.json();
  },

  async purgeRepository(repositoryId: string) {
    const res = await fetch(`${API_BASE}/repositories/${repositoryId}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async getRepairIssues(repositoryId: string): Promise<{
    repository_id: string;
    summary?: RepairSummary;
    issues: CodeIssue[];
    total_issues?: number;
    repairable_count?: number;
    critical_count?: number;
    warning_count?: number;
    manual_review_count?: number;
  }> {
    const res = await fetch(`${API_BASE}/repair/${repositoryId}/issues`);
    if (!res.ok) throw new Error("Failed to load repair issues");
    return res.json();
  },

  async validateRepair(repositoryId: string, issueId: string, customCommand?: string): Promise<{ issue_id: string; validation: RepairValidation }> {
    const res = await fetch(`${API_BASE}/repair/${repositoryId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_id: issueId, custom_command: customCommand }),
    });
    if (!res.ok) throw new Error("Validation failed");
    return res.json();
  },

  async applyRepairs(
    repositoryId: string,
    issueIds: string[],
    clientFileHashes?: Record<string, string>
  ): Promise<{
    success: boolean;
    applied_issues: string[];
    modified_files: string[];
    stale_conflicts: Array<{ file_path: string; issue_id: string; reason: string }>;
    lines_added: number;
    lines_removed: number;
    summary: string;
  }> {
    const res = await fetch(`${API_BASE}/repair/${repositoryId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue_ids: issueIds, client_file_hashes: clientFileHashes || {} }),
    });
    if (!res.ok) throw new Error("Failed to apply repairs");
    return res.json();
  },

  async rollbackRepair(repositoryId: string, historyId: string): Promise<{ success: boolean; message: string; files_reverted: string[] }> {
    const res = await fetch(`${API_BASE}/repair/${repositoryId}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history_id: historyId }),
    });
    if (!res.ok) throw new Error("Rollback failed");
    return res.json();
  },

  async getRepairHistory(repositoryId: string): Promise<{ repository_id: string; history: RepairHistoryItem[] }> {
    const res = await fetch(`${API_BASE}/repair/${repositoryId}/history`);
    if (!res.ok) throw new Error("Failed to fetch repair history");
    return res.json();
  }
};

