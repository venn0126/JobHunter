from __future__ import annotations

from typing import Any

from core.ids import new_public_id
from services.demo_write_state_service import read_resume_lab_state, write_resume_lab_state
from services.job_query_service import get_demo_job
from services.result import ServiceResult
from services.task_state_service import utc_now


def normalize_resume_lab_payload(payload: dict[str, Any]) -> dict[str, Any]:
    versions = payload.get("versions", [])
    return {
        "summary": payload.get("summary", {}),
        "versions": versions if isinstance(versions, list) else [],
    }


def read_resume_lab() -> ServiceResult:
    result = read_resume_lab_state()
    return ServiceResult(status=result.status, data=normalize_resume_lab_payload(result.data), message=result.message)


def create_resume_version(
    *,
    name: str,
    job_id: str | None = None,
    sections: list[dict[str, Any]] | None = None,
    content: str | None = None,
) -> ServiceResult:
    normalized_name = name.strip()
    if not normalized_name:
        return ServiceResult(status="invalid", message="resume version name is required")
    if job_id and not get_demo_job(job_id):
        return ServiceResult(status="miss", message="job not found")

    state_result = read_resume_lab()
    payload = normalize_resume_lab_payload(state_result.data)
    version = {
        "id": new_public_id("resume"),
        "name": normalized_name,
        "status": "继续观察",
        "applied_count": 0,
        "interview_count": 0,
        "no_response_count": 0,
        "interview_rate": 0,
        "best_for": [],
        "recommendation": "新保存版本，建议通过后续投递反馈验证效果。",
        "strengths": [],
        "improvement_tips": [],
        "target_job_ids": [job_id] if job_id else [],
        "key_changes": sections or [],
        "content": content or "",
        "updated_at": utc_now()[:10],
    }
    payload["versions"] = [version, *payload["versions"]]
    write_result = write_resume_lab_state(payload)
    return ServiceResult(status=write_result.status, data=version, message=write_result.message)
