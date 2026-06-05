from typing import Any

from fastapi import APIRouter, Query, Request

from api.write_helpers import ok_or_read_result, ok_or_resource_result, ok_or_write_result
from schemas.business import ItemListResponse
from schemas.common import ApiResponse
from schemas.write import VaultItemCreateRequest, VaultItemUpdateRequest
from services.vault_write_service import create_vault_item, delete_vault_item, get_vault_item, list_vault_items, update_vault_item

router = APIRouter(prefix="/vault", tags=["vault"])


@router.get("", response_model=ApiResponse[ItemListResponse])
def vault_items(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return ok_or_read_result(request, list_vault_items(page=page, page_size=page_size))


@router.get("/items/{item_id}", response_model=ApiResponse[dict[str, Any]])
def vault_item_detail(item_id: str, request: Request):
    return ok_or_resource_result(request, get_vault_item(item_id))


@router.post("/items", response_model=ApiResponse[dict[str, Any]])
def create_item(payload: VaultItemCreateRequest, request: Request):
    return ok_or_write_result(
        request,
        create_vault_item(
            item_type=payload.type,
            title=payload.title,
            summary=payload.summary,
            tags=payload.tags,
            skills=payload.skills,
            impact=payload.impact,
            star=payload.star.model_dump(),
        ),
    )


@router.patch("/items/{item_id}", response_model=ApiResponse[dict[str, Any]])
def update_item(item_id: str, payload: VaultItemUpdateRequest, request: Request):
    return ok_or_write_result(
        request,
        update_vault_item(
            item_id,
            item_type=payload.type,
            title=payload.title,
            summary=payload.summary,
            tags=payload.tags,
            skills=payload.skills,
            impact=payload.impact,
            star=payload.star.model_dump() if payload.star else None,
        ),
    )


@router.delete("/items/{item_id}", response_model=ApiResponse[dict[str, Any]])
def delete_item(item_id: str, request: Request):
    return ok_or_write_result(request, delete_vault_item(item_id))
