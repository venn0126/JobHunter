from fastapi import APIRouter, Request, Response

from api.health import health as health_handler
from api.version import version as version_handler

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health")
def system_health(request: Request):
    return health_handler(request)


@router.get("/version")
def system_version(request: Request, response: Response):
    return version_handler(request, response)
