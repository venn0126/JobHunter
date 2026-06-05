from typing import Any

from fastapi import APIRouter, Request

from api.demo_helpers import ok_or_demo_data_error
from schemas.common import ApiResponse
from services.demo_dataset_service import read_demo_dataset

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def dashboard(request: Request):
    return ok_or_demo_data_error(request=request, factory=lambda: read_demo_dataset("dashboard"))
