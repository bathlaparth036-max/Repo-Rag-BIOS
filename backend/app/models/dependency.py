"""Dependency models for package manifests and external libraries."""
from typing import Optional, List
from pydantic import BaseModel, Field


class DependencyItem(BaseModel):
    name: str
    version: Optional[str] = "latest"
    ecosystem: str  # npm, pypi, maven, cargo, go, composer
    is_dev: bool = False
    purpose: Optional[str] = None
    risk_level: str = "Low"  # Low, Medium, High, Unknown
    used_in_files: List[str] = Field(default_factory=list)
    license: Optional[str] = None
    outdated: bool = False


class DependencyManifest(BaseModel):
    file_path: str
    ecosystem: str
    dependencies: List[DependencyItem] = Field(default_factory=list)
    total_count: int = 0
