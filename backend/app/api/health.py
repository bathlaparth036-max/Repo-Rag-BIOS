"""Codebase health telemetry, onboarding guide, and change impact endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.repository_service import repository_service
from app.services.analysis_service import AnalysisService, ChangeImpactResult


router = APIRouter(prefix="/health", tags=["Health & Architecture Intelligence"])


class ChangeImpactRequest(BaseModel):
    target_file: str


@router.get("/{repository_id}")
async def get_health_telemetry(repository_id: str):
    repo = repository_service.repositories.get(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")
    return repo.health


@router.get("/{repository_id}/onboarding")
async def get_onboarding_documentation(repository_id: str):
    repo = repository_service.repositories.get(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")
    return AnalysisService.generate_onboarding_guide(repo)


@router.post("/{repository_id}/change-impact", response_model=ChangeImpactResult)
async def check_change_impact(repository_id: str, req: ChangeImpactRequest):
    repo = repository_service.repositories.get(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")
    files = repo.important_files
    return AnalysisService.analyze_change_impact(req.target_file, files)
