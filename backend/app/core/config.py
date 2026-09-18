import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "MEMORA"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # Database (PostgreSQL with SQLite fallback)
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./memora.db",
        env="DATABASE_URL"
    )
    
    # Qdrant Vector Store
    QDRANT_URL: str = Field(default="http://localhost:6333", env="QDRANT_URL")
    QDRANT_API_KEY: str = Field(default="", env="QDRANT_API_KEY")
    QDRANT_COLLECTION_NAME: str = Field(default="memora_memories", env="QDRANT_COLLECTION_NAME")
    
    # LLM Providers (openai | gemini | grok | local_heuristic)
    LLM_PROVIDER: str = Field(default="local_heuristic", env="LLM_PROVIDER")
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    GROK_API_KEY: str = Field(default="", env="GROK_API_KEY")
    
    # JWT Security
    JWT_SECRET: str = Field(
        default="memora_super_secret_jwt_key_hackclub_2026_change_in_production",
        env="JWT_SECRET"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
