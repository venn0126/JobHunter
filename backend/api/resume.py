from typing import Any

from fastapi import APIRouter, Query, Request

from api.demo_helpers import ok_or_demo_data_error, ok_or_demo_not_found
from schemas.common import ApiResponse
from services.resume_query_service import (
    compare_resume_versions,
    get_resume_lab,
    get_resume_profile,
    get_resume_studio_draft,
    list_resume_versions,
)

router = APIRouter(tags=["resume"])


@router.get("/resume-lab", response_model=ApiResponse[dict[str, Any]])
def resume_lab(request: Request):
    return ok_or_demo_data_error(request=request, factory=get_resume_lab)


@router.get("/resumes/versions", response_model=ApiResponse[dict[str, Any]])
def resume_versions(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return ok_or_demo_data_error(
        request=request,
        factory=lambda: list_resume_versions(page=page, page_size=page_size),
    )


@router.get("/resumes/{resume_id}/profile", response_model=ApiResponse[dict[str, Any]])
def resume_profile(resume_id: str, request: Request):
    return ok_or_demo_not_found(
        request=request,
        factory=lambda: get_resume_profile(resume_id),
        not_found_message="resume profile not found",
    )


@router.get("/resume-lab/compare", response_model=ApiResponse[dict[str, Any]])
def resume_lab_compare(
    request: Request,
    version_ids: list[str] = Query(default_factory=list, alias="version_id"),
):
    return ok_or_demo_data_error(request=request, factory=lambda: compare_resume_versions(version_ids))


@router.get("/resume-studio", response_model=ApiResponse[dict[str, Any]])
def resume_studio(request: Request, job_id: str | None = Query(default=None, max_length=120)):
    return ok_or_demo_data_error(request=request, factory=lambda: get_resume_studio_draft(job_id))
