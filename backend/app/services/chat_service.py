"""Chat service executing hybrid retrieval and grounded response synthesis."""
from typing import Dict, Any, Optional
from app.services.repository_service import repository_service
from app.rag.retriever import HybridRetriever
from app.rag.answer_generator import AnswerGenerator, GroundedAnswer


class ChatService:
    def __init__(self):
        self.retriever = HybridRetriever()
        self.generator = AnswerGenerator()

    async def answer_question(self, repository_id: str, query: str) -> GroundedAnswer:
        repo = repository_service.repositories.get(repository_id)
        if not repo:
            return GroundedAnswer(
                query=query,
                answer=f"Repository '{repository_id}' is not loaded or indexed.",
                confidence=0.0
            )

        chunks = repository_service.all_chunks.get(repository_id, [])
        retrieved = await self.retriever.retrieve(repository_id, query, chunks, top_k=6)

        repo_meta = {
            "repository_name": repo.repository_name,
            "full_name": repo.full_name,
            "owner": repo.owner
        }

        return await self.generator.generate_answer(query, retrieved, repo_meta)


chat_service = ChatService()
