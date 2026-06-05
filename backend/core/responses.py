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
