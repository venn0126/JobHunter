from fastapi import APIRouter, Query, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from schemas.generated import GeneratedResponse, InterviewStartRequest, TailorRunRequest
from services.generated_content_service import GeneratedContentService

router = APIRouter(tags=["generated"])


def ok_or_generation_result(request: Request, result):
    if result.status == "miss":
        return fail(code="RESOURCE_NOT_FOUND", message=result.message or "resource not found", request=request, status_code=404)
    if result.status == "failed":
        return fail(code="TASK_FAILED", message=result.message or "generation failed", request=request, status_code=500)
    return ok(data=result.data, request=request)


@router.get("/jobs/{job_id}/decision", response_model=ApiResponse[GeneratedResponse])
def job_decision(
    job_id: str,
    request: Request,
    force_refresh: bool = Query(default=False),
):
    result = GeneratedContentService().decision_card(job_id, force_refresh=force_refresh)
    return ok_or_generation_result(request, result)


@router.get("/jobs/{job_id}/recruiter-lens", response_model=ApiResponse[GeneratedResponse])
def job_recruiter_lens(
    job_id: str,
    request: Request,
    force_refresh: bool = Query(default=False),
):
    result = GeneratedContentService().recruiter_lens(job_id, force_refresh=force_refresh)
    return ok_or_generation_result(request, result)


@router.get("/decisions", response_model=ApiResponse[GeneratedResponse])
def decisions(
    request: Request,
    force_refresh: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    result = GeneratedContentService().decision_list(page=page, page_size=page_size, force_refresh=force_refresh)
    return ok_or_generation_result(request, result)


@router.post("/tailor/run", response_model=ApiResponse[GeneratedResponse])
def tailor_run(payload: TailorRunRequest, request: Request):
    result = GeneratedContentService().tailored_resume(payload.job_id, force_refresh=payload.force_refresh)
    return ok_or_generation_result(request, result)


@router.post("/interview/start", response_model=ApiResponse[GeneratedResponse])
def interview_start(payload: InterviewStartRequest, request: Request):
    result = GeneratedContentService().interview_guide(payload.job_id, force_refresh=payload.force_refresh)
    return ok_or_generation_result(request, result)


@router.get("/interview/cards", response_model=ApiResponse[GeneratedResponse])
def interview_cards(
    request: Request,
    job_id: str = Query(min_length=1, max_length=120),
    force_refresh: bool = Query(default=False),
):
    result = GeneratedContentService().interview_guide(job_id, force_refresh=force_refresh)
    return ok_or_generation_result(request, result)
