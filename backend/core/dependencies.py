from collections.abc import Generator

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from core.auth_headers import bearer_token
from core.db import SessionLocal
from services.auth_service import AuthService
from services.result import ServiceResult


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_result(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> ServiceResult:
    return AuthService(db).get_user_by_token(bearer_token(authorization))
