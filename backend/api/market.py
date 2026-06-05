from typing import Any

from fastapi import APIRouter, Query, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from schemas.business import ItemListResponse
from services.demo_dataset_service import read_demo_dataset
from services.job_query_service import get_jobs_by_direction

router = APIRouter(prefix="/market", tags=["market"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def market(request: Request):
    try:
        return ok(data=read_demo_dataset("market"), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)


@router.get("/directions/{direction_id}/jobs", response_model=ApiResponse[ItemListResponse])
def market_direction_jobs(
    direction_id: str,
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    try:
        return ok(data=get_jobs_by_direction(direction_id, page=page, page_size=page_size), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)
