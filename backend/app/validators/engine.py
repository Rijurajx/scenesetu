from typing import List, Optional
from app.models.enums import PlatformType
from app.validators.common import PlatformValidationOutput
from app.validators.instagram import InstagramValidator
from app.validators.youtube import YouTubeValidator
from app.validators.x_twitter import XTwitterValidator

class ValidationEngine:
    @classmethod
    def validate_post(
        cls,
        platform: str,
        copy_primary: str,
        cta: str,
        hashtags: List[str],
        title: Optional[str] = None,
        asset_aspect_ratio: Optional[str] = None,
        asset_file_size: Optional[int] = None,
        asset_mime_type: Optional[str] = None,
    ) -> PlatformValidationOutput:
        platform_normalized = platform.lower().strip()
        
        if platform_normalized == PlatformType.INSTAGRAM.value:
            return InstagramValidator.validate(
                copy_primary=copy_primary,
                hashtags=hashtags,
                cta=cta,
                asset_aspect_ratio=asset_aspect_ratio,
                asset_file_size=asset_file_size,
                asset_mime_type=asset_mime_type
            )
        elif platform_normalized == PlatformType.YOUTUBE.value:
            return YouTubeValidator.validate(
                title=title,
                copy_primary=copy_primary,
                hashtags=hashtags,
                cta=cta,
                asset_aspect_ratio=asset_aspect_ratio,
                asset_file_size=asset_file_size,
                asset_mime_type=asset_mime_type
            )
        elif platform_normalized in (PlatformType.X_TWITTER.value, "twitter", "x"):
            return XTwitterValidator.validate(
                copy_primary=copy_primary,
                hashtags=hashtags,
                cta=cta,
                asset_aspect_ratio=asset_aspect_ratio,
                asset_file_size=asset_file_size,
                asset_mime_type=asset_mime_type
            )
        else:
            raise ValueError(f"Unknown platform: {platform}")
