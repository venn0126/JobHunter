from typing import Any

from fastapi import APIRouter, Query, Request

from api.demo_helpers import ok_or_demo_data_error
from api.write_helpers import ok_or_read_result, ok_or_write_result
from schemas.common import ApiResponse
from schemas.business import ItemListResponse
from services.demo_write_state_service import read_market_state
from services.job_query_service import get_jobs_by_direction
from services.market_preference_service import apply_direction_preference, update_direction_favorite

router = APIRouter(prefix="/market", tags=["market"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def market(request: Request):
    return ok_or_read_result(request, read_market_state())


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


@router.post("/directions/{direction_id}/favorite", response_model=ApiResponse[dict[str, Any]])
def favorite_market_direction(direction_id: str, request: Request):
    return ok_or_write_result(request, update_direction_favorite(direction_id))


@router.post("/directions/{direction_id}/apply-preference", response_model=ApiResponse[dict[str, Any]])
def apply_market_direction_preference(direction_id: str, request: Request):
    return ok_or_write_result(request, apply_direction_preference(direction_id))
