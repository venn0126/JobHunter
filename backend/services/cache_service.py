from __future__ import annotations

import json
from typing import Any

from core.config import get_settings
from services.redis_service import REDIS_RECOVERABLE_ERRORS, redis_degraded_result, run_with_redis
from services.result import ServiceResult


CacheResult = ServiceResult
CACHE_READ_ERRORS = REDIS_RECOVERABLE_ERRORS + (json.JSONDecodeError,)
CACHE_WRITE_ERRORS = REDIS_RECOVERABLE_ERRORS + (TypeError,)


class RedisJsonCache:
    def __init__(self, *, ttl_seconds: int | None = None) -> None:
        self.ttl_seconds = ttl_seconds or get_settings().cache_default_ttl_seconds

    def get(self, key: str) -> CacheResult:
        try:
            raw = run_with_redis(lambda client: client.get(key))
            if raw is None:
                return CacheResult(status="miss")
            return CacheResult(status="hit", data=json.loads(raw))
        except CACHE_READ_ERRORS as exc:
            return redis_degraded_result(exc)

    def set(self, key: str, data: Any, *, ttl_seconds: int | None = None) -> CacheResult:
        ttl = ttl_seconds or self.ttl_seconds
        try:
            serialized_data = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
            run_with_redis(lambda client: client.setex(key, ttl, serialized_data))
            return CacheResult(status="stored")
        except CACHE_WRITE_ERRORS as exc:
            return redis_degraded_result(exc)

    def delete_pattern(self, pattern: str, *, batch_size: int = 200) -> CacheResult:
        try:
            deleted = 0

            def delete_matching_keys(client) -> None:
                nonlocal deleted
                cursor = 0
                while True:
                    cursor, keys = client.scan(cursor=cursor, match=pattern, count=batch_size)
                    if keys:
                        deleted += client.delete(*keys)
                    if cursor == 0:
                        break

            run_with_redis(delete_matching_keys)
            return CacheResult(status="deleted", data={"count": deleted})
        except REDIS_RECOVERABLE_ERRORS as exc:
            return redis_degraded_result(exc)
