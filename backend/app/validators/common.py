from typing import List, Any
from pydantic import BaseModel
from app.models.enums import ValidationStatus

class ValidationCheckItem(BaseModel):
    rule: str
    passed: bool
    message: str
    expected: Any
    actual: Any

class PlatformValidationOutput(BaseModel):
    status: ValidationStatus
    checks: List[ValidationCheckItem]
    error_summary: str = ""

def build_check(rule: str, passed: bool, message: str, expected: Any, actual: Any) -> ValidationCheckItem:
    return ValidationCheckItem(
        rule=rule,
        passed=passed,
        message=message,
        expected=expected,
        actual=actual
    )
