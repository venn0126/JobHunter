from typing import Literal

from pydantic import BaseModel, Field


UpdateChannel = Literal["stable", "demo", "manual"]


class SystemUpdateApplyRequest(BaseModel):
    channel: UpdateChannel = "stable"
    dry_run: bool = False
    target_version: str | None = Field(default=None, max_length=80)
