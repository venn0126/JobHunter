from typing import Annotated

from fastapi import APIRouter, Path, Query, Request

from api.task_helpers import ok_or_task_events, ok_or_task_state
from schemas.common import ApiResponse
from schemas.task import TaskEventsResponse, TaskStateResponse
from services.task_state_service import TASK_EVENT_MAX_LIMIT, RedisTaskStateStore

router = APIRouter(prefix="/tasks", tags=["tasks"])


TaskIdPath = Annotated[str, Path(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9_.:-]+$")]
EventLimitQuery = Annotated[int, Query(ge=1, le=TASK_EVENT_MAX_LIMIT)]


@router.get("/{task_id}", response_model=ApiResponse[TaskStateResponse])
def get_task_state(task_id: TaskIdPath, request: Request):
    return ok_or_task_state(request, RedisTaskStateStore().get_state(task_id))


@router.get("/{task_id}/events", response_model=ApiResponse[TaskEventsResponse])
def get_task_events(task_id: TaskIdPath, request: Request, limit: EventLimitQuery = 100):
    return ok_or_task_events(request, RedisTaskStateStore().list_events(task_id, limit=limit))
