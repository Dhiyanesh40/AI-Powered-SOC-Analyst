from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application-wide configuration loaded from environment variables.

    During development, values are read from the .env file
    in the project root. In production, set them as real env vars.
    """

    APP_NAME: str = "AI-Powered SOC Analyst"
    DEBUG: bool = True

    # SQLite for development, PostgreSQL for production
    DATABASE_URL: str = "sqlite:///./soc_analyst.db"

    # Frontend origin for CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # ── Sprint 2+ keys (unused in Sprint 1) ──
    GEMINI_API_KEY: str = ""
    CHROMA_PERSIST_DIR: str = "./knowledge_base/store/chroma_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Singleton instance imported across the app
settings = Settings()
