from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Literal

from redis.exceptions import RedisError

from core.config import get_settings
from core.redis_client import create_redis_client, safe_close_redis
from core.redis_keys import task_events_key, task_state_key

TaskStatus = Literal[
    "pending",
    "running",
    "succeeded",
    "failed",
    "fallback_cache",
    "fallback_mock",
    "cancelled",
]


@dataclass(frozen=True)
class TaskServiceResult:
    status: str
    data: Any = None
    message: str | None = None


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
        client = None
        task_id = state["task_id"]
        try:
            client = create_redis_client()
            client.setex(task_state_key(task_id), self.ttl_seconds, json.dumps(state, ensure_ascii=False))
            return TaskServiceResult(status="stored", data=state)
        except (RedisError, TypeError) as exc:
            return TaskServiceResult(status="degraded", data=state, message=str(exc))
        finally:
            safe_close_redis(client)

    def get_state(self, task_id: str) -> TaskServiceResult:
        client = None
        try:
            client = create_redis_client()
            raw = client.get(task_state_key(task_id))
            if raw is None:
                return TaskServiceResult(status="miss")
            return TaskServiceResult(status="hit", data=json.loads(raw))
        except (RedisError, json.JSONDecodeError) as exc:
            return TaskServiceResult(status="degraded", message=str(exc))
        finally:
            safe_close_redis(client)

    def append_event(self, task_id: str, event_type: str, message: str, payload: dict | None = None) -> TaskServiceResult:
        client = None
        event = {
            "task_id": task_id,
            "event_type": event_type,
            "message": message,
            "payload": payload or {},
            "created_at": utc_now(),
        }
        try:
            client = create_redis_client()
            key = task_events_key(task_id)
            client.rpush(key, json.dumps(event, ensure_ascii=False))
            client.expire(key, self.ttl_seconds)
            return TaskServiceResult(status="stored", data=event)
        except (RedisError, TypeError) as exc:
            return TaskServiceResult(status="degraded", data=event, message=str(exc))
        finally:
            safe_close_redis(client)

    def list_events(self, task_id: str, *, limit: int = 100) -> TaskServiceResult:
        client = None
        safe_limit = max(1, min(limit, 500))
        try:
            client = create_redis_client()
            raw_events = client.lrange(task_events_key(task_id), -safe_limit, -1)
            return TaskServiceResult(status="hit", data=[json.loads(item) for item in raw_events])
        except (RedisError, json.JSONDecodeError) as exc:
            return TaskServiceResult(status="degraded", data=[], message=str(exc))
        finally:
            safe_close_redis(client)
