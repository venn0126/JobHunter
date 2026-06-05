from typing import Annotated

from fastapi import APIRouter, Path, Query, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from schemas.task import TaskEventsResponse, TaskStateResponse
from services.task_state_service import TASK_EVENT_MAX_LIMIT, RedisTaskStateStore

router = APIRouter(prefix="/tasks", tags=["tasks"])


TaskIdPath = Annotated[str, Path(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_.:-]+$")]
EventLimitQuery = Annotated[int, Query(ge=1, le=TASK_EVENT_MAX_LIMIT)]


@router.get("/{task_id}", response_model=ApiResponse[TaskStateResponse])
def get_task_state(task_id: TaskIdPath, request: Request):
    result = RedisTaskStateStore().get_state(task_id)
    if result.status == "miss":
        return fail(code="RESOURCE_NOT_FOUND", message="task not found", request=request, status_code=404)
    if result.status == "degraded":
        return fail(code="SERVICE_ERROR", message=result.message or "redis unavailable", request=request, status_code=503)
    return ok(data=result.data, request=request)


@router.get("/{task_id}/events", response_model=ApiResponse[TaskEventsResponse])
def get_task_events(task_id: TaskIdPath, request: Request, limit: EventLimitQuery = 100):
    result = RedisTaskStateStore().list_events(task_id, limit=limit)
    if result.status == "degraded":
        return fail(code="SERVICE_ERROR", message=result.message or "redis unavailable", request=request, status_code=503, data=[])
    return ok(data={"items": result.data}, request=request)
