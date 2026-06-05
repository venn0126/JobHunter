from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from services.demo_dataset_service import PIPELINE_COLUMNS
from services.demo_write_state_service import read_pipeline_state, write_blocked_by_degraded_state, write_pipeline_state
from services.job_query_service import get_demo_job
from services.result import ServiceResult

PipelineStatus = Literal["interested", "tailored", "applied", "hr_contact", "interviewing", "offer", "rejected", "withdrawn"]

ACTIVE_STATUSES = {column["id"] for column in PIPELINE_COLUMNS}
VALID_TRANSITIONS: dict[str, set[str]] = {
    "applied": {"tailored", "hr_contact", "rejected", "withdrawn"},
    "hr_contact": {"applied", "interviewing", "rejected", "withdrawn"},
    "interested": {"tailored", "rejected", "withdrawn"},
    "interviewing": {"hr_contact", "offer", "rejected", "withdrawn"},
    "offer": {"withdrawn"},
    "rejected": set(),
    "tailored": {"interested", "applied", "rejected", "withdrawn"},
    "withdrawn": set(),
}
DEFAULT_NEXT_ACTIONS: dict[str, str] = {
    "applied": "跟进投递反馈",
    "hr_contact": "确认面试时间和岗位细节",
    "interested": "补充素材并确认是否投递",
    "interviewing": "准备面试作战卡",
    "offer": "评估薪资和入职风险",
    "rejected": "记录反馈并复盘",
    "tailored": "检查简历版本并投递",
    "withdrawn": "归档撤回原因",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_pipeline_summary(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "count": len([entry for entry in entries if entry.get("status") == column["id"]]),
            "id": column["id"],
            "label": column["label"],
        }
        for column in PIPELINE_COLUMNS
    ]


def normalize_pipeline_payload(payload: dict[str, Any]) -> dict[str, Any]:
    entries = payload.get("entries", [])
    if not isinstance(entries, list):
        entries = []
    return {"entries": entries, "summary": build_pipeline_summary(entries)}


def read_pipeline() -> ServiceResult:
    result = read_pipeline_state()
    return ServiceResult(status=result.status, data=normalize_pipeline_payload(result.data), message=result.message)


def find_entry(entries: list[dict[str, Any]], job_id: str) -> dict[str, Any] | None:
    return next((entry for entry in entries if entry.get("job", {}).get("id") == job_id), None)


def add_pipeline_card(job_id: str, *, status: str = "interested", next_action: str | None = None) -> ServiceResult:
    if status not in VALID_TRANSITIONS:
        return ServiceResult(status="invalid", message="invalid pipeline status")

    job = get_demo_job(job_id)
    if not job:
        return ServiceResult(status="miss", message="job not found")

    state_result = read_pipeline()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result
    payload = normalize_pipeline_payload(state_result.data)
    entries = payload["entries"]
    existing = find_entry(entries, job_id)
    if existing:
        return ServiceResult(status="exists", data={"entry": existing, **payload}, message="pipeline card already exists")

    timestamp = now_iso()
    entry = {
        "addedAt": timestamp,
        "job": job,
        "nextAction": next_action or DEFAULT_NEXT_ACTIONS[status],
        "status": status,
        "updatedAt": timestamp,
    }
    payload = normalize_pipeline_payload({"entries": [entry, *entries]})
    write_result = write_pipeline_state(payload)
    return ServiceResult(status=write_result.status, data={"entry": entry, **payload}, message=write_result.message)


def update_pipeline_card(job_id: str, *, status: str | None = None, next_action: str | None = None, notes: str | None = None) -> ServiceResult:
    state_result = read_pipeline()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result
    payload = normalize_pipeline_payload(state_result.data)
    entries = payload["entries"]
    entry = find_entry(entries, job_id)
    if not entry:
        return ServiceResult(status="miss", message="pipeline card not found")

    current_status = entry.get("status")
    if status is not None:
        if status not in VALID_TRANSITIONS:
            return ServiceResult(status="invalid", message="invalid pipeline status")
        if current_status != status and status not in VALID_TRANSITIONS.get(current_status, set()):
            return ServiceResult(status="conflict", data={"entry": entry}, message="invalid pipeline transition")
        entry["status"] = status
        entry["nextAction"] = next_action or DEFAULT_NEXT_ACTIONS[status]
    elif next_action is not None:
        entry["nextAction"] = next_action

    if notes is not None:
        entry["notes"] = notes
    entry["updatedAt"] = now_iso()

    payload = normalize_pipeline_payload({"entries": entries})
    write_result = write_pipeline_state(payload)
    return ServiceResult(status=write_result.status, data={"entry": entry, **payload}, message=write_result.message)
