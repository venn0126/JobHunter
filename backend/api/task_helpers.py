from fastapi import Request

from core.responses import fail, ok


def ok_or_task_state(request: Request, result, *, not_found_message: str = "task not found"):
    if result.status == "miss":
        return fail(code="RESOURCE_NOT_FOUND", message=not_found_message, request=request, status_code=404)
    if result.status == "degraded":
        return fail(code="SERVICE_ERROR", message=result.message or "redis unavailable", request=request, status_code=503)
    return ok(data=result.data, request=request)


def ok_or_task_events(request: Request, result):
    if result.status == "degraded":
        return fail(
            code="SERVICE_ERROR",
            message=result.message or "redis unavailable",
            request=request,
            status_code=503,
            data=[],
        )
    return ok(data={"items": result.data}, request=request)
