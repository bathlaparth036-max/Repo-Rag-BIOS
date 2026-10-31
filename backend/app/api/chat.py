"""RAG grounded chat API endpoint."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chat_service import chat_service
from app.rag.answer_generator import GroundedAnswer


router = APIRouter(prefix="/chat", tags=["Chat"])


class AskRequest(BaseModel):
    repository_id: str
    query: str


@router.post("/ask", response_model=GroundedAnswer)
async def ask_question(req: AskRequest):
    try:
        return await chat_service.answer_question(req.repository_id, req.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
