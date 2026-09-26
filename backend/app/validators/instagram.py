from typing import List, Optional
from app.models.enums import ValidationStatus
from app.validators.common import PlatformValidationOutput, ValidationCheckItem, build_check

class InstagramValidator:
    ALLOWED_ASPECT_RATIOS = ["1:1", "4:5", "9:16"]
    MAX_CAPTION_LENGTH = 2200
    MIN_CAPTION_LENGTH = 5
    MAX_HASHTAGS = 30
    MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024 # 10MB

    @classmethod
    def validate(
        cls,
        copy_primary: str,
        hashtags: List[str],
        cta: str,
        asset_aspect_ratio: Optional[str] = None,
        asset_file_size: Optional[int] = None,
        asset_mime_type: Optional[str] = None,
    ) -> PlatformValidationOutput:
        checks: List[ValidationCheckItem] = []
        errors: List[str] = []

        # 1. Caption length
        cap_len = len(copy_primary or "")
        cap_passed = cls.MIN_CAPTION_LENGTH <= cap_len <= cls.MAX_CAPTION_LENGTH
        msg = f"Instagram caption length is {cap_len} chars."
        if not cap_passed:
            err = f"Caption length {cap_len} out of allowed bounds [{cls.MIN_CAPTION_LENGTH}, {cls.MAX_CAPTION_LENGTH}]."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("caption_length", cap_passed, msg, f"{cls.MIN_CAPTION_LENGTH}-{cls.MAX_CAPTION_LENGTH}", cap_len))

        # 2. Hashtags
        tag_count = len(hashtags or [])
        tag_passed = tag_count <= cls.MAX_HASHTAGS
        msg = f"Instagram hashtags count is {tag_count}."
        if not tag_passed:
            err = f"Too many hashtags ({tag_count}). Maximum allowed is {cls.MAX_HASHTAGS}."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("hashtag_count", tag_passed, msg, f"<= {cls.MAX_HASHTAGS}", tag_count))

        # 3. Call to Action presence
        cta_passed = bool(cta and len(cta.strip()) > 0)
        msg = "Call to action is present." if cta_passed else "Call to action is missing."
        if not cta_passed:
            errors.append("Instagram post requires an explicit CTA.")
        checks.append(build_check("cta_presence", cta_passed, msg, "Non-empty string", cta or ""))

        # 4. Aspect ratio (if asset present)
        if asset_aspect_ratio:
            ar_passed = asset_aspect_ratio in cls.ALLOWED_ASPECT_RATIOS
            msg = f"Asset aspect ratio is {asset_aspect_ratio}."
            if not ar_passed:
                err = f"Aspect ratio {asset_aspect_ratio} invalid for Instagram. Allowed: {cls.ALLOWED_ASPECT_RATIOS}."
                errors.append(err)
                msg += f" {err}"
            checks.append(build_check("aspect_ratio", ar_passed, msg, cls.ALLOWED_ASPECT_RATIOS, asset_aspect_ratio))

        # 5. File size (if asset present)
        if asset_file_size:
            size_passed = asset_file_size <= cls.MAX_IMAGE_FILE_SIZE_BYTES
            msg = f"Asset file size is {asset_file_size} bytes."
            if not size_passed:
                err = f"File size exceeds Instagram max of {cls.MAX_IMAGE_FILE_SIZE_BYTES} bytes."
                errors.append(err)
                msg += f" {err}"
            checks.append(build_check("file_size", size_passed, msg, f"<= {cls.MAX_IMAGE_FILE_SIZE_BYTES}", asset_file_size))

        overall_status = ValidationStatus.FAILED if errors else ValidationStatus.PASSED
        return PlatformValidationOutput(
            status=overall_status,
            checks=checks,
            error_summary="; ".join(errors) if errors else ""
        )
