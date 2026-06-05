from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from core.auth_headers import bearer_token
from core.dependencies import get_current_user_result, get_db
from core.responses import fail_from_status, ok
from schemas.auth import (
    AuthSessionResponse,
    AuthUserResponse,
    LoginRequest,
    LogoutRequest,
    LogoutResponse,
    RefreshRequest,
    RegisterRequest,
    UpdateMeRequest,
)
from schemas.common import ApiResponse
from services.auth_service import AuthService, serialize_user
from services.result import ServiceResult

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=ApiResponse[AuthSessionResponse])
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    result = AuthService(db).register(name=payload.name, email=payload.email, password=payload.password)
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request)


@router.post("/login", response_model=ApiResponse[AuthSessionResponse])
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    result = AuthService(db).login(email=payload.email, password=payload.password)
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request)


@router.post("/refresh", response_model=ApiResponse[AuthSessionResponse])
def refresh(
    request: Request,
    payload: RefreshRequest | None = None,
    x_refresh_token: str | None = Header(default=None, alias="X-Refresh-Token"),
    db: Session = Depends(get_db),
):
    result = AuthService(db).refresh(x_refresh_token or (payload.refreshToken if payload else None))
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request)


@router.post("/logout", response_model=ApiResponse[LogoutResponse])
def logout(
    request: Request,
    payload: LogoutRequest | None = None,
    authorization: str | None = Header(default=None),
    x_refresh_token: str | None = Header(default=None, alias="X-Refresh-Token"),
    db: Session = Depends(get_db),
):
    result = AuthService(db).logout(bearer_token(authorization), x_refresh_token or (payload.refreshToken if payload else None))
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data={"logged_out": True}, request=request)


@router.get("/me", response_model=ApiResponse[AuthUserResponse])
def me(request: Request, current_user: ServiceResult = Depends(get_current_user_result)):
    if current_user.status != "ok":
        return fail_from_status(status=current_user.status, message=current_user.message, request=request)
    return ok(data=serialize_user(current_user.data), request=request)


@router.patch("/me", response_model=ApiResponse[AuthUserResponse])
def update_me(
    payload: UpdateMeRequest,
    request: Request,
    current_user: ServiceResult = Depends(get_current_user_result),
    db: Session = Depends(get_db),
):
    if current_user.status != "ok":
        return fail_from_status(status=current_user.status, message=current_user.message, request=request)

    result = AuthService(db).update_me(
        current_user.data,
        name=payload.name,
        email=payload.email,
        direction=payload.direction,
        target_city=payload.targetCity,
    )
    if result.status != "ok":
        return fail_from_status(status=result.status, message=result.message, request=request)
    return ok(data=result.data, request=request)
