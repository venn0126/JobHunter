from fastapi import APIRouter, Request

from core.config import get_settings
from core.responses import ok

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health(request: Request):
    settings = get_settings()
    return ok(
        data={
            "status": "ok",
            "app": settings.app_name,
            "version": settings.app_version,
            "data_mode": settings.data_mode,
        },
        request=request,
    )
