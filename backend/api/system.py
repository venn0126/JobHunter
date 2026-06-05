from typing import Annotated, Any

from fastapi import APIRouter, Path, Request, Response

from api.health import health as health_handler
from api.task_helpers import ok_or_task_state
from api.version import version as version_handler
from core.responses import fail, ok
from schemas.common import ApiResponse
from schemas.system import SystemUpdateApplyRequest
from services.system_update_service import create_update_task, get_update_task, read_update_check

router = APIRouter(prefix="/system", tags=["system"])
TaskIdPath = Annotated[str, Path(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_.:-]+$")]


@router.get("/health")
def system_health(request: Request):
    return health_handler(request)


@router.get("/version")
def system_version(request: Request, response: Response):
    return version_handler(request, response)


@router.get("/update/check", response_model=ApiResponse[dict[str, Any]])
def check_update(request: Request):
    return ok(data=read_update_check().data, request=request)


@router.post("/update/apply", response_model=ApiResponse[dict[str, Any]])
def apply_update(payload: SystemUpdateApplyRequest, request: Request):
    result = create_update_task(channel=payload.channel, dry_run=payload.dry_run, target_version=payload.target_version)
    if result.status == "degraded":
        return fail(
            code="SERVICE_ERROR",
            message=result.message or "redis unavailable",
            request=request,
            status_code=503,
            data=result.data,
        )
    return ok(data=result.data, request=request)


@router.get("/update/status/{task_id}", response_model=ApiResponse[dict[str, Any]])
def update_status(task_id: TaskIdPath, request: Request):
    return ok_or_task_state(request, get_update_task(task_id), not_found_message="update task not found")
