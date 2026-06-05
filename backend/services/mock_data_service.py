from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from core.config import get_settings

MOCK_DATASETS = {
    "careerPersonas": "career-personas.json",
    "careerVault": "career-vault.json",
    "dashboard": "dashboard.json",
    "decisionCards": "job-decision-cards.json",
    "feedbackReview": "feedback-review.json",
    "interviewGuide": "interview-guide.json",
    "jobs": "jobs.json",
    "market": "opportunity-market.json",
    "recruiterLens": "recruiter-lens.json",
    "resumeLab": "resume-lab.json",
    "resumeStudio": "resume-studio.json",
    "sprint": "sprint-plan.json",
}


def mock_data_dir() -> Path:
    return get_settings().project_root / "frontend" / "src" / "mocks"


def read_mock_json(filename: str) -> Any:
    path = mock_data_dir() / filename
    return json.loads(path.read_text(encoding="utf-8"))


def get_mock_bootstrap() -> dict[str, Any]:
    return {key: read_mock_json(filename) for key, filename in MOCK_DATASETS.items()}


def get_demo_summary():
    settings = get_settings()
    datasets = list(MOCK_DATASETS.keys())
    return {
        "data_mode": settings.data_mode,
        "mock_ready": True,
        "datasets": datasets,
        "dataset_count": len(datasets),
    }
