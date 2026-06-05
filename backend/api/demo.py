from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from core.dependencies import get_db
from core.responses import fail, ok
from schemas.common import ApiResponse
from schemas.demo import DemoResetResponse, DemoSummaryResponse
from services.demo_seed_service import seed_demo_identity
from services.mock_data_service import get_demo_summary

router = APIRouter(prefix="/demo", tags=["demo"])


@router.get("/summary", response_model=ApiResponse[DemoSummaryResponse])
def demo_summary(request: Request):
    try:
        return ok(data=get_demo_summary(), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="MOCK_DATA_ERROR", message=str(exc), request=request, status_code=500)


@router.post("/reset", response_model=ApiResponse[DemoResetResponse])
def demo_reset(request: Request, db: Session = Depends(get_db)):
    try:
        result = seed_demo_identity(db)
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        return fail(code="DEMO_RESET_ERROR", message=str(exc), request=request, status_code=500)

    return ok(
        data={
            "reset": True,
            "demo_user_id": result["demo_user_id"],
            "active_persona_id": result["active_persona_id"],
            "personas_created": result["personas_created"],
            "personas_deleted": result["personas_deleted"],
        },
        request=request,
    )
