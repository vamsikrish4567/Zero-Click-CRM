"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Union
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )

    # Google Cloud
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    BIGQUERY_DATASET: str = "crm_data"
    VERTEX_AI_LOCATION: str = "us-central1"
    VERTEX_AI_MODEL: str = "gemini-1.5-flash-001"  # Updated with version number

    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True

    # CORS - can be comma-separated string or list
    ALLOWED_ORIGINS: Union[list[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        """Parse ALLOWED_ORIGINS from string or list."""
        if isinstance(v, str):
            # Handle comma-separated string
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v


settings = Settings()



