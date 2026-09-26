from app.core.config import settings
from app.core.logging import logger
from app.ai.base import LLMProvider, VisualProvider
from app.ai.gemini import GeminiProvider
from app.ai.pixazo import PixazoProvider
from app.ai.mock_providers import MockLLMProvider

def get_llm_provider() -> LLMProvider:
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key":
        logger.info("Using real Gemini LLM Provider")
        return GeminiProvider()
    else:
        logger.warning("GEMINI_API_KEY not set or placeholder. Using high-fidelity Mock LLM Provider.")
        return MockLLMProvider()

def get_visual_provider() -> VisualProvider:
    return PixazoProvider()
