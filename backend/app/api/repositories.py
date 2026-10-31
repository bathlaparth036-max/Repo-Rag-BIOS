"""Repository metadata, inspection, source tree, and knowledge graph endpoints."""
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.repository_service import repository_service
from app.ingestion.github_client import GitHubClient
from app.models.repository import RepositoryIntelligence
from app.models.file import TreeNode
from app.models.graph import KnowledgeGraph


router = APIRouter(prefix="/repositories", tags=["Repositories"])


class ValidateRepoRequest(BaseModel):
    url: str


class ValidateRepoResponse(BaseModel):
    valid: bool
    owner: str
    repository: str
    message: str
    is_cached: bool = False
    repository_id: str


@router.post("/validate", response_model=ValidateRepoResponse)
async def validate_repository(req: ValidateRepoRequest):
    try:
        gh = GitHubClient()
        owner, repo = gh.parse_repo_url(req.url)
        repo_id = f"{owner}/{repo}".lower().replace("/", "--")
        is_cached = repo_id in repository_service.repositories
        return ValidateRepoResponse(
            valid=True,
            owner=owner,
            repository=repo,
            message=f"Repository {owner}/{repo} is valid.",
            is_cached=is_cached,
            repository_id=repo_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/demo")
async def get_demo_repository():
    """Returns pre-loaded demo repository ID."""
    demo_id = "demo-fullstack-ai"
    if demo_id in repository_service.repositories:
        return repository_service.repositories[demo_id]
    raise HTTPException(status_code=404, detail="Demo repository not loaded")


@router.get("/{repository_id}", response_model=RepositoryIntelligence)
async def get_repository(repository_id: str):
    repo = repository_service.repositories.get(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail=f"Repository '{repository_id}' not found or not yet analyzed.")
    return repo


@router.get("/{repository_id}/tree", response_model=TreeNode)
async def get_repository_tree(repository_id: str):
    tree = repository_service.source_trees.get(repository_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Source tree not found for repository.")
    return tree


@router.get("/{repository_id}/graph", response_model=KnowledgeGraph)
async def get_knowledge_graph(repository_id: str):
    graph = repository_service.knowledge_graphs.get(repository_id)
    if not graph:
        raise HTTPException(status_code=404, detail="Knowledge graph not found for repository.")
    return graph


@router.get("/{repository_id}/diagrams")
async def get_archify_diagrams(repository_id: str):
    diagrams = repository_service.diagrams.get(repository_id)
    if not diagrams:
        raise HTTPException(status_code=404, detail="Architecture diagrams not found for repository.")
    return diagrams


@router.get("/{repository_id}/ai-detection")
async def get_ai_detection_report(repository_id: str):
    repo = repository_service.repositories.get(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail=f"Repository '{repository_id}' not found.")
    return repo.ai_usage


@router.get("/{repository_id}/file")
async def get_file_content(repository_id: str, path: str = Query(...)):
    contents = repository_service.file_contents.get(repository_id, {})
    if path in contents:
        return {"path": path, "content": contents[path]}
    raise HTTPException(status_code=404, detail=f"File '{path}' not found in index.")


@router.delete("/{repository_id}")
async def delete_repository_data(repository_id: str):
    """Purges repository data per privacy and compliance guidelines."""
    if repository_id in repository_service.repositories:
        del repository_service.repositories[repository_id]
    if repository_id in repository_service.source_trees:
        del repository_service.source_trees[repository_id]
    if repository_id in repository_service.knowledge_graphs:
        del repository_service.knowledge_graphs[repository_id]
    if repository_id in repository_service.all_chunks:
        del repository_service.all_chunks[repository_id]
    if repository_id in repository_service.file_contents:
        del repository_service.file_contents[repository_id]
    return {"status": "success", "message": f"Purged all stored intelligence for {repository_id}"}
