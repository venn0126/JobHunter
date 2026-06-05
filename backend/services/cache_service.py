from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from redis.exceptions import RedisError

from core.config import get_settings
from core.redis_client import create_redis_client, safe_close_redis


@dataclass(frozen=True)
class CacheResult:
    status: str
    data: Any = None
    message: str | None = None


class RedisJsonCache:
    def __init__(self, *, ttl_seconds: int | None = None) -> None:
        self.ttl_seconds = ttl_seconds or get_settings().cache_default_ttl_seconds

    def get(self, key: str) -> CacheResult:
        client = None
        try:
            client = create_redis_client()
            raw = client.get(key)
            if raw is None:
                return CacheResult(status="miss")
            return CacheResult(status="hit", data=json.loads(raw))
        except (RedisError, json.JSONDecodeError) as exc:
            return CacheResult(status="degraded", message=str(exc))
        finally:
            safe_close_redis(client)

    def set(self, key: str, data: Any, *, ttl_seconds: int | None = None) -> CacheResult:
        client = None
        ttl = ttl_seconds or self.ttl_seconds
        try:
            client = create_redis_client()
            client.setex(key, ttl, json.dumps(data, ensure_ascii=False, separators=(",", ":")))
            return CacheResult(status="stored")
        except (RedisError, TypeError) as exc:
            return CacheResult(status="degraded", message=str(exc))
        finally:
            safe_close_redis(client)

    def delete_pattern(self, pattern: str, *, batch_size: int = 200) -> CacheResult:
        client = None
        deleted = 0
        try:
            client = create_redis_client()
            cursor = 0
            while True:
                cursor, keys = client.scan(cursor=cursor, match=pattern, count=batch_size)
                if keys:
                    deleted += client.delete(*keys)
                if cursor == 0:
                    break
            return CacheResult(status="deleted", data={"count": deleted})
        except RedisError as exc:
            return CacheResult(status="degraded", message=str(exc))
        finally:
            safe_close_redis(client)
