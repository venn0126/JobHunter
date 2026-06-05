from collections.abc import Callable
from typing import TypeVar

from redis import Redis
from redis.exceptions import RedisError

from core.redis_client import create_redis_client, safe_close_redis
from services.result import ServiceResult

T = TypeVar("T")


def run_with_redis(operation: Callable[[Redis], T]) -> T:
    client = None
    try:
        client = create_redis_client()
        return operation(client)
    finally:
        safe_close_redis(client)


def redis_degraded_result(exc: Exception, *, data=None) -> ServiceResult:
    return ServiceResult(status="degraded", data=data, message=str(exc))


REDIS_RECOVERABLE_ERRORS = (RedisError, TimeoutError, ConnectionError)
