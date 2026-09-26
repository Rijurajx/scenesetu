from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class AdapterCreate(BaseModel):
    platform: str = Field(..., description="Platform identifier: instagram, youtube, x_twitter, webhook")
    adapter_name: str = Field(..., min_length=2, max_length=255, description="Human friendly name for this adapter")
    config_type: str = Field(default="api_keys", description="Type: api_keys, webhook, oauth")
    is_active: bool = Field(default=True, description="Whether this adapter is active")
    
    # Credentials & Config
    api_key: Optional[str] = Field(None, description="API Key or Consumer Key")
    api_secret: Optional[str] = Field(None, description="API Secret or Consumer Secret")
    access_token: Optional[str] = Field(None, description="Bearer Token or OAuth Access Token")
    access_token_secret: Optional[str] = Field(None, description="OAuth Access Token Secret")
    account_id: Optional[str] = Field(None, description="Account ID / Page ID / Channel ID")
    webhook_url: Optional[str] = Field(None, description="Live Webhook Endpoint URL (Zapier, Buffer, Discord, n8n)")
    custom_headers: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom HTTP headers to include with webhook requests")

class AdapterUpdate(BaseModel):
    adapter_name: Optional[str] = None
    is_active: Optional[bool] = None
    config_type: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    access_token_secret: Optional[str] = None
    account_id: Optional[str] = None
    webhook_url: Optional[str] = None
    custom_headers: Optional[Dict[str, Any]] = None

class AdapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    platform: str
    adapter_name: str
    is_active: bool
    config_type: str
    account_id: Optional[str] = None
    webhook_url: Optional[str] = None
    has_api_key: bool = False
    has_access_token: bool = False
    last_status: str
    last_tested_at: Optional[datetime] = None
    last_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AdapterTestResponse(BaseModel):
    success: bool
    message: str
    platform: str
    status_code: Optional[int] = None
    latency_ms: Optional[float] = None
    details: Optional[Dict[str, Any]] = None
