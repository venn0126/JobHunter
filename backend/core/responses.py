from uuid import uuid4

from fastapi import Request
from fastapi.responses import JSONResponse


def ok(*, data, request: Request, message: str = "ok"):
    return {
        "success": True,
        "code": "OK",
        "message": message,
        "data": data,
        "request_id": request.headers.get("X-Request-ID", str(uuid4())),
    }


def fail(*, code: str, message: str, request: Request, status_code: int = 400, data=None):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "code": code,
            "message": message,
            "data": data,
            "request_id": request.headers.get("X-Request-ID", str(uuid4())),
        },
    )


def fail_from_status(*, status: str, message: str | None, request: Request, data=None):
    status_map = {
        "invalid": (400, "VALIDATION_ERROR"),
        "unauthorized": (401, "UNAUTHORIZED"),
        "forbidden": (403, "FORBIDDEN"),
        "miss": (404, "RESOURCE_NOT_FOUND"),
        "conflict": (409, "CONFLICT"),
        "degraded": (503, "SERVICE_ERROR"),
    }
    status_code, code = status_map.get(status, (500, "SERVICE_ERROR"))
    return fail(
        code=code,
        message=message or "request failed",
        request=request,
        status_code=status_code,
        data=data,
    )
