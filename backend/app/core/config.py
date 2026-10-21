import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "PriceFinder BD API"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "insecure-dev-secret-key-change-in-production-min32"
    
    # Database
    DATABASE_URL: str = "sqlite:///./pricefinder_dev.db"

    # Supabase (Optional for local testing, required for production)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    # Optional Vision Provider
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
