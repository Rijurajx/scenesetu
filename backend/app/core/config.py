import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Application
    APP_NAME: str = "SceneSetu Backend"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./scenesetu.db"

    # Supabase Storage & Service API
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "scenesetu-assets"

    # AI Providers
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    PIXAZO_API_KEY: str = ""
    PIXAZO_BASE_URL: str = "https://gateway.pixazo.ai"
    PIXAZO_IMAGE_MODEL: str = "flux-1-schnell"
    PIXAZO_IMAGE_ENDPOINT: str = "https://gateway.pixazo.ai/flux-1-schnell/v1/getData"
    PIXAZO_STATUS_ENDPOINT: str = "https://gateway.pixazo.ai/flux-1-schnell/v1/checkStatus"
    PIXAZO_VIDEO_ENDPOINT: str = "https://gateway.pixazo.ai/ltx-2-5-lite/v1/text-to-video"
    PIXAZO_IMAGE_TO_VIDEO_ENDPOINT: str = "https://gateway.pixazo.ai/ltx-2-5-lite/v1/image-to-video"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v


settings = Settings()
