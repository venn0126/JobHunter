from __future__ import annotations

import json
from copy import deepcopy
from typing import Any

from core.config import get_settings
from core.redis_keys import redis_key
from services.demo_dataset_service import build_demo_pipeline, read_demo_dataset, read_demo_items
from services.redis_service import REDIS_RECOVERABLE_ERRORS, redis_degraded_result, run_with_redis
from services.result import ServiceResult

STATE_VERSION = "v1"
WRITE_STATE_READ_ERRORS = REDIS_RECOVERABLE_ERRORS + (json.JSONDecodeError,)
WRITE_STATE_WRITE_ERRORS = REDIS_RECOVERABLE_ERRORS + (TypeError,)


def demo_state_key(dataset: str) -> str:
    settings = get_settings()
    return redis_key("demo", "write_state", settings.demo_user_public_id, STATE_VERSION, dataset)


def clone_payload(payload: Any) -> Any:
    return deepcopy(payload)


class DemoWriteStateStore:
    def __init__(self) -> None:
        self.ttl_seconds = get_settings().task_state_ttl_seconds

    def read(self, dataset: str, default_factory) -> ServiceResult:
        try:
            raw_payload = run_with_redis(lambda client: client.get(demo_state_key(dataset)))
            if raw_payload is None:
                return ServiceResult(status="miss", data=clone_payload(default_factory()))
            return ServiceResult(status="hit", data=json.loads(raw_payload))
        except WRITE_STATE_READ_ERRORS as exc:
            return redis_degraded_result(exc, data=clone_payload(default_factory()))

    def write(self, dataset: str, payload: Any) -> ServiceResult:
        try:
            serialized_payload = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
            run_with_redis(lambda client: client.setex(demo_state_key(dataset), self.ttl_seconds, serialized_payload))
            return ServiceResult(status="stored", data=payload)
        except WRITE_STATE_WRITE_ERRORS as exc:
            return redis_degraded_result(exc, data=payload)

    def clear_all(self) -> ServiceResult:
        settings = get_settings()
        pattern = redis_key("demo", "write_state", settings.demo_user_public_id, STATE_VERSION, "*")
        try:
            deleted = 0

            def delete_matching_keys(client) -> None:
                nonlocal deleted
                cursor = 0
                while True:
                    cursor, keys = client.scan(cursor=cursor, match=pattern, count=100)
                    if keys:
                        deleted += client.delete(*keys)
                    if cursor == 0:
                        break

            run_with_redis(delete_matching_keys)
            return ServiceResult(status="deleted", data={"count": deleted})
        except REDIS_RECOVERABLE_ERRORS as exc:
            return redis_degraded_result(exc, data={"count": 0})


def clear_demo_write_state() -> ServiceResult:
    return DemoWriteStateStore().clear_all()


def read_pipeline_state() -> ServiceResult:
    return DemoWriteStateStore().read("pipeline", build_demo_pipeline)


def write_pipeline_state(payload: dict[str, Any]) -> ServiceResult:
    return DemoWriteStateStore().write("pipeline", payload)


def read_vault_state() -> ServiceResult:
    return DemoWriteStateStore().read("vault", lambda: {"items": read_demo_items("vault")})


def write_vault_state(payload: dict[str, Any]) -> ServiceResult:
    return DemoWriteStateStore().write("vault", payload)


def read_feedback_state() -> ServiceResult:
    return DemoWriteStateStore().read("feedback", lambda: read_demo_dataset("feedbackReview"))


def write_feedback_state(payload: dict[str, Any]) -> ServiceResult:
    return DemoWriteStateStore().write("feedback", payload)


def read_resume_lab_state() -> ServiceResult:
    return DemoWriteStateStore().read("resume_lab", lambda: read_demo_dataset("resumeLab"))


def write_resume_lab_state(payload: dict[str, Any]) -> ServiceResult:
    return DemoWriteStateStore().write("resume_lab", payload)


def write_blocked_by_degraded_state(result: ServiceResult) -> ServiceResult | None:
    if result.status != "degraded":
        return None
    return ServiceResult(status="degraded", data={"degraded": True}, message=result.message)
