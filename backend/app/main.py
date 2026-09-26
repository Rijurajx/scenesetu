import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.session import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    os.makedirs("storage/media", exist_ok=True)
    await init_db()
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}")

app = FastAPI(
    title="SceneSetu API",
    description="AI-Native Content Operations & Intelligence Platform (hoichoi Hackathon'26 - Problem 3)",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning(f"Validation error on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": "BadRequest", "detail": str(exc)}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "InternalServerError", "detail": "An unexpected error occurred. Please consult backend logs."}
    )

# Root convenience endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "SceneSetu AI Content Operations API is active.",
        "documentation": "/docs",
        "health": "/api/v1/health",
        "ready": "/api/v1/ready"
    }

# Include API Router
app.include_router(api_router, prefix="/api/v1")
