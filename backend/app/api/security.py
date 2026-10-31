"""Security pattern scanner endpoint with explicit 'Potential issue' labelling."""
from fastapi import APIRouter, HTTPException
from app.services.repository_service import repository_service
from app.services.analysis_service import AnalysisService


router = APIRouter(prefix="/security", tags=["Security Scan"])


@router.get("/{repository_id}/scan")
async def scan_repository_security(repository_id: str):
    repo = repository_service.repositories.get(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    contents = repository_service.file_contents.get(repository_id, {})
    issues = AnalysisService.scan_security(repo.important_files, contents)

    return {
        "repository_id": repository_id,
        "total_issues": len(issues),
        "disclaimer": "All findings are static heuristic pattern matches and labeled as 'Potential issues', not confirmed vulnerabilities.",
        "findings": issues
    }
