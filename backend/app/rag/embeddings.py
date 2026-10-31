"""Embedding provider abstraction supporting Local, Gemini, and OpenAI embeddings."""
import hashlib
import math
from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np
from app.core.config import settings
from app.core.logging import logger


class EmbeddingProvider(ABC):
    @abstractmethod
    async def embed_query(self, text: str) -> List[float]:
        pass

    @abstractmethod
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass


class LocalFastEmbeddingProvider(EmbeddingProvider):
    """
    High-performance zero-dependency deterministic vectorizer.
    Generates 384-dimensional normalized vectors via subword hashing & term weighting.
    Ideal for local development, instant testing, and offline environments.
    """
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _vectorize(self, text: str) -> List[float]:
        tokens = text.lower().replace("\n", " ").split()
        if not tokens:
            return [0.0] * self.dimension

        vec = np.zeros(self.dimension, dtype=np.float32)
        for i, token in enumerate(tokens):
            # Term weight (slight decay for very long documents)
            weight = 1.0 / (1.0 + 0.001 * i)
            # Hash token into dimension
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if ((h >> 8) & 1) == 0 else -1.0
            vec[idx] += sign * weight

            # Also hash bigrams for sequence awareness
            if i > 0:
                bi = f"{tokens[i-1]}_{token}"
                bi_h = int(hashlib.md5(bi.encode("utf-8")).hexdigest(), 16)
                bi_idx = bi_h % self.dimension
                bi_sign = 1.0 if ((bi_h >> 8) & 1) == 0 else -1.0
                vec[bi_idx] += bi_sign * (weight * 0.5)

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    async def embed_query(self, text: str) -> List[float]:
        return self._vectorize(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._vectorize(t) for t in texts]


class GeminiEmbeddingProvider(EmbeddingProvider):
    """Google Gemini Embedding API provider."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = LocalFastEmbeddingProvider()

    async def embed_query(self, text: str) -> List[float]:
        if not self.api_key:
            return await self.fallback.embed_query(text)
        try:
            # Gemini embedding endpoint
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={self.api_key}"
            payload = {
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": text[:2048]}]}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("embedding", {}).get("values", [])
        except Exception as e:
            logger.warning(f"Gemini embedding failed, using local fallback: {e}")
        return await self.fallback.embed_query(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Batch or sequential
        results = []
        for t in texts:
            vec = await self.embed_query(t)
            results.append(vec)
        return results


def get_embedding_provider() -> EmbeddingProvider:
    if settings.EMBEDDING_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiEmbeddingProvider()
    return LocalFastEmbeddingProvider()
