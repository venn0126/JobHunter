from typing import Any

from fastapi import APIRouter, Request

from core.responses import fail, ok
from schemas.business import ItemListResponse
from schemas.common import ApiResponse
from services.demo_dataset_service import read_demo_items

router = APIRouter(prefix="/vault", tags=["vault"])


@router.get("", response_model=ApiResponse[ItemListResponse])
def vault_items(request: Request):
    try:
        return ok(data={"items": read_demo_items("vault"), "pagination": None}, request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)


@router.get("/items/{item_id}", response_model=ApiResponse[dict[str, Any]])
def vault_item_detail(item_id: str, request: Request):
    try:
        item = next((record for record in read_demo_items("vault") if record.get("id") == item_id), None)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)
    if not item:
        return fail(code="RESOURCE_NOT_FOUND", message="vault item not found", request=request, status_code=404)
    return ok(data=item, request=request)
