from typing import Any

from fastapi import APIRouter, Request

from api.demo_helpers import ok_or_demo_data_error
from schemas.common import ApiResponse
from services.demo_dataset_service import build_demo_pipeline

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def pipeline(request: Request):
    return ok_or_demo_data_error(request=request, factory=build_demo_pipeline)
