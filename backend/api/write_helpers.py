from fastapi import Request

from core.responses import fail, ok


def ok_or_write_result(request: Request, result, *, exists_message: str = "already exists"):
    if result.status in {"stored", "hit", "ok"}:
        return ok(data=result.data, request=request)
    if result.status == "exists":
        return ok(data=result.data, request=request, message=result.message or exists_message)
    if result.status == "invalid":
        return fail(code="VALIDATION_ERROR", message=result.message or "invalid request", request=request, status_code=400)
    if result.status == "miss":
        return fail(code="RESOURCE_NOT_FOUND", message=result.message or "resource not found", request=request, status_code=404)
    if result.status == "conflict":
        return fail(code="CONFLICT", message=result.message or "conflict", request=request, status_code=409, data=result.data)
    if result.status == "degraded":
        return fail(code="SERVICE_ERROR", message=result.message or "service unavailable", request=request, status_code=503, data=result.data)
    return fail(code="SERVICE_ERROR", message=result.message or "request failed", request=request, status_code=500, data=result.data)


def ok_or_read_result(request: Request, result):
    if result.status in {"hit", "miss", "stored", "ok", "degraded"}:
        return ok(data=result.data, request=request)
    return fail(code="SERVICE_ERROR", message=result.message or "request failed", request=request, status_code=500, data=result.data)


def ok_or_resource_result(request: Request, result):
    if result.status in {"hit", "stored", "ok", "degraded"}:
        return ok(data=result.data, request=request)
    if result.status == "miss":
        return fail(code="RESOURCE_NOT_FOUND", message=result.message or "resource not found", request=request, status_code=404)
    if result.status == "invalid":
        return fail(code="VALIDATION_ERROR", message=result.message or "invalid request", request=request, status_code=400)
    return fail(code="SERVICE_ERROR", message=result.message or "request failed", request=request, status_code=500, data=result.data)
