from fastapi import APIRouter, Request

from core.responses import ok
from services.version_service import read_version_info

router = APIRouter(prefix="/version", tags=["version"])


@router.get("")
def version(request: Request):
    return ok(data=read_version_info(), request=request)
