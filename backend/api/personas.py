from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Request
from sqlalchemy.orm import Session

from core.dependencies import get_current_user_result, get_db
from core.responses import fail_from_status, ok
from schemas.common import ApiResponse
from schemas.persona import PersonaCreateRequest, PersonaListResponse, PersonaResponse, PersonaUpdateRequest
from services.persona_service import PersonaService
from services.result import ServiceResult

router = APIRouter(prefix="/personas", tags=["personas"])

PersonaIdPath = Annotated[str, Path(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_.:-]+$")]


@router.get("", response_model=ApiResponse[PersonaListResponse])
def list_personas(
    request: Request,
    current_user: ServiceResult = Depends(get_current_user_result),
    db: Session = Depends(get_db),
):
    if current_user.status != "ok":
        return fail_from_status(status=current_user.status, message=current_user.message, request=request)

    result = PersonaService(db).list_personas(current_user.data)
    return ok(data=result.data, request=request)


@router.post("", response_model=ApiResponse[PersonaResponse])
def create_persona(
    payload: PersonaCreateRequest,
    request: Request,
    current_user: ServiceResult = Depends(get_current_user_result),
    db: Session = Depends(get_db),
):
    if current_user.status != "ok":
        return fail_from_status(status=current_user.status, message=current_user.message, request=request)

    result = PersonaService(db).create_persona(
        current_user.data,
        name=payload.name,
        target_roles=payload.target_roles,
        core_skills=payload.core_skills,
        preferred_cities=payload.preferred_cities,
        salary_expectation=payload.salary_expectation,
    )
    if result.status != "created":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request, message="created")


@router.patch("/{persona_id}", response_model=ApiResponse[PersonaResponse])
def update_persona(
    persona_id: PersonaIdPath,
    payload: PersonaUpdateRequest,
    request: Request,
    current_user: ServiceResult = Depends(get_current_user_result),
    db: Session = Depends(get_db),
):
    if current_user.status != "ok":
        return fail_from_status(status=current_user.status, message=current_user.message, request=request)

    result = PersonaService(db).update_persona(
        current_user.data,
        persona_id,
        name=payload.name,
        target_roles=payload.target_roles,
        core_skills=payload.core_skills,
        preferred_cities=payload.preferred_cities,
        salary_expectation=payload.salary_expectation,
        status=payload.status,
    )
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request)


@router.post("/{persona_id}/activate", response_model=ApiResponse[PersonaListResponse])
def activate_persona(
    persona_id: PersonaIdPath,
    request: Request,
    current_user: ServiceResult = Depends(get_current_user_result),
    db: Session = Depends(get_db),
):
    if current_user.status != "ok":
        return fail_from_status(status=current_user.status, message=current_user.message, request=request)

    result = PersonaService(db).activate_persona(current_user.data, persona_id)
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request)
