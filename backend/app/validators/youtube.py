from typing import List, Optional
from app.models.enums import ValidationStatus
from app.validators.common import PlatformValidationOutput, ValidationCheckItem, build_check

class YouTubeValidator:
    ALLOWED_ASPECT_RATIOS = ["16:9", "9:16"]
    MAX_TITLE_LENGTH = 100
    MIN_TITLE_LENGTH = 3
    MAX_DESCRIPTION_LENGTH = 5000
    MAX_HASHTAGS = 15
    MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024 # 5MB

    @classmethod
    def validate(
        cls,
        title: Optional[str],
        copy_primary: str,
        hashtags: List[str],
        cta: str,
        asset_aspect_ratio: Optional[str] = None,
        asset_file_size: Optional[int] = None,
        asset_mime_type: Optional[str] = None,
    ) -> PlatformValidationOutput:
        checks: List[ValidationCheckItem] = []
        errors: List[str] = []

        # 1. YouTube requires a Title
        title_len = len(title or "")
        title_passed = cls.MIN_TITLE_LENGTH <= title_len <= cls.MAX_TITLE_LENGTH
        msg = f"YouTube title length is {title_len} chars."
        if not title_passed:
            err = f"YouTube title length {title_len} out of allowed bounds [{cls.MIN_TITLE_LENGTH}, {cls.MAX_TITLE_LENGTH}]."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("title_length", title_passed, msg, f"{cls.MIN_TITLE_LENGTH}-{cls.MAX_TITLE_LENGTH}", title_len))

        # 2. Description / Body length
        desc_len = len(copy_primary or "")
        desc_passed = 1 <= desc_len <= cls.MAX_DESCRIPTION_LENGTH
        msg = f"YouTube description length is {desc_len} chars."
        if not desc_passed:
            err = f"YouTube description exceeds {cls.MAX_DESCRIPTION_LENGTH} chars."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("description_length", desc_passed, msg, f"<= {cls.MAX_DESCRIPTION_LENGTH}", desc_len))

        # 3. Hashtags
        tag_count = len(hashtags or [])
        tag_passed = tag_count <= cls.MAX_HASHTAGS
        msg = f"YouTube hashtag count is {tag_count}."
        if not tag_passed:
            err = f"YouTube hashtag count exceeds {cls.MAX_HASHTAGS}."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("hashtag_count", tag_passed, msg, f"<= {cls.MAX_HASHTAGS}", tag_count))

        # 4. Aspect ratio (YouTube community / video requires 16:9 or 9:16 shorts)
        if asset_aspect_ratio:
            ar_passed = asset_aspect_ratio in cls.ALLOWED_ASPECT_RATIOS
            msg = f"Asset aspect ratio is {asset_aspect_ratio}."
            if not ar_passed:
                err = f"Aspect ratio {asset_aspect_ratio} invalid for YouTube. Allowed: {cls.ALLOWED_ASPECT_RATIOS}."
                errors.append(err)
                msg += f" {err}"
            checks.append(build_check("aspect_ratio", ar_passed, msg, cls.ALLOWED_ASPECT_RATIOS, asset_aspect_ratio))

        # 5. File size
        if asset_file_size:
            size_passed = asset_file_size <= cls.MAX_THUMBNAIL_SIZE_BYTES
            msg = f"Asset file size is {asset_file_size} bytes."
            if not size_passed:
                err = f"File size exceeds YouTube thumbnail max of {cls.MAX_THUMBNAIL_SIZE_BYTES} bytes."
                errors.append(err)
                msg += f" {err}"
            checks.append(build_check("file_size", size_passed, msg, f"<= {cls.MAX_THUMBNAIL_SIZE_BYTES}", asset_file_size))

        overall_status = ValidationStatus.FAILED if errors else ValidationStatus.PASSED
        return PlatformValidationOutput(
            status=overall_status,
            checks=checks,
            error_summary="; ".join(errors) if errors else ""
        )
