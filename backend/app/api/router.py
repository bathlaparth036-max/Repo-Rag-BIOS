"""Central API router grouping all sub-modules."""
from fastapi import APIRouter
from app.api.repositories import router as repositories_router
from app.api.ingestion import router as ingestion_router
from app.api.chat import router as chat_router
from app.api.search import router as search_router
from app.api.health import router as health_router
from app.api.security import router as security_router
from app.api.voice import router as voice_router
from app.api.repair import router as repair_router

api_router = APIRouter(prefix="/api")
api_router.include_router(repositories_router)
api_router.include_router(ingestion_router)
api_router.include_router(chat_router)
api_router.include_router(search_router)
api_router.include_router(health_router)
api_router.include_router(security_router)
api_router.include_router(voice_router)
api_router.include_router(repair_router)

