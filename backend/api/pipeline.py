from typing import Any

from fastapi import APIRouter, Request

from api.write_helpers import ok_or_read_result, ok_or_write_result
from schemas.common import ApiResponse
from schemas.write import PipelineCardCreateRequest, PipelineCardUpdateRequest
from services.pipeline_write_service import add_pipeline_card, read_pipeline, update_pipeline_card

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def pipeline(request: Request):
    return ok_or_read_result(request, read_pipeline())


@router.post("/cards", response_model=ApiResponse[dict[str, Any]])
def create_pipeline_card(payload: PipelineCardCreateRequest, request: Request):
    result = add_pipeline_card(payload.job_id, status=payload.status, next_action=payload.next_action)
    return ok_or_write_result(request, result, exists_message="pipeline card already exists")


@router.patch("/cards/{job_id}", response_model=ApiResponse[dict[str, Any]])
def patch_pipeline_card(job_id: str, payload: PipelineCardUpdateRequest, request: Request):
    result = update_pipeline_card(job_id, status=payload.status, next_action=payload.next_action, notes=payload.notes)
    return ok_or_write_result(request, result)
