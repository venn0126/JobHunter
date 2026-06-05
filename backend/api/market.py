from typing import Any

from fastapi import APIRouter, Query, Request

from api.demo_helpers import ok_or_demo_data_error
from schemas.common import ApiResponse
from schemas.business import ItemListResponse
from services.demo_dataset_service import read_demo_dataset
from services.job_query_service import get_jobs_by_direction

router = APIRouter(prefix="/market", tags=["market"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def market(request: Request):
    return ok_or_demo_data_error(request=request, factory=lambda: read_demo_dataset("market"))


@router.get("/directions/{direction_id}/jobs", response_model=ApiResponse[ItemListResponse])
def market_direction_jobs(
    direction_id: str,
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return ok_or_demo_data_error(
        request=request,
        factory=lambda: get_jobs_by_direction(direction_id, page=page, page_size=page_size),
    )
