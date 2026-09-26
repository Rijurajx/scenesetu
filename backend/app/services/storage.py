import os
import httpx
from typing import Optional
from app.core.config import settings
from app.core.logging import logger

class MediaStorageService:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.service_key = settings.SUPABASE_SERVICE_KEY
        self.bucket = settings.SUPABASE_STORAGE_BUCKET
        self.local_dir = "storage/media"
        os.makedirs(self.local_dir, exist_ok=True)

    async def store_media(self, file_name: str, file_bytes: bytes, mime_type: str = "image/jpeg") -> tuple[str, str]:
        """
        Stores media either to Supabase Storage or local storage fallback.
        Returns: (storage_path, public_url)
        """
        # Local persist first
        local_path = os.path.join(self.local_dir, file_name)
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        # Check if Supabase credentials are valid
        if (
            self.supabase_url
            and self.service_key
            and not self.supabase_url.startswith("https://placeholder")
            and self.service_key != "placeholder-service-key"
        ):
            try:
                upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{file_name}"
                headers = {
                    "Authorization": f"Bearer {self.service_key}",
                    "Content-Type": mime_type
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(upload_url, content=file_bytes, headers=headers)
                    if resp.status_code in (200, 201):
                        public_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket}/{file_name}"
                        logger.info(f"Uploaded asset to Supabase Storage: {public_url}")
                        return (f"{self.bucket}/{file_name}", public_url)
                    else:
                        logger.warning(f"Supabase storage upload failed ({resp.status_code}): {resp.text}")
            except Exception as e:
                logger.error(f"Error uploading to Supabase Storage: {e}")

        # Fallback to local storage endpoint
        public_url = f"/api/v1/assets/media/{file_name}"
        return (local_path, public_url)

storage_service = MediaStorageService()
