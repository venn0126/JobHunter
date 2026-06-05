from time import perf_counter

from redis import Redis
from redis.exceptions import RedisError

from core.config import get_settings


def create_redis_client(redis_url: str | None = None) -> Redis:
    url = redis_url or get_settings().redis_url
    return Redis.from_url(url, decode_responses=True, socket_connect_timeout=2, socket_timeout=2)


def safe_close_redis(client: Redis | None) -> None:
    if client is None:
        return
    try:
        client.close()
    except RedisError:
        pass


def check_redis(redis_url: str) -> dict[str, object]:
    started_at = perf_counter()
    client = create_redis_client(redis_url)
    try:
        client.ping()
    finally:
        safe_close_redis(client)

    return {
        "status": "ok",
        "latency_ms": round((perf_counter() - started_at) * 1000, 2),
    }
