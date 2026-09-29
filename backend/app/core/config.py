import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ReWise AI"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    # Database
    # Default to local SQLite for instant zero-config hackathon execution,
    # effortlessly switchable to PostgreSQL / Supabase via DATABASE_URL
    DATABASE_URL: str = "sqlite:///./rewise.db"

    # AI Configuration (Gemini Multimodal AI)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    AI_TIMEOUT_SECONDS: int = 25

    # Maps / Geocoding
    MAPS_API_KEY: str = ""

    # Supabase Configuration (Server-Side Postgres & Service Role)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Apify Web Scraping Configuration (Server-Side Only)
    APIFY_API_TOKEN: str = ""
    APIFY_API_KEY: str = ""  # alias support

    # Apify Actor IDs (Configurable, no hardcoded unknown IDs)
    APIFY_DEVICE_ACTOR: str = ""
    APIFY_DEVICE_ACTOR_ID: str = ""
    APIFY_PRICE_ACTOR: str = ""
    APIFY_RESALE_ACTOR: str = ""
    APIFY_SERVICE_CENTER_ACTOR: str = ""
    APIFY_SEARCH_ACTOR: str = ""
    APIFY_ACTORS_CONFIG_FILE: str = "config/apify_actors.json"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"

    @property
    def effective_apify_token(self) -> str:
        return self.APIFY_API_TOKEN or self.APIFY_API_KEY

    @property
    def effective_device_actor_id(self) -> str:
        return self.APIFY_DEVICE_ACTOR_ID or self.APIFY_DEVICE_ACTOR


settings = Settings()
