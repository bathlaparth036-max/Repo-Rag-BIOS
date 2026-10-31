"""Hybrid retriever combining Semantic, Keyword (BM25), Symbol, and Path search."""
import math
import re
from typing import List, Dict, Tuple, Set
from app.rag.chunker import CodeChunk
from app.rag.embeddings import EmbeddingProvider, get_embedding_provider
from app.rag.vector_store import vector_store


class HybridRetriever:
    def __init__(self, embedding_provider: EmbeddingProvider = None):
        self.embedding_provider = embedding_provider or get_embedding_provider()

    async def retrieve(
        self,
        repository_id: str,
        query: str,
        all_chunks: List[CodeChunk],
        top_k: int = 8
    ) -> List[Tuple[CodeChunk, float, Dict[str, float]]]:
        """
        Executes 4-way hybrid retrieval:
        1. Semantic Search (Dense vector cosine similarity)
        2. Keyword Search (BM25 / token overlap)
        3. Symbol Search (Exact & fuzzy AST symbol match)
        4. Path Search (Filename and path match)
        """
        if not all_chunks:
            return []

        q_clean = query.lower()
        q_tokens = set(re.findall(r"\w+", q_clean))

        # 1. Semantic search
        q_emb = await self.embedding_provider.embed_query(query)
        semantic_results = {chunk.chunk_id: score for chunk, score in vector_store.search(repository_id, q_emb, top_k=top_k * 3)}

        # 2. Keyword score
        keyword_scores: Dict[str, float] = {}
        for chunk in all_chunks:
            chunk_tokens = set(re.findall(r"\w+", chunk.content.lower()))
            overlap = len(q_tokens.intersection(chunk_tokens))
            keyword_scores[chunk.chunk_id] = overlap / max(1, len(q_tokens))

        # 3. Symbol score
        symbol_scores: Dict[str, float] = {}
        for chunk in all_chunks:
            score = 0.0
            if chunk.symbol:
                sym_clean = chunk.symbol.lower()
                if sym_clean in q_clean or any(t in sym_clean for t in q_tokens if len(t) > 2):
                    score = 1.0
            symbol_scores[chunk.chunk_id] = score

        # 4. Path score
        path_scores: Dict[str, float] = {}
        for chunk in all_chunks:
            p_clean = chunk.file_path.lower()
            p_score = 0.0
            for t in q_tokens:
                if len(t) > 2 and t in p_clean:
                    p_score += 0.5
            path_scores[chunk.chunk_id] = min(1.0, p_score)

        # Merge and calculate reciprocal rank fusion / weighted combination
        combined: List[Tuple[CodeChunk, float, Dict[str, float]]] = []
        for chunk in all_chunks:
            cid = chunk.chunk_id
            s_score = semantic_results.get(cid, 0.0)
            k_score = keyword_scores.get(cid, 0.0)
            sym_score = symbol_scores.get(cid, 0.0)
            p_score = path_scores.get(cid, 0.0)

            # Combined weighted score (Semantic 40%, Keyword 25%, Symbol 20%, Path 15%)
            final_score = (
                (0.40 * s_score) +
                (0.25 * k_score) +
                (0.20 * sym_score) +
                (0.15 * p_score)
            )

            if final_score > 0.05:
                breakdown = {
                    "semantic": round(s_score, 3),
                    "keyword": round(k_score, 3),
                    "symbol": round(sym_score, 3),
                    "path": round(p_score, 3),
                }
                combined.append((chunk, final_score, breakdown))

        combined.sort(key=lambda x: x[1], reverse=True)
        return combined[:top_k]
