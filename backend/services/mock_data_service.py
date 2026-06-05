from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from core.config import get_settings


def mock_data_dir() -> Path:
    return get_settings().project_root / "frontend" / "src" / "mocks"


def mock_dataset_config_path() -> Path:
    return get_settings().project_root / "data" / "demo" / "mock-datasets.json"


def validate_mock_filename(filename: str) -> str:
    path = Path(filename)
    if path.is_absolute() or len(path.parts) != 1 or path.suffix != ".json":
        raise ValueError(f"invalid mock dataset filename: {filename}")
    return filename


@lru_cache(maxsize=1)
def load_mock_datasets() -> dict[str, str]:
    raw_config = json.loads(mock_dataset_config_path().read_text(encoding="utf-8"))
    if not isinstance(raw_config, dict):
        raise ValueError("mock dataset config must be an object")

    datasets: dict[str, str] = {}
    for key, filename in raw_config.items():
        if not isinstance(key, str) or not key.strip():
            raise ValueError("mock dataset key must be a non-empty string")
        if not isinstance(filename, str):
            raise ValueError(f"mock dataset filename must be a string: {key}")
        datasets[key] = validate_mock_filename(filename)
    return datasets


def get_mock_datasets() -> dict[str, str]:
    return dict(load_mock_datasets())


@lru_cache(maxsize=32)
def read_mock_json(filename: str) -> Any:
    path = mock_data_dir() / validate_mock_filename(filename)
    return json.loads(path.read_text(encoding="utf-8"))


def list_missing_mock_files() -> list[str]:
    return [filename for filename in get_mock_datasets().values() if not (mock_data_dir() / filename).is_file()]


def get_mock_bootstrap() -> dict[str, Any]:
    return {key: read_mock_json(filename) for key, filename in get_mock_datasets().items()}


def get_demo_summary():
    settings = get_settings()
    datasets = list(get_mock_datasets().keys())
    missing_files = list_missing_mock_files()
    return {
        "data_mode": settings.data_mode,
        "mock_ready": not missing_files,
        "datasets": datasets,
        "dataset_count": len(datasets),
        "missing_files": missing_files,
    }
