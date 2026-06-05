from typing import Any, Literal

from pydantic import BaseModel, Field

TaskStatus = Literal[
    "pending",
    "running",
    "succeeded",
    "failed",
    "fallback_cache",
    "fallback_mock",
    "cancelled",
]


class TaskStateResponse(BaseModel):
    task_id: str
    status: TaskStatus
    progress: int = Field(ge=0, le=100)
    message: str | None = None
    result_cache_key: str | None = None
    error_code: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    updated_at: str


class TaskEventResponse(BaseModel):
    task_id: str
    event_type: str
    message: str
    payload: dict[str, Any] = Field(default_factory=dict)
    created_at: str
