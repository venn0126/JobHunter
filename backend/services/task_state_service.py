from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Literal

from core.config import get_settings
from core.redis_keys import task_events_key, task_state_key
from services.redis_service import REDIS_RECOVERABLE_ERRORS, redis_degraded_result, run_with_redis
from services.result import ServiceResult

TaskStatus = Literal[
    "pending",
    "running",
    "succeeded",
    "failed",
    "fallback_cache",
    "fallback_mock",
    "cancelled",
]

TASK_EVENT_DEFAULT_LIMIT = 100
TASK_EVENT_MAX_LIMIT = 500


TaskServiceResult = ServiceResult
TASK_READ_ERRORS = REDIS_RECOVERABLE_ERRORS + (json.JSONDecodeError,)
TASK_WRITE_ERRORS = REDIS_RECOVERABLE_ERRORS + (TypeError,)


def clamp_event_limit(
    limit: int,
    *,
    default: int = TASK_EVENT_DEFAULT_LIMIT,
    max_limit: int = TASK_EVENT_MAX_LIMIT,
) -> int:
    try:
        parsed_limit = int(limit)
    except (TypeError, ValueError):
        return default
    return max(1, min(parsed_limit, max_limit))


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_task_state(
    *,
    task_id: str,
    status: TaskStatus,
    progress: int = 0,
    message: str | None = None,
    result_cache_key: str | None = None,
    error_code: str | None = None,
    payload: dict | None = None,
) -> dict[str, Any]:
    return {
        "task_id": task_id,
        "status": status,
        "progress": max(0, min(progress, 100)),
        "message": message,
        "result_cache_key": result_cache_key,
        "error_code": error_code,
        "payload": payload or {},
        "updated_at": utc_now(),
    }


class RedisTaskStateStore:
    def __init__(self, *, ttl_seconds: int | None = None) -> None:
        self.ttl_seconds = ttl_seconds or get_settings().task_state_ttl_seconds

    def set_state(self, state: dict[str, Any]) -> TaskServiceResult:
        task_id = state["task_id"]
        try:
            serialized_state = json.dumps(state, ensure_ascii=False)
            run_with_redis(lambda client: client.setex(task_state_key(task_id), self.ttl_seconds, serialized_state))
            return TaskServiceResult(status="stored", data=state)
        except TASK_WRITE_ERRORS as exc:
            return redis_degraded_result(exc, data=state)

    def get_state(self, task_id: str) -> TaskServiceResult:
        try:
            raw = run_with_redis(lambda client: client.get(task_state_key(task_id)))
            if raw is None:
                return TaskServiceResult(status="miss")
            return TaskServiceResult(status="hit", data=json.loads(raw))
        except TASK_READ_ERRORS as exc:
            return redis_degraded_result(exc)

    def append_event(self, task_id: str, event_type: str, message: str, payload: dict | None = None) -> TaskServiceResult:
        event = {
            "task_id": task_id,
            "event_type": event_type,
            "message": message,
            "payload": payload or {},
            "created_at": utc_now(),
        }
        try:
            def append(client) -> None:
                key = task_events_key(task_id)
                client.rpush(key, json.dumps(event, ensure_ascii=False))
                client.expire(key, self.ttl_seconds)

            run_with_redis(append)
            return TaskServiceResult(status="stored", data=event)
        except TASK_WRITE_ERRORS as exc:
            return redis_degraded_result(exc, data=event)

    def list_events(self, task_id: str, *, limit: int = 100) -> TaskServiceResult:
        safe_limit = clamp_event_limit(limit)
        try:
            raw_events = run_with_redis(lambda client: client.lrange(task_events_key(task_id), -safe_limit, -1))
            return TaskServiceResult(status="hit", data=[json.loads(item) for item in raw_events])
        except TASK_READ_ERRORS as exc:
            return redis_degraded_result(exc, data=[])
