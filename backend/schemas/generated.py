from typing import Any

from pydantic import BaseModel, Field


class GeneratedCacheMeta(BaseModel):
    key: str
    status: str
    ttl_seconds: int


class GenerationMeta(BaseModel):
    scope: str
    target_id: str
    payload_hash: str
    version: str
    origin_source: str
    warnings: list[str] = Field(default_factory=list)


class GeneratedResponse(BaseModel):
    task_id: str
    status: str
    source: str
    result: dict[str, Any]
    cache: GeneratedCacheMeta
    generation: GenerationMeta


class TailorRunRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=120)
    force_refresh: bool = False


class InterviewStartRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=120)
    force_refresh: bool = False
