from typing import Any

from pydantic import BaseModel, Field


class DemoSummaryResponse(BaseModel):
    data_mode: str
    mock_ready: bool
    datasets: list[str] = Field(default_factory=list)
    dataset_count: int


class MockBootstrapResponse(BaseModel):
    careerPersonas: dict[str, Any]
    careerVault: dict[str, Any]
    dashboard: dict[str, Any]
    decisionCards: dict[str, Any]
    feedbackReview: dict[str, Any]
    interviewGuide: dict[str, Any]
    jobs: dict[str, Any]
    market: dict[str, Any]
    recruiterLens: dict[str, Any]
    resumeLab: dict[str, Any]
    resumeStudio: dict[str, Any]
    sprint: dict[str, Any]


class DemoResetResponse(BaseModel):
    reset: bool
    demo_user_id: str
    active_persona_id: str | None = None
    personas_created: int = 0
