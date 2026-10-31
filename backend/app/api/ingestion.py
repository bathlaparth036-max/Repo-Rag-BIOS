"""Asynchronous ingestion job dispatching and progress status tracking."""
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.repository_service import repository_service


router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


class AnalyzeRequest(BaseModel):
    url: str
    token: str | None = None


class AnalyzeResponse(BaseModel):
    job_id: str
    repository_id: str
    message: str


@router.post("/analyze", response_model=AnalyzeResponse)
async def start_analysis(req: AnalyzeRequest):
    job_id = str(uuid.uuid4())[:8]
    try:
        repo_id = await repository_service.start_analysis_job(req.url, job_id, req.token)
        return AnalyzeResponse(
            job_id=job_id,
            repository_id=repo_id,
            message="Analysis queued. Track progress via status endpoint."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    progress = repository_service.job_progress.get(job_id)
    if not progress:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return progress
