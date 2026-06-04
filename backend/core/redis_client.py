from time import perf_counter

from redis import Redis


def check_redis(redis_url: str) -> dict[str, object]:
    started_at = perf_counter()
    client = Redis.from_url(redis_url, socket_connect_timeout=2, socket_timeout=2)
    try:
        client.ping()
    finally:
        client.close()

    return {
        "status": "ok",
        "latency_ms": round((perf_counter() - started_at) * 1000, 2),
    }
