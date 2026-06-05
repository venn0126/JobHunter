from typing import Any

from fastapi import APIRouter, Query, Request

from api.demo_helpers import ok_or_demo_data_error, ok_or_demo_not_found
from api.write_helpers import ok_or_write_result
from core.config import get_settings
from schemas.common import ApiResponse
from schemas.write import ResumeVersionCreateRequest
from services.resume_ingest_service import create_demo_resume_version, parse_resume_upload_body
from services.resume_version_write_service import create_resume_version
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
    return ok_or_demo_data_error(request=request, factory=lambda: list_resume_versions(page=page, page_size=page_size))


@router.post("/resumes/versions", response_model=ApiResponse[dict[str, Any]])
def create_version(payload: ResumeVersionCreateRequest, request: Request):
    return ok_or_write_result(
        request,
        create_resume_version(
            name=payload.name,
            job_id=payload.job_id,
            sections=payload.sections,
            content=payload.content,
        ),
    )


@router.post("/resumes/upload", response_model=ApiResponse[dict[str, Any]])
async def upload_resume(request: Request):
    content = await read_limited_body(request, get_settings().resume_upload_max_bytes + 1)
    return ok_or_write_result(
        request,
        parse_resume_upload_body(
            content_type=request.headers.get("content-type", ""),
            body=content,
        ),
    )


@router.post("/resumes/demo", response_model=ApiResponse[dict[str, Any]])
def load_demo_resume(request: Request):
    return ok_or_write_result(request, create_demo_resume_version())


async def read_limited_body(request: Request, limit_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    async for chunk in request.stream():
        total += len(chunk)
        chunks.append(chunk)
        if total > limit_bytes:
            break
    return b"".join(chunks)


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
