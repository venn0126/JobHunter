from core.config import get_settings


def get_demo_summary():
    settings = get_settings()
    return {
        "data_mode": settings.data_mode,
        "mock_ready": True,
        "datasets": [
            "career-personas",
            "opportunity-market",
            "jobs",
            "sprint-plan",
        ],
    }
