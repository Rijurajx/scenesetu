import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.entities import PlatformPost, Asset
from app.schemas.post import PlatformPostResponse, RefinePostRequest
from app.services.orchestrator import GenerationOrchestrator

router = APIRouter(tags=["Platform Posts & Content Refinement"])

@router.get("/posts/{post_id}", response_model=PlatformPostResponse)
async def get_post(
    post_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Fetches a single platform post with full relations (asset, validation, approvals, schedule, publication)."""
    stmt = (
        select(PlatformPost)
        .where(PlatformPost.id == post_id)
        .options(
            selectinload(PlatformPost.asset),
            selectinload(PlatformPost.validation_results),
            selectinload(PlatformPost.approvals),
            selectinload(PlatformPost.schedule),
            selectinload(PlatformPost.publication)
        )
    )
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Platform post not found")
    return post

@router.post("/posts/{post_id}/refine", response_model=PlatformPostResponse)
async def refine_post(
    post_id: str,
    payload: RefinePostRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    DISCARD & RETRY / REFINEMENT LOOP (Phase 10):
    Allows human to reject/discard and provide instructions.
    Regenerates copy/visual, re-validates, and preserves iteration lineage.
    """
    try:
        refined = await GenerationOrchestrator.refine_single_post(
            db=db,
            post_id=post_id,
            refinement_instruction=payload.refinement_instruction
        )
        return refined
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refinement error: {str(e)}")

@router.api_route("/assets/media/{file_name}", methods=["GET", "HEAD"])
async def serve_media(file_name: str):
    """Serves generated visual assets directly for frontend preview."""
    local_path = os.path.join("storage/media", file_name)
    if not os.path.exists(local_path):
        raise HTTPException(status_code=404, detail="Media asset file not found")
    return FileResponse(local_path)
