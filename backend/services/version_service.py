import json

from core.config import get_settings


def read_version_info():
    version_file = get_settings().project_root / "version.json"

    if not version_file.exists():
        return {
            "app": "JobHunter",
            "version": "0.1.0",
            "build_id": "unknown",
            "updated_at": "",
            "data_mode": "mock",
        }

    with version_file.open("r", encoding="utf-8") as file:
        return json.load(file)
