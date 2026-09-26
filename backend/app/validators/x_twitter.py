from typing import List, Optional
from app.models.enums import ValidationStatus
from app.validators.common import PlatformValidationOutput, ValidationCheckItem, build_check

class XTwitterValidator:
    ALLOWED_ASPECT_RATIOS = ["16:9", "1:1", "4:5"]
    MAX_TWEET_LENGTH = 280
    MIN_TWEET_LENGTH = 5
    MAX_HASHTAGS = 4
    MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024 # 5MB

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

        # 1. Tweet length (Including hashtags and CTA)
        tag_str = " ".join([f"#{t.strip('#')}" for t in (hashtags or [])])
        full_text = f"{copy_primary or ''}\n\n{cta or ''}\n{tag_str}".strip()
        text_len = len(full_text)
        
        # Primary copy alone shouldn't exceed 280 chars
        len_passed = cls.MIN_TWEET_LENGTH <= text_len <= cls.MAX_TWEET_LENGTH
        msg = f"X/Twitter full post text is {text_len} chars (limit {cls.MAX_TWEET_LENGTH})."
        if not len_passed:
            err = f"Total post length {text_len} exceeds X's strict 280 character limit."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("character_limit_280", len_passed, msg, f"<={cls.MAX_TWEET_LENGTH}", text_len))

        # 2. Hashtags count
        tag_count = len(hashtags or [])
        tag_passed = tag_count <= cls.MAX_HASHTAGS
        msg = f"X/Twitter hashtag count is {tag_count}."
        if not tag_passed:
            err = f"Hashtag count {tag_count} exceeds X recommendation of max {cls.MAX_HASHTAGS} tags."
            errors.append(err)
            msg += f" {err}"
        checks.append(build_check("hashtag_count", tag_passed, msg, f"<= {cls.MAX_HASHTAGS}", tag_count))

        # 3. Call to Action presence
        cta_passed = bool(cta and len(cta.strip()) > 0)
        msg = "Call to action is present." if cta_passed else "Call to action is missing."
        if not cta_passed:
            errors.append("X/Twitter post requires a concise CTA.")
        checks.append(build_check("cta_presence", cta_passed, msg, "Non-empty string", cta or ""))

        # 4. Aspect ratio (16:9 or 1:1)
        if asset_aspect_ratio:
            ar_passed = asset_aspect_ratio in cls.ALLOWED_ASPECT_RATIOS
            msg = f"Asset aspect ratio is {asset_aspect_ratio}."
            if not ar_passed:
                err = f"Aspect ratio {asset_aspect_ratio} invalid for X. Allowed: {cls.ALLOWED_ASPECT_RATIOS}."
                errors.append(err)
                msg += f" {err}"
            checks.append(build_check("aspect_ratio", ar_passed, msg, cls.ALLOWED_ASPECT_RATIOS, asset_aspect_ratio))

        # 5. File size
        if asset_file_size:
            size_passed = asset_file_size <= cls.MAX_IMAGE_FILE_SIZE_BYTES
            msg = f"Asset file size is {asset_file_size} bytes."
            if not size_passed:
                err = f"File size exceeds X max of {cls.MAX_IMAGE_FILE_SIZE_BYTES} bytes."
                errors.append(err)
                msg += f" {err}"
            checks.append(build_check("file_size", size_passed, msg, f"<= {cls.MAX_IMAGE_FILE_SIZE_BYTES}", asset_file_size))

        overall_status = ValidationStatus.FAILED if errors else ValidationStatus.PASSED
        return PlatformValidationOutput(
            status=overall_status,
            checks=checks,
            error_summary="; ".join(errors) if errors else ""
        )
