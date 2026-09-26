from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, campaigns, posts, workflow, analytics, generations
)

api_router = APIRouter()

# Health checks
api_router.include_router(health.router)

# Core domain routers
api_router.include_router(campaigns.router)
api_router.include_router(generations.router)
api_router.include_router(posts.router)
api_router.include_router(workflow.router)
api_router.include_router(analytics.router)
