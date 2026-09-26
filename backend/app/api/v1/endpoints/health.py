from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Liveness probe: verifies application process is running."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }

@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness probe: verifies database connectivity and core configurations."""
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {e}"

    gemini_ready = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key")
    pixazo_ready = bool(settings.PIXAZO_API_KEY and settings.PIXAZO_API_KEY != "your-pixazo-api-key")

    return {
        "status": "ready" if db_status == "connected" else "degraded",
        "database": db_status,
        "providers": {
            "gemini_api_configured": gemini_ready,
            "gemini_model": settings.GEMINI_MODEL,
            "pixazo_api_configured": pixazo_ready,
            "pixazo_model": settings.PIXAZO_IMAGE_MODEL
        }
    }
