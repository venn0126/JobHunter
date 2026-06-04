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
    database_url: str = "postgresql://jobhunter:jobhunter@127.0.0.1:5432/jobhunter"
    redis_url: str = "redis://127.0.0.1:6379/0"
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
