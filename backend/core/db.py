from contextlib import closing
from time import perf_counter

import psycopg

from core.database_url import to_psycopg_conninfo


def check_postgres(database_url: str) -> dict[str, object]:
    started_at = perf_counter()
    with closing(psycopg.connect(to_psycopg_conninfo(database_url), connect_timeout=2)) as conn:
        with conn.cursor() as cursor:
            cursor.execute("select 1")
            cursor.fetchone()

    return {
        "status": "ok",
        "latency_ms": round((perf_counter() - started_at) * 1000, 2),
    }
