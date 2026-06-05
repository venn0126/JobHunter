from __future__ import annotations

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from services.result import ServiceResult


def commit_or_result(
    db: Session,
    *,
    conflict_message: str = "resource already exists",
    service_message: str = "database error",
) -> ServiceResult:
    try:
        db.commit()
        return ServiceResult(status="ok")
    except IntegrityError:
        db.rollback()
        return ServiceResult(status="conflict", message=conflict_message)
    except SQLAlchemyError as exc:
        db.rollback()
        return ServiceResult(status="degraded", message=f"{service_message}: {exc}")
