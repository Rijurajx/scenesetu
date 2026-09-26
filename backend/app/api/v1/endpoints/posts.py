import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.entities import PlatformPost, Asset
from app.schemas.post import (
    PlatformPostResponse, RefinePostRequest, UpdatePostRequest,
    RegenerateTextRequest, RegenerateImageRequest
)
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

@router.patch("/posts/{post_id}", response_model=PlatformPostResponse)
async def update_post_content(
    post_id: str,
    payload: UpdatePostRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Direct manual editing by human operator.
    Persists edits, re-evaluates validation rules, and saves to database.
    """
    try:
        updated = await GenerationOrchestrator.update_single_post(
            db=db,
            post_id=post_id,
            title=payload.title,
            copy_primary=payload.copy_primary,
            copy_secondary=payload.copy_secondary,
            hashtags=payload.hashtags,
            cta=payload.cta
        )
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update post: {str(e)}")

@router.post("/posts/{post_id}/regenerate-text", response_model=PlatformPostResponse)
async def regenerate_post_text(
    post_id: str,
    payload: Optional[RegenerateTextRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerates only the text/copy of a single post while keeping the visual asset.
    """
    try:
        updated = await GenerationOrchestrator.regenerate_post_text(
            db=db,
            post_id=post_id,
            instruction=payload.instruction if payload else None,
            max_words=payload.max_words if payload else None,
            max_characters=payload.max_characters if payload else None
        )
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate post copy: {str(e)}")

@router.post("/posts/{post_id}/regenerate-image", response_model=PlatformPostResponse)
async def regenerate_post_image(
    post_id: str,
    payload: Optional[RegenerateImageRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerates only the visual asset for a single post using Pixazo/Flux Schnell.
    """
    try:
        updated = await GenerationOrchestrator.regenerate_post_image(
            db=db,
            post_id=post_id,
            prompt=payload.prompt if payload else None,
            aspect_ratio=payload.aspect_ratio if payload else None
        )
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to regenerate visual asset: {str(e)}")

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

@router.post("/posts/{post_id}/upload-asset", response_model=PlatformPostResponse)
async def upload_post_asset(
    post_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Replaces the visual asset with a user's uploaded custom image.
    Stores to Supabase Storage, creates an Asset record, links to the post, and re-validates.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
        updated = await GenerationOrchestrator.upload_post_asset(
            db=db,
            post_id=post_id,
            file_name=file.filename or "uploaded_artwork.jpg",
            file_bytes=content,
            mime_type=file.content_type or "image/jpeg"
        )
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload asset: {str(e)}")

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes a single post and its attached validation results, approvals, schedules, and metrics.
    """
    stmt = (
        select(PlatformPost)
        .where(PlatformPost.id == post_id)
        .options(
            selectinload(PlatformPost.validation_results),
            selectinload(PlatformPost.approvals),
            selectinload(PlatformPost.schedule),
            selectinload(PlatformPost.publication),
            selectinload(PlatformPost.metrics)
        )
    )
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail=f"Post with ID {post_id} not found.")

    for v in post.validation_results:
        await db.delete(v)
    for a in post.approvals:
        await db.delete(a)
    for m in post.metrics:
        await db.delete(m)
    if post.schedule:
        await db.delete(post.schedule)
    if post.publication:
        await db.delete(post.publication)

    await db.delete(post)
    await db.commit()
    return {"status": "success", "message": f"Post {post_id} deleted successfully.", "deleted_post_id": post_id}

@router.api_route("/assets/media/{file_name}", methods=["GET", "HEAD"])
async def serve_media(file_name: str):
    """Serves generated visual assets directly for frontend preview."""
    local_path = os.path.join("storage/media", file_name)
    if not os.path.exists(local_path):
        raise HTTPException(status_code=404, detail="Media asset file not found")
    return FileResponse(local_path)
