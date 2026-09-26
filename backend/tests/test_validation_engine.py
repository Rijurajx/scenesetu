import pytest
from app.validators.engine import ValidationEngine
from app.models.enums import ValidationStatus

def test_instagram_validation_success():
    out = ValidationEngine.validate_post(
        platform="instagram",
        copy_primary="রহস্য যেখানে শেষ হয়, সেখান থেকেই আসল গল্পের শুরু... 🌧️",
        cta="এখনই অ্যাপে দেখুন!",
        hashtags=["hoichoi", "BanglaThriller", "Originals"],
        asset_aspect_ratio="1:1",
        asset_file_size=1024 * 500
    )
    assert out.status == ValidationStatus.PASSED
    assert len(out.checks) >= 4
    assert out.error_summary == ""

def test_instagram_validation_invalid_aspect_ratio():
    out = ValidationEngine.validate_post(
        platform="instagram",
        copy_primary="Great new series streaming now on hoichoi.",
        cta="Watch now!",
        hashtags=["hoichoi"],
        asset_aspect_ratio="21:9" # Invalid for IG
    )
    assert out.status == ValidationStatus.FAILED
    assert "Aspect ratio" in out.error_summary

def test_youtube_validation_requires_title():
    # Missing title should fail
    out = ValidationEngine.validate_post(
        platform="youtube",
        title=None,
        copy_primary="Watch the teaser now on our channel!",
        cta="Subscribe today!",
        hashtags=["hoichoi", "Teaser"]
    )
    assert out.status == ValidationStatus.FAILED
    assert "title length" in out.error_summary.lower()

def test_youtube_validation_success():
    out = ValidationEngine.validate_post(
        platform="youtube",
        title="অরণ্যের প্রাচীন প্রবাদ | Official Teaser | hoichoi Originals",
        copy_primary="এক শতাব্দী প্রাচীন ডায়েরি আর রহস্যময় এক অতীত।",
        cta="সাবস্ক্রাইব করুন এবং পুরো ভিডিওটি দেখুন!",
        hashtags=["hoichoi", "BanglaCinema"],
        asset_aspect_ratio="16:9"
    )
    assert out.status == ValidationStatus.PASSED

def test_x_twitter_strict_280_character_limit_fails_when_exceeded():
    # 300 character long copy
    long_copy = "আ" * 300
    out = ValidationEngine.validate_post(
        platform="x_twitter",
        copy_primary=long_copy,
        cta="Comment below!",
        hashtags=["hoichoi"],
        asset_aspect_ratio="16:9"
    )
    assert out.status == ValidationStatus.FAILED
    assert "280" in out.error_summary

def test_x_twitter_validation_success():
    out = ValidationEngine.validate_post(
        platform="x_twitter",
        copy_primary="৩:১৭ মিনিটে ঘড়িটা থেমে গিয়েছিল কেন? সত্য কি আসলেই লুকিয়ে রাখা যায়?",
        cta="আপনার ধারণা কী? Quote Tweet করুন।",
        hashtags=["hoichoi", "BanglaNoir"],
        asset_aspect_ratio="16:9"
    )
    assert out.status == ValidationStatus.PASSED
