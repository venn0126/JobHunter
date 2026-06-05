from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

DataMode = Literal["mock", "api", "hybrid"]

PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "JobHunter API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api"
    data_mode: DataMode = "mock"
    debug_routes_enabled: bool = False
    database_url: str = "postgresql+psycopg://jobhunter:jobhunter@127.0.0.1:5432/jobhunter"
    redis_url: str = "redis://127.0.0.1:6379/0"
    redis_key_prefix: str = "jobhunter"
    cache_default_ttl_seconds: int = 300
    generated_cache_ttl_seconds: int = 86400
    generated_timeout_seconds: float = 8.0
    task_state_ttl_seconds: int = 86400
    idempotency_ttl_seconds: int = 300
    auth_token_ttl_seconds: int = 86400
    auth_refresh_token_ttl_seconds: int = 604800
    demo_user_public_id: str = "demo_user"
    demo_user_email: str = "demo@jobhunter.local"
    demo_user_password: str = "jobhunter-demo"
    demo_user_nickname: str = "Demo User"
    project_root: Path = PROJECT_ROOT
    frontend_dist: Path = PROJECT_ROOT / "frontend" / "dist"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
        ]
    )

    model_config = SettingsConfigDict(
        env_file=("../.env.local", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
