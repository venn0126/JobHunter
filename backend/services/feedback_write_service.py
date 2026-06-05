from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Literal

from core.ids import new_public_id
from services.demo_write_state_service import read_feedback_state, write_feedback_state
from services.job_query_service import get_demo_job
from services.result import ServiceResult

FeedbackOutcome = Literal["applied", "interview", "no_response", "offer", "rejected", "withdrawn"]

OUTCOME_STAGES: dict[str, str] = {
    "applied": "已投递待跟进",
    "interview": "收到面试待准备",
    "no_response": "投递后无回复",
    "offer": "Offer 待评估",
    "rejected": "简历筛选未通过",
    "withdrawn": "已放弃跟进",
}
FOLLOW_UP_OUTCOMES = {"applied", "no_response", "interview"}


def today_text() -> str:
    return date.today().isoformat()


def follow_up_date(today: str) -> str:
    return (date.fromisoformat(today) + timedelta(days=2)).isoformat()


def normalize_tags(tags: list[str] | None) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for tag in tags or []:
        text = tag.strip()
        if not text or text in seen:
            continue
        normalized.append(text)
        seen.add(text)
        if len(normalized) >= 20:
            break
    return normalized


def normalize_feedback_payload(payload: dict[str, Any]) -> dict[str, Any]:
    records = payload.get("records", [])
    return {
        "records": records if isinstance(records, list) else [],
        "strategy_suggestions": payload.get("strategy_suggestions", []),
        "summary": payload.get("summary", {}),
    }


def get_feedback_review() -> ServiceResult:
    result = read_feedback_state()
    return ServiceResult(status=result.status, data=normalize_feedback_payload(result.data), message=result.message)


def build_feedback_record(
    *,
    job_id: str,
    resume_version_id: str,
    outcome: str,
    notes: str,
    next_action: str,
    feedback_tags: list[str] | None,
    existing_record: dict[str, Any] | None = None,
) -> dict[str, Any]:
    today = today_text()
    record = {
        "id": existing_record.get("id") if existing_record else new_public_id("fb"),
        "job_id": job_id,
        "resume_version_id": resume_version_id,
        "outcome": outcome,
        "stage": OUTCOME_STAGES[outcome],
        "channel": existing_record.get("channel", "手动记录") if existing_record else "手动记录",
        "applied_at": existing_record.get("applied_at", today) if existing_record else today,
        "updated_at": today,
        "feedback_tags": normalize_tags(feedback_tags),
        "notes": notes.strip(),
        "next_action": next_action.strip(),
    }
    if outcome in FOLLOW_UP_OUTCOMES:
        record["follow_up_at"] = follow_up_date(today)
    return record


def upsert_feedback_record(
    *,
    job_id: str,
    resume_version_id: str,
    outcome: str,
    notes: str,
    next_action: str,
    feedback_tags: list[str] | None = None,
) -> ServiceResult:
    if outcome not in OUTCOME_STAGES:
        return ServiceResult(status="invalid", message="invalid feedback outcome")
    if not get_demo_job(job_id):
        return ServiceResult(status="miss", message="job not found")
    if not resume_version_id.strip():
        return ServiceResult(status="invalid", message="resume version id is required")

    state_result = read_feedback_state()
    payload = normalize_feedback_payload(state_result.data)
    existing = next((record for record in payload["records"] if record.get("job_id") == job_id), None)
    record = build_feedback_record(
        job_id=job_id,
        resume_version_id=resume_version_id,
        outcome=outcome,
        notes=notes,
        next_action=next_action,
        feedback_tags=feedback_tags,
        existing_record=existing,
    )
    payload["records"] = (
        [record, *payload["records"]]
        if existing is None
        else [record if item.get("id") == existing.get("id") else item for item in payload["records"]]
    )
    write_result = write_feedback_state(payload)
    return ServiceResult(status=write_result.status, data=record, message=write_result.message)


def patch_feedback_record(
    record_id: str,
    *,
    outcome: str | None = None,
    notes: str | None = None,
    next_action: str | None = None,
    feedback_tags: list[str] | None = None,
) -> ServiceResult:
    state_result = read_feedback_state()
    payload = normalize_feedback_payload(state_result.data)
    record = next((item for item in payload["records"] if item.get("id") == record_id), None)
    if not record:
        return ServiceResult(status="miss", message="feedback record not found")
    if outcome is not None:
        if outcome not in OUTCOME_STAGES:
            return ServiceResult(status="invalid", message="invalid feedback outcome")
        record["outcome"] = outcome
        record["stage"] = OUTCOME_STAGES[outcome]
        if outcome in FOLLOW_UP_OUTCOMES:
            record["follow_up_at"] = follow_up_date(today_text())
        else:
            record.pop("follow_up_at", None)
    if notes is not None:
        record["notes"] = notes.strip()
    if next_action is not None:
        record["next_action"] = next_action.strip()
    if feedback_tags is not None:
        record["feedback_tags"] = normalize_tags(feedback_tags)
    record["updated_at"] = today_text()

    write_result = write_feedback_state(payload)
    return ServiceResult(status=write_result.status, data=record, message=write_result.message)
