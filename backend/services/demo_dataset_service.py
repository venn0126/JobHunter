from __future__ import annotations

from copy import deepcopy
from typing import Any

from services.mock_data_service import get_mock_datasets, read_mock_json


DATASET_ALIASES = {
    "vault": "careerVault",
}

PIPELINE_COLUMNS = [
    {"id": "interested", "label": "感兴趣"},
    {"id": "tailored", "label": "已定制简历"},
    {"id": "applied", "label": "已投递"},
    {"id": "hr_contact", "label": "HR 沟通"},
    {"id": "interviewing", "label": "面试中"},
    {"id": "offer", "label": "Offer"},
]

PIPELINE_SEED = [
    {"job_id": "job_1001", "status": "interested", "next_action": "补充 RAG 项目量化成果"},
    {"job_id": "job_1002", "status": "tailored", "next_action": "定制 LLM 后端版简历"},
    {"job_id": "job_1003", "status": "applied", "next_action": "明天上午跟进投递结果"},
]


def read_demo_dataset(dataset_key: str) -> Any:
    mock_key = DATASET_ALIASES.get(dataset_key, dataset_key)
    filename = get_mock_datasets().get(mock_key)
    if not filename:
        raise ValueError(f"unknown demo dataset: {dataset_key}")
    return deepcopy(read_mock_json(filename))


def read_demo_items(dataset_key: str) -> list[dict[str, Any]]:
    payload = read_demo_dataset(dataset_key)
    if not isinstance(payload, dict):
        raise ValueError(f"demo dataset must be an object: {dataset_key}")
    items = payload.get("items", [])
    if not isinstance(items, list):
        raise ValueError(f"demo dataset items must be a list: {dataset_key}")
    return items


def get_demo_item_by_id(dataset_key: str, item_id: str) -> dict[str, Any] | None:
    return next((item for item in read_demo_items(dataset_key) if item.get("id") == item_id), None)


def build_demo_pipeline() -> dict[str, Any]:
    jobs_by_id = {job.get("id"): job for job in read_demo_items("jobs")}
    entries = [
        {
            "addedAt": "2026-06-03T09:00:00+08:00",
            "job": jobs_by_id[seed["job_id"]],
            "nextAction": seed["next_action"],
            "status": seed["status"],
            "updatedAt": "2026-06-03T09:00:00+08:00",
        }
        for seed in PIPELINE_SEED
        if seed["job_id"] in jobs_by_id
    ]
    summary = [
        {
            "count": len([entry for entry in entries if entry["status"] == column["id"]]),
            "id": column["id"],
            "label": column["label"],
        }
        for column in PIPELINE_COLUMNS
    ]
    return {"entries": entries, "summary": summary}
