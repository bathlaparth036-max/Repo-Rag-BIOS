"""Vector database abstraction with in-memory and extensible Chroma/pgvector backend."""
from typing import List, Dict, Any, Tuple
import numpy as np
from app.rag.chunker import CodeChunk
from app.core.logging import logger


class VectorStore:
    def __init__(self):
        # repository_id -> list of (chunk, vector)
        self.indices: Dict[str, List[Tuple[CodeChunk, np.ndarray]]] = {}

    def add_chunks(self, repository_id: str, chunks: List[CodeChunk], embeddings: List[List[float]]):
        if repository_id not in self.indices:
            self.indices[repository_id] = []
        
        for chunk, emb in zip(chunks, embeddings):
            vec = np.array(emb, dtype=np.float32)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            self.indices[repository_id].append((chunk, vec))

        logger.info(f"Indexed {len(chunks)} chunks into vector store for {repository_id}")

    def search(self, repository_id: str, query_embedding: List[float], top_k: int = 10) -> List[Tuple[CodeChunk, float]]:
        """Cosine similarity search."""
        if repository_id not in self.indices or not self.indices[repository_id]:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        scored_items = []
        for chunk, doc_vec in self.indices[repository_id]:
            # Dot product of normalized vectors = cosine similarity
            sim = float(np.dot(q_vec, doc_vec))
            scored_items.append((chunk, sim))

        scored_items.sort(key=lambda x: x[1], reverse=True)
        return scored_items[:top_k]

    def clear(self, repository_id: str):
        if repository_id in self.indices:
            del self.indices[repository_id]


# Global singleton vector store instance
vector_store = VectorStore()
