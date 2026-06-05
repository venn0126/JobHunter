from collections.abc import Callable
from typing import Any

from fastapi import Request

from core.responses import fail, ok

DEMO_DATA_EXCEPTIONS = (FileNotFoundError, ValueError)


def demo_data_fail(exc: Exception, request: Request):
    return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)


def ok_or_demo_data_error(*, request: Request, factory: Callable[[], Any]):
    try:
        return ok(data=factory(), request=request)
    except DEMO_DATA_EXCEPTIONS as exc:
        return demo_data_fail(exc, request)


def ok_or_demo_not_found(*, request: Request, factory: Callable[[], Any | None], not_found_message: str):
    try:
        data = factory()
    except DEMO_DATA_EXCEPTIONS as exc:
        return demo_data_fail(exc, request)
    if data is None:
        return fail(code="RESOURCE_NOT_FOUND", message=not_found_message, request=request, status_code=404)
    return ok(data=data, request=request)
