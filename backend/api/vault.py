from typing import Any

from fastapi import APIRouter, Query, Request

from api.demo_helpers import ok_or_demo_data_error, ok_or_demo_not_found
from schemas.business import ItemListResponse
from schemas.common import ApiResponse
from services.demo_dataset_service import get_demo_item_by_id, read_demo_items
from services.pagination_service import paginate_items

router = APIRouter(prefix="/vault", tags=["vault"])


@router.get("", response_model=ApiResponse[ItemListResponse])
def vault_items(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return ok_or_demo_data_error(
        request=request,
        factory=lambda: paginate_items(read_demo_items("vault"), page=page, page_size=page_size),
    )


@router.get("/items/{item_id}", response_model=ApiResponse[dict[str, Any]])
def vault_item_detail(item_id: str, request: Request):
    return ok_or_demo_not_found(
        request=request,
        factory=lambda: get_demo_item_by_id("vault", item_id),
        not_found_message="vault item not found",
    )
