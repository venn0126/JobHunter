from typing import Any, Literal

from fastapi import APIRouter, Query, Request

from api.demo_helpers import ok_or_demo_data_error, ok_or_demo_not_found
from schemas.business import ItemListResponse
from schemas.common import ApiResponse
from services.job_query_service import get_demo_job, query_demo_jobs

router = APIRouter(prefix="/jobs", tags=["jobs"])

PriorityQuery = Literal["P0", "P1", "P2"]
JobSortQuery = Literal["recommended", "match"]


@router.get("", response_model=ApiResponse[ItemListResponse])
def list_jobs(
    request: Request,
    city: str | None = Query(default=None, max_length=120),
    direction: str | None = Query(default=None, max_length=120),
    priority: PriorityQuery | None = None,
    source_site: str | None = Query(default=None, max_length=80),
    sort: JobSortQuery = "recommended",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return ok_or_demo_data_error(
        request=request,
        factory=lambda: query_demo_jobs(
            city=city,
            direction=direction,
            priority=priority,
            source_site=source_site,
            sort=sort,
            page=page,
            page_size=page_size,
        ),
    )


@router.get("/{job_id}", response_model=ApiResponse[dict[str, Any]])
def job_detail(job_id: str, request: Request):
    return ok_or_demo_not_found(
        request=request,
        factory=lambda: get_demo_job(job_id),
        not_found_message="job not found",
    )
