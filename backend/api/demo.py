from fastapi import APIRouter, Request

from core.responses import ok
from services.mock_data_service import get_demo_summary

router = APIRouter(prefix="/demo", tags=["demo"])


@router.get("/summary")
def demo_summary(request: Request):
    return ok(data=get_demo_summary(), request=request)
