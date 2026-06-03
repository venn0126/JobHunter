from fastapi import APIRouter, Request, Response

from core.cache import NO_CACHE_HEADERS
from core.responses import ok
from services.version_service import read_version_info

router = APIRouter(prefix="/version", tags=["version"])


@router.get("")
def version(request: Request, response: Response):
    response.headers.update(NO_CACHE_HEADERS)
    return ok(data=read_version_info(), request=request)
