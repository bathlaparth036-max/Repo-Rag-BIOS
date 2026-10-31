"""Repository models and Repository Intelligence Object."""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.models.file import FileInfo, TreeNode
from app.models.dependency import DependencyItem
from app.models.graph import KnowledgeGraph


class IngestionStage(str, Enum):
    IDLE = "IDLE"
    VALIDATING = "VALIDATING"
    FETCHING = "FETCHING"
    SCANNING = "SCANNING"
    PARSING = "PARSING"
    INDEXING = "INDEXING"
    EMBEDDING = "EMBEDDING"
    GRAPH_BUILDING = "GRAPH_BUILDING"
    ANALYZING = "ANALYZING"
    READY = "READY"
    FAILED = "FAILED"


class HealthScore(BaseModel):
    overall: int = 80
    architecture: int = 85
    maintainability: int = 78
    documentation: int = 70
    testing: int = 72
    security: int = 85
    is_ai_estimated: bool = True
    summary: str = "Codebase exhibits solid structural separation and high cohesion."


class GitCommit(BaseModel):
    hash: str
    short_hash: str
    author: str
    date: str
    message: str
    changed_files: List[str] = Field(default_factory=list)


class AIFileSignal(BaseModel):
    file_path: str
    ai_percentage: int = 0
    confidence: float = 0.8
    detected_patterns: List[str] = Field(default_factory=list)
    lines_analyzed: int = 0
    estimated_ai_lines: int = 0


class AIDetectionReport(BaseModel):
    overall_percentage: int = 0  # 0 to 100
    confidence_level: str = "High"  # High, Medium, Low
    classification: str = "Human Hand-Crafted"  # Human Hand-Crafted, Light AI Assistance, Substantial AI-Assisted, Predominantly AI-Generated
    ai_lines_count: int = 0
    total_lines_count: int = 0
    signals_detected: List[str] = Field(default_factory=list)
    top_ai_files: List[AIFileSignal] = Field(default_factory=list)
    has_ai_tool_config: bool = False
    ai_tools_detected: List[str] = Field(default_factory=list)
    summary: str = "Minimal or no automated AI artifacts detected in repository source files."


class ArchitectureOverview(BaseModel):
    style: str = "Layered Architecture"  # Monolith, Microservices, MVC, Layered, Event-Driven
    description: str = ""
    entry_points: List[str] = Field(default_factory=list)
    frontend_entry: Optional[str] = None
    backend_entry: Optional[str] = None
    services: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    apis: List[str] = Field(default_factory=list)
    data_flow: str = ""


class RepositoryIntelligence(BaseModel):
    id: str
    owner: str
    repository_name: str
    full_name: str
    html_url: str
    description: Optional[str] = None
    default_branch: str = "main"
    current_commit_sha: Optional[str] = None
    is_private: bool = False
    stars: int = 0
    forks: int = 0

    # Project structure & counts
    languages: Dict[str, float] = Field(default_factory=dict)  # Language -> percentage
    frameworks: List[str] = Field(default_factory=list)
    dependencies: List[DependencyItem] = Field(default_factory=list)
    file_count: int = 0
    directory_count: int = 0
    contributor_count: int = 1
    commit_count: int = 0

    # Architecture & AI Insights
    architecture: ArchitectureOverview = Field(default_factory=ArchitectureOverview)
    health: HealthScore = Field(default_factory=HealthScore)
    ai_usage: AIDetectionReport = Field(default_factory=AIDetectionReport)
    important_files: List[FileInfo] = Field(default_factory=list)
    recent_commits: List[GitCommit] = Field(default_factory=list)

    # Ingestion State
    status: IngestionStage = IngestionStage.IDLE
    progress_percentage: int = 0
    status_message: str = "Ready to analyze"
    error: Optional[str] = None

    # Summaries
    overview_summary: str = ""
    summary_30s: str = ""
    summary_2m: str = ""
    summary_5m: str = ""


class IngestionJobStatus(BaseModel):
    job_id: str
    repository_id: str
    stage: IngestionStage
    progress: int
    message: str
    error: Optional[str] = None
