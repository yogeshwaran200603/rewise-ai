from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def check_health():
    ai_mode = "Gemini Live" if settings.GEMINI_API_KEY else "Deterministic Mock / Demo"
    return {
        "status": "healthy",
        "service": "ReWise AI Circular Electronics Engine",
        "version": "1.0.0",
        "ai_provider": ai_mode,
        "database": settings.DATABASE_URL.split("://")[0]
    }
