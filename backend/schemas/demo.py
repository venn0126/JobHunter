from pydantic import BaseModel, Field


class DemoSummaryResponse(BaseModel):
    data_mode: str
    mock_ready: bool
    datasets: list[str] = Field(default_factory=list)
    dataset_count: int
    missing_files: list[str] = Field(default_factory=list)


class DemoResetResponse(BaseModel):
    reset: bool
    demo_user_id: str
    active_persona_id: str | None = None
    personas_created: int = 0
    personas_deleted: int = 0
