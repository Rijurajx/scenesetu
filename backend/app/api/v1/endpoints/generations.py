import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db, AsyncSessionLocal
from app.models.entities import GenerationRun, PlatformPost

router = APIRouter(prefix="/generations", tags=["Generation Runs & Realtime SSE"])

@router.get("/{generation_id}")
async def get_generation_run(
    generation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Inspects a generation run, its strategy payload, and all resulting platform posts."""
    stmt = (
        select(GenerationRun)
        .where(GenerationRun.id == generation_id)
        .options(
            selectinload(GenerationRun.posts).selectinload(PlatformPost.asset),
            selectinload(GenerationRun.posts).selectinload(PlatformPost.validation_results),
            selectinload(GenerationRun.assets)
        )
    )
    res = await db.execute(stmt)
    run = res.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Generation run not found")

    return {
        "id": run.id,
        "campaign_id": run.campaign_id,
        "run_number": run.run_number,
        "status": run.status,
        "strategy_payload": run.strategy_payload,
        "error_message": run.error_message,
        "created_at": run.created_at,
        "completed_at": run.completed_at,
        "posts": run.posts,
        "assets": run.assets
    }

@router.get("/{generation_id}/stream")
async def stream_generation_progress(
    generation_id: str,
    request: Request
):
    """
    REALTIME SSE GENERATION (Phase 24):
    Streams live generation events to the frontend:
    generation_started -> strategy_generated -> visual_started -> asset_ready -> validation_done -> ready_for_review.
    """
    async def event_generator():
        # Poll state changes cleanly with small sleep
        last_status = None
        for _ in range(60): # Max 60 seconds
            if await request.is_disconnected():
                break

            async with AsyncSessionLocal() as session:
                stmt = (
                    select(GenerationRun)
                    .where(GenerationRun.id == generation_id)
                    .options(
                        selectinload(GenerationRun.posts).selectinload(PlatformPost.asset),
                        selectinload(GenerationRun.posts).selectinload(PlatformPost.validation_results)
                    )
                )
                res = await session.execute(stmt)
                run = res.scalar_one_or_none()
                if not run:
                    yield {
                        "event": "error",
                        "data": json.dumps({"error": "Generation run not found"})
                    }
                    break

                if run.status != last_status:
                    last_status = run.status
                    post_data = [
                        {
                            "id": p.id,
                            "platform": p.platform,
                            "status": p.status,
                            "has_asset": bool(p.asset_id),
                            "asset_url": p.asset.public_url if p.asset else None
                        }
                        for p in run.posts
                    ]

                    event_type = "progress_update"
                    if run.status == "generating":
                        event_type = "generation_started"
                    elif run.status == "validating":
                        event_type = "strategy_generated"
                    elif run.status in ("ready_for_review", "valid"):
                        event_type = "generation_completed"
                    elif run.status in ("failed", "invalid"):
                        event_type = "generation_failed"

                    yield {
                        "event": event_type,
                        "data": json.dumps({
                            "generation_id": run.id,
                            "status": run.status,
                            "posts_count": len(run.posts),
                            "posts": post_data,
                            "error": run.error_message
                        })
                    }

                if run.status in ("ready_for_review", "valid", "invalid", "failed"):
                    break

            await asyncio.sleep(1.0)

    return EventSourceResponse(event_generator())
