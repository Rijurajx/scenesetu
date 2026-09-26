from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.post import (
    ApprovalActionRequest, PlatformPostResponse, ScheduleRequest, ScheduleResponse, PublicationResponse
)
from app.services.publisher import PublishingWorkflowService

router = APIRouter(tags=["Approval, Scheduling & Mock Publishing"])

@router.post("/posts/{post_id}/approve", response_model=PlatformPostResponse)
async def approve_post(
    post_id: str,
    payload: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    HUMAN APPROVAL GATE (Phase 9):
    Moves post from PENDING_REVIEW -> APPROVED.
    Content cannot be scheduled or published without passing this gate!
    """
    try:
        post = await PublishingWorkflowService.approve_post(
            db=db,
            post_id=post_id,
            reviewer_name=payload.reviewer_name,
            feedback=payload.feedback
        )
        return post
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval error: {str(e)}")

@router.post("/posts/{post_id}/reject", response_model=PlatformPostResponse)
async def reject_post(
    post_id: str,
    payload: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Human Rejection:
    Marks post as REJECTED, qualifying it for refinement/regeneration.
    """
    try:
        post = await PublishingWorkflowService.reject_post(
            db=db,
            post_id=post_id,
            reviewer_name=payload.reviewer_name,
            feedback=payload.feedback
        )
        return post
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection error: {str(e)}")

@router.post("/posts/{post_id}/schedule", response_model=ScheduleResponse)
async def schedule_post(
    post_id: str,
    payload: ScheduleRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    SCHEDULING (Phase 13):
    Strict rule: Only APPROVED posts can be scheduled.
    """
    try:
        schedule = await PublishingWorkflowService.schedule_post(
            db=db,
            post_id=post_id,
            scheduled_time=payload.scheduled_time
        )
        return schedule
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling error: {str(e)}")

@router.post("/posts/{post_id}/publish", response_model=PublicationResponse)
async def publish_post(
    post_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    MOCK PUBLISHING (Phase 12):
    Dispatches post to mock channel adapter (Instagram, YouTube, X).
    Strict rule: Post must be APPROVED or SCHEDULED.
    """
    try:
        publication = await PublishingWorkflowService.publish_post(
            db=db,
            post_id=post_id
        )
        return publication
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Publishing error: {str(e)}")
