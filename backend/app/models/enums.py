import enum

class PlatformType(str, enum.Enum):
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    X_TWITTER = "x_twitter"

class AssetType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"

class Language(str, enum.Enum):
    BENGALI = "bengali"
    ENGLISH = "english"
    BILINGUAL = "bilingual"

class GenerationRunStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATING = "generating"
    GENERATED = "generated"
    VALIDATING = "validating"
    VALID = "valid"
    INVALID = "invalid"
    FAILED = "failed"
    READY_FOR_REVIEW = "ready_for_review"

class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    VALIDATING = "validating"
    PENDING_REVIEW = "pending_review"
    REJECTED = "rejected"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

class ValidationStatus(str, enum.Enum):
    PASSED = "passed"
    FAILED = "failed"

class ApprovalDecision(str, enum.Enum):
    APPROVED = "approved"
    REJECTED = "rejected"

class ScheduleStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class PublicationStatus(str, enum.Enum):
    PENDING = "pending"
    PUBLISHED = "published"
    FAILED = "failed"
