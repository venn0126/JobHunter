from typing import Any

from fastapi import APIRouter, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from services.mock_data_service import get_mock_bootstrap

router = APIRouter(prefix="/mock", tags=["mock"])


@router.get("/bootstrap", response_model=ApiResponse[dict[str, Any]])
def mock_bootstrap(request: Request):
    try:
        return ok(data=get_mock_bootstrap(), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="MOCK_DATA_ERROR", message=str(exc), request=request, status_code=500)
