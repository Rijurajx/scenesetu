from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.entities import SocialAdapter, utcnow
from app.schemas.adapter import (
    AdapterCreate, AdapterUpdate, AdapterResponse, AdapterTestResponse
)
from app.services.social_connector import SocialConnectorService

router = APIRouter(prefix="/adapters", tags=["Social Channel Adapters"])

@router.get("", response_model=List[AdapterResponse])
async def list_adapters(db: AsyncSession = Depends(get_db)):
    """Lists all configured personal social adapters."""
    stmt = select(SocialAdapter).order_by(SocialAdapter.created_at.desc())
    res = await db.execute(stmt)
    adapters = res.scalars().all()
    
    result = []
    for a in adapters:
        result.append(
            AdapterResponse(
                id=a.id,
                platform=a.platform,
                adapter_name=a.adapter_name,
                is_active=a.is_active,
                config_type=a.config_type,
                account_id=a.account_id,
                webhook_url=a.webhook_url,
                has_api_key=bool(a.api_key),
                has_access_token=bool(a.access_token),
                last_status=a.last_status,
                last_tested_at=a.last_tested_at,
                last_error=a.last_error,
                created_at=a.created_at,
                updated_at=a.updated_at
            )
        )
    return result

@router.post("", response_model=AdapterResponse, status_code=status.HTTP_201_CREATED)
async def create_adapter(
    payload: AdapterCreate,
    db: AsyncSession = Depends(get_db)
):
    """Creates a new personal social adapter."""
    adapter = SocialAdapter(
        platform=payload.platform.lower().strip(),
        adapter_name=payload.adapter_name.strip(),
        is_active=payload.is_active,
        config_type=payload.config_type,
        api_key=payload.api_key,
        api_secret=payload.api_secret,
        access_token=payload.access_token,
        access_token_secret=payload.access_token_secret,
        account_id=payload.account_id,
        webhook_url=payload.webhook_url,
        custom_headers=payload.custom_headers or {},
        last_status="unverified"
    )
    db.add(adapter)
    await db.commit()
    await db.refresh(adapter)

    # Automatically test connection in background
    test_res = await SocialConnectorService.test_connection(adapter)
    adapter.last_status = "connected" if test_res.success else "error"
    adapter.last_tested_at = utcnow()
    adapter.last_error = None if test_res.success else test_res.message
    await db.commit()
    await db.refresh(adapter)

    return AdapterResponse(
        id=adapter.id,
        platform=adapter.platform,
        adapter_name=adapter.adapter_name,
        is_active=adapter.is_active,
        config_type=adapter.config_type,
        account_id=adapter.account_id,
        webhook_url=adapter.webhook_url,
        has_api_key=bool(adapter.api_key),
        has_access_token=bool(adapter.access_token),
        last_status=adapter.last_status,
        last_tested_at=adapter.last_tested_at,
        last_error=adapter.last_error,
        created_at=adapter.created_at,
        updated_at=adapter.updated_at
    )

@router.patch("/{adapter_id}", response_model=AdapterResponse)
async def update_adapter(
    adapter_id: str,
    payload: AdapterUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Updates an existing social adapter."""
    stmt = select(SocialAdapter).where(SocialAdapter.id == adapter_id)
    res = await db.execute(stmt)
    adapter = res.scalar_one_or_none()
    if not adapter:
        raise HTTPException(status_code=404, detail="Social adapter not found")

    if payload.adapter_name is not None:
        adapter.adapter_name = payload.adapter_name
    if payload.is_active is not None:
        adapter.is_active = payload.is_active
    if payload.config_type is not None:
        adapter.config_type = payload.config_type
    if payload.api_key is not None:
        adapter.api_key = payload.api_key
    if payload.api_secret is not None:
        adapter.api_secret = payload.api_secret
    if payload.access_token is not None:
        adapter.access_token = payload.access_token
    if payload.access_token_secret is not None:
        adapter.access_token_secret = payload.access_token_secret
    if payload.account_id is not None:
        adapter.account_id = payload.account_id
    if payload.webhook_url is not None:
        adapter.webhook_url = payload.webhook_url
    if payload.custom_headers is not None:
        adapter.custom_headers = payload.custom_headers

    adapter.updated_at = utcnow()
    await db.commit()
    await db.refresh(adapter)

    return AdapterResponse(
        id=adapter.id,
        platform=adapter.platform,
        adapter_name=adapter.adapter_name,
        is_active=adapter.is_active,
        config_type=adapter.config_type,
        account_id=adapter.account_id,
        webhook_url=adapter.webhook_url,
        has_api_key=bool(adapter.api_key),
        has_access_token=bool(adapter.access_token),
        last_status=adapter.last_status,
        last_tested_at=adapter.last_tested_at,
        last_error=adapter.last_error,
        created_at=adapter.created_at,
        updated_at=adapter.updated_at
    )

@router.delete("/{adapter_id}")
async def delete_adapter(
    adapter_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Deletes a personal social adapter."""
    stmt = select(SocialAdapter).where(SocialAdapter.id == adapter_id)
    res = await db.execute(stmt)
    adapter = res.scalar_one_or_none()
    if not adapter:
        raise HTTPException(status_code=404, detail="Social adapter not found")

    await db.delete(adapter)
    await db.commit()
    return {"status": "success", "message": f"Adapter '{adapter.adapter_name}' deleted successfully."}

@router.post("/{adapter_id}/test", response_model=AdapterTestResponse)
async def test_adapter(
    adapter_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Pings and verifies an existing social adapter."""
    stmt = select(SocialAdapter).where(SocialAdapter.id == adapter_id)
    res = await db.execute(stmt)
    adapter = res.scalar_one_or_none()
    if not adapter:
        raise HTTPException(status_code=404, detail="Social adapter not found")

    test_res = await SocialConnectorService.test_connection(adapter)
    adapter.last_status = "connected" if test_res.success else "error"
    adapter.last_tested_at = utcnow()
    adapter.last_error = None if test_res.success else test_res.message
    await db.commit()
    return test_res

@router.post("/test-draft", response_model=AdapterTestResponse)
async def test_draft_adapter(payload: AdapterCreate):
    """Pings and tests draft adapter credentials before saving."""
    dummy_adapter = SocialAdapter(
        platform=payload.platform.lower().strip(),
        adapter_name=payload.adapter_name.strip(),
        config_type=payload.config_type,
        api_key=payload.api_key,
        api_secret=payload.api_secret,
        access_token=payload.access_token,
        access_token_secret=payload.access_token_secret,
        account_id=payload.account_id,
        webhook_url=payload.webhook_url,
        custom_headers=payload.custom_headers or {}
    )
    return await SocialConnectorService.test_connection(dummy_adapter)
