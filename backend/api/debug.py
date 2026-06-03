from fastapi import APIRouter, HTTPException

from core.config import get_settings

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/failure")
def debug_failure():
    if not get_settings().debug_routes_enabled:
        raise HTTPException(status_code=404, detail="debug route disabled")

    raise HTTPException(status_code=503, detail="validation api failure")
