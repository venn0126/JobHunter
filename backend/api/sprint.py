from typing import Any

from fastapi import APIRouter, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from services.demo_dataset_service import read_demo_dataset

router = APIRouter(prefix="/sprint", tags=["sprint"])


@router.get("", response_model=ApiResponse[dict[str, Any]])
def sprint(request: Request):
    try:
        return ok(data=read_demo_dataset("sprint"), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)
