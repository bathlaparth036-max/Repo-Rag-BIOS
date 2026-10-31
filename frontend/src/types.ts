export interface DependencyItem {
  name: string;
  version?: string;
  ecosystem: string;
  is_dev: boolean;
  purpose?: string;
  risk_level: string;
  used_in_files?: string[];
}

export interface CodeSymbol {
  name: string;
  symbol_type: string;
  file_path: string;
  start_line: number;
  end_line: number;
  parent_symbol?: string;
  docstring?: string;
  parameters: string[];
  complexity: number;
  code_snippet?: string;
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  language: string;
  size_bytes: number;
  line_count: number;
  complexity_score: number;
  ai_importance_score: number;
  purpose?: string;
  symbols: CodeSymbol[];
  imports: string[];
  calls: string[];
}

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  language?: string;
  line_count?: number;
  ai_importance?: number;
  complexity?: number;
  children?: TreeNode[];
}

export interface HealthScore {
  overall: number;
  architecture: number;
  maintainability: number;
  documentation: number;
  testing: number;
  security: number;
  is_ai_estimated: boolean;
  summary: string;
}

export interface GitCommit {
  hash: string;
  short_hash: string;
  author: string;
  date: string;
  message: string;
  changed_files: string[];
}

export interface ArchitectureOverview {
  style: string;
  description: string;
  entry_points: string[];
  frontend_entry?: string;
  backend_entry?: string;
  services: string[];
  databases: string[];
  apis: string[];
  data_flow: string;
}

export interface AIFileSignal {
  file_path: string;
  ai_percentage: number;
  confidence: number;
  detected_patterns: string[];
  lines_analyzed: number;
  estimated_ai_lines: number;
}

export interface AIDetectionReport {
  overall_percentage: number;
  confidence_level: "High" | "Medium" | "Low";
  classification: "Human Hand-Crafted" | "Light AI Assistance" | "Substantial AI-Assisted" | "Predominantly AI-Generated";
  ai_lines_count: number;
  total_lines_count: number;
  signals_detected: string[];
  top_ai_files: AIFileSignal[];
  has_ai_tool_config: boolean;
  ai_tools_detected: string[];
  summary: string;
}

export interface RepositoryIntelligence {
  id: string;
  owner: string;
  repository_name: string;
  full_name: string;
  html_url: string;
  description?: string;
  default_branch: string;
  current_commit_sha?: string;
  is_private: boolean;
  stars: number;
  forks: number;
  languages: Record<string, number>;
  frameworks: string[];
  dependencies: DependencyItem[];
  file_count: number;
  directory_count: number;
  contributor_count: number;
  commit_count: number;
  architecture: ArchitectureOverview;
  health: HealthScore;
  ai_usage?: AIDetectionReport;
  important_files: FileInfo[];
  recent_commits: GitCommit[];
  status: string;
  progress_percentage: number;
  status_message: string;
  overview_summary: string;
  summary_30s: string;
  summary_2m: string;
  summary_5m: string;
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: string;
  group: string;
  file_path?: string;
  line_number?: number;
  importance: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  edge_type: string;
  label?: string;
  weight: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface EvidenceItem {
  file_path: string;
  symbol?: string;
  start_line: number;
  end_line: number;
  snippet: string;
  relevance_score: number;
}

export interface GroundedAnswer {
  query: string;
  answer: string;
  evidence: EvidenceItem[];
  relevant_files: string[];
  relevant_symbols: string[];
  confidence: number;
  model_used: string;
}

export interface SecurityIssue {
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  file_path: string;
  line_number: number;
  reason: string;
  suggested_remediation: string;
  snippet?: string;
}

export interface ChangeImpactResult {
  target_file: string;
  risk_level: string;
  direct_dependents: string[];
  indirect_dependents: string[];
  affected_apis: string[];
  affected_tests: string[];
  summary: string;
}

export interface RepairExplanation {
  problem: string;
  repair: string;
  impact: string;
}

export interface RepairValidation {
  status?: "pending" | "passed" | "failed";
  syntax_check: boolean;
  type_check: boolean;
  test_suite_passed?: boolean;
  test_check?: boolean;
  tests_run?: number;
  tests_failed?: number;
  lint_passed?: boolean;
  build_check?: boolean;
  summary?: string;
  output_log?: string;
  details?: string[];
}

export interface CodeIssue {
  id: string;
  repository_id: string;
  file_path: string;
  title: string;
  description?: string;
  category: string;
  severity: "Critical" | "Warning" | "Info" | "critical" | "warning" | "info";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidence_score?: number;
  confidence_reason?: string;
  start_line: number;
  end_line: number;
  original_snippet: string;
  original_code?: string;
  repaired_snippet: string;
  repaired_code?: string;
  git_diff: string;
  diff?: string;
  original_file_hash: string;
  problem_explanation?: string;
  repair_explanation?: string;
  impact_explanation?: string;
  explanation?: RepairExplanation;
  validation: RepairValidation;
  status: "detected" | "analyzing" | "repairing" | "validating" | "ready" | "validated" | "validation_failed" | "applied" | "rejected";
  safe_to_auto_apply?: boolean;
  requires_manual_review?: boolean;
  created_at?: string;
}

export interface RepairHistoryItem {
  id: string;
  timestamp: string;
  action: "applied" | "rejected" | "rollback";
  issue_ids: string[];
  files_modified: string[];
  lines_added: number;
  lines_removed: number;
  summary: string;
  can_rollback: boolean;
}

export interface RepairSummary {
  total_issues: number;
  repairable: number;
  repairable_count?: number;
  warnings: number;
  warning_count?: number;
  manual_review: number;
  manual_review_count?: number;
  critical: number;
  critical_count?: number;
  applied?: number;
  rejected?: number;
}


