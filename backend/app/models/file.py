"""File and source tree models."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.symbol import CodeSymbol


class FileInfo(BaseModel):
    path: str
    name: str
    extension: str
    language: str
    size_bytes: int
    line_count: int
    complexity_score: int = 1
    ai_importance_score: float = 0.5  # 0.0 - 1.0
    summary: Optional[str] = None
    purpose: Optional[str] = None
    symbols: List[CodeSymbol] = Field(default_factory=list)
    imports: List[str] = Field(default_factory=list)
    imported_by: List[str] = Field(default_factory=list)
    calls: List[str] = Field(default_factory=list)
    called_by: List[str] = Field(default_factory=list)
    is_entry_point: bool = False
    potential_risks: List[str] = Field(default_factory=list)


class TreeNode(BaseModel):
    name: str
    path: str
    type: str  # "file" or "directory"
    size: Optional[int] = None
    language: Optional[str] = None
    line_count: Optional[int] = None
    ai_importance: Optional[float] = None
    complexity: Optional[int] = None
    children: Optional[List["TreeNode"]] = None


TreeNode.model_rebuild()
