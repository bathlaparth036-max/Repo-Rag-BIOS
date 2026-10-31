"""Knowledge Graph models for RepoRAG."""
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class NodeType(str, Enum):
    REPOSITORY = "repository"
    DIRECTORY = "directory"
    FILE = "file"
    CLASS = "class"
    FUNCTION = "function"
    INTERFACE = "interface"
    API = "api"
    DATABASE = "database"
    DEPENDENCY = "dependency"
    SERVICE = "service"
    COMMIT = "commit"


class EdgeType(str, Enum):
    CONTAINS = "CONTAINS"
    IMPORTS = "IMPORTS"
    CALLS = "CALLS"
    EXTENDS = "EXTENDS"
    IMPLEMENTS = "IMPLEMENTS"
    DEPENDS_ON = "DEPENDS_ON"
    EXPOSES = "EXPOSES"
    READS = "READS"
    WRITES = "WRITES"
    CHANGED_BY = "CHANGED_BY"


class GraphNode(BaseModel):
    id: str
    label: str
    node_type: NodeType
    group: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    importance: float = 0.5
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    source: str
    target: str
    edge_type: EdgeType
    label: Optional[str] = None
    weight: float = 1.0
    metadata: Dict[str, Any] = Field(default_factory=dict)


class KnowledgeGraph(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    total_nodes: int = 0
    total_edges: int = 0
