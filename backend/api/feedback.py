from typing import Any

from fastapi import APIRouter, Request

from api.write_helpers import ok_or_read_result, ok_or_write_result
from schemas.common import ApiResponse
from schemas.write import FeedbackPatchRequest, FeedbackUpsertRequest
from services.feedback_write_service import get_feedback_review, patch_feedback_record, upsert_feedback_record

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def feedback(request: Request):
    return ok_or_read_result(request, get_feedback_review())


@router.post("", response_model=ApiResponse[dict[str, Any]])
def create_feedback(payload: FeedbackUpsertRequest, request: Request):
    return ok_or_write_result(
        request,
        upsert_feedback_record(
            job_id=payload.job_id,
            resume_version_id=payload.resume_version_id,
            outcome=payload.outcome,
            notes=payload.notes,
            next_action=payload.next_action,
            feedback_tags=payload.feedback_tags,
        ),
    )


@router.patch("/{record_id}", response_model=ApiResponse[dict[str, Any]])
def patch_feedback(record_id: str, payload: FeedbackPatchRequest, request: Request):
    return ok_or_write_result(
        request,
        patch_feedback_record(
            record_id,
            outcome=payload.outcome,
            notes=payload.notes,
            next_action=payload.next_action,
            feedback_tags=payload.feedback_tags,
        ),
    )
