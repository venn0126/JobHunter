from contextlib import closing
from time import perf_counter

import psycopg
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from core.config import get_settings
from core.database_url import to_psycopg_conninfo
from core.database_url import to_sqlalchemy_url


def create_db_engine(database_url: str | None = None) -> Engine:
    url = database_url or get_settings().database_url
    return create_engine(to_sqlalchemy_url(url), pool_pre_ping=True, future=True)


def create_session_factory(database_url: str | None = None) -> sessionmaker[Session]:
    return sessionmaker(bind=create_db_engine(database_url), autoflush=False, autocommit=False, expire_on_commit=False)


SessionLocal = create_session_factory()


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
