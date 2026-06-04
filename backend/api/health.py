from fastapi import APIRouter, Request

from core.config import get_settings
from core.db import check_postgres
from core.redis_client import check_redis
from core.responses import ok

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health(request: Request):
    settings = get_settings()
    dependencies = {
        "postgres": {"status": "unknown"},
        "redis": {"status": "unknown"},
    }
    overall_status = "ok"

    try:
        dependencies["postgres"] = check_postgres(settings.database_url)
    except Exception as exc:  # pragma: no cover - health endpoint must report dependency errors
        overall_status = "degraded"
        dependencies["postgres"] = {"status": "error", "message": str(exc)}

    try:
        dependencies["redis"] = check_redis(settings.redis_url)
    except Exception as exc:  # pragma: no cover - health endpoint must report dependency errors
        overall_status = "degraded"
        dependencies["redis"] = {"status": "error", "message": str(exc)}

    return ok(
        data={
            "status": overall_status,
            "app": settings.app_name,
            "version": settings.app_version,
            "data_mode": settings.data_mode,
            "dependencies": dependencies,
        },
        request=request,
    )
