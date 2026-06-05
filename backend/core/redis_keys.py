from __future__ import annotations

import json
from hashlib import sha256
from typing import Any

from core.config import get_settings


def normalize_key_part(value: Any) -> str:
    text = str(value).strip()
    if not text:
        return "_"
    return text.replace(" ", "_").replace(":", "_")


def redis_key(*parts: Any) -> str:
    prefix = get_settings().redis_key_prefix
    normalized = [normalize_key_part(part) for part in parts]
    return ":".join([prefix, *normalized])


def input_hash(payload: Any) -> str:
    normalized = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256(normalized.encode("utf-8")).hexdigest()[:16]


def cache_key(scope: str, user_id: str, persona_id: str, target_id: str, version: str, payload_hash: str) -> str:
    return redis_key("cache", scope, user_id, persona_id, target_id, version, payload_hash)


def cache_pattern(scope: str, user_id: str, persona_id: str, target_id: str = "*") -> str:
    return redis_key("cache", scope, user_id, persona_id, target_id, "*")


def task_state_key(task_id: str) -> str:
    return redis_key("task", "state", task_id)


def task_events_key(task_id: str) -> str:
    return redis_key("task", "events", task_id)


def task_lock_key(task_id: str) -> str:
    return redis_key("lock", "task", task_id)


def idempotency_key(user_id: str, route: str, key: str) -> str:
    return redis_key("idempotency", user_id, route, key)
