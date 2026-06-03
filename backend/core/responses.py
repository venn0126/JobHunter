from uuid import uuid4

from fastapi import Request


def ok(*, data, request: Request, message: str = "ok"):
    return {
        "success": True,
        "code": "OK",
        "message": message,
        "data": data,
        "request_id": request.headers.get("X-Request-ID", str(uuid4())),
    }
