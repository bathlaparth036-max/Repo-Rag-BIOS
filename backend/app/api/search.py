"""Hybrid code and symbol search endpoint."""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.repository_service import repository_service
from app.rag.retriever import HybridRetriever


router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    repository_id: str
    query: str
    limit: Optional[int] = 10


@router.post("/hybrid")
async def search_hybrid(req: SearchRequest):
    chunks = repository_service.all_chunks.get(req.repository_id, [])
    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks indexed for this repository.")

    retriever = HybridRetriever()
    results = await retriever.retrieve(req.repository_id, req.query, chunks, top_k=req.limit)

    output = []
    for chunk, score, breakdown in results:
        output.append({
            "chunk_id": chunk.chunk_id,
            "file_path": chunk.file_path,
            "symbol": chunk.symbol,
            "start_line": chunk.start_line,
            "end_line": chunk.end_line,
            "snippet": chunk.content[:240],
            "score": round(score, 3),
            "breakdown": breakdown
        })
    return {"results": output, "total_matches": len(output)}
