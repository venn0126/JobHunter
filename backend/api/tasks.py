from fastapi import APIRouter, Request

from core.responses import fail, ok
from services.task_state_service import RedisTaskStateStore

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/{task_id}")
def get_task_state(task_id: str, request: Request):
    result = RedisTaskStateStore().get_state(task_id)
    if result.status == "miss":
        return fail(code="RESOURCE_NOT_FOUND", message="task not found", request=request, status_code=404)
    if result.status == "degraded":
        return fail(code="SERVICE_ERROR", message=result.message or "redis unavailable", request=request, status_code=503)
    return ok(data=result.data, request=request)


@router.get("/{task_id}/events")
def get_task_events(task_id: str, request: Request, limit: int = 100):
    result = RedisTaskStateStore().list_events(task_id, limit=limit)
    if result.status == "degraded":
        return fail(code="SERVICE_ERROR", message=result.message or "redis unavailable", request=request, status_code=503, data=[])
    return ok(data={"items": result.data}, request=request)
