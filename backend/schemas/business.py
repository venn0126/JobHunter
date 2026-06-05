from typing import Any

from pydantic import BaseModel, Field


class PaginationResponse(BaseModel):
    page: int
    page_size: int
    total: int
    has_next: bool


class ItemListResponse(BaseModel):
    items: list[dict[str, Any]] = Field(default_factory=list)
    pagination: PaginationResponse | None = None


class DatasetResponse(BaseModel):
    payload: dict[str, Any]
