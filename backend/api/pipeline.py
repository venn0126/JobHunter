from typing import Any

from fastapi import APIRouter, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from services.demo_dataset_service import build_demo_pipeline

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def pipeline(request: Request):
    try:
        return ok(data=build_demo_pipeline(), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)
