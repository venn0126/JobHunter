from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from core.cache import IMMUTABLE_ASSET_HEADERS, NO_CACHE_HEADERS
from core.responses import fail


class ImmutableAssetsStaticFiles(StaticFiles):
    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers.update(IMMUTABLE_ASSET_HEADERS)
        return response


def is_api_path(full_path: str, api_prefix: str) -> bool:
    normalized_prefix = api_prefix.strip("/")
    return full_path == normalized_prefix or full_path.startswith(f"{normalized_prefix}/")


def mount_frontend(app: FastAPI, frontend_dist: Path, api_prefix: str = "/api") -> None:
    if not frontend_dist.exists():
        return

    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", ImmutableAssetsStaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(request: Request, full_path: str):
        if is_api_path(full_path, api_prefix):
            return fail(code="RESOURCE_NOT_FOUND", message="api endpoint not found", request=request, status_code=404)

        requested_file = frontend_dist / full_path
        if full_path and requested_file.is_file():
            if requested_file.name == "version.json":
                return FileResponse(requested_file, headers=NO_CACHE_HEADERS)
            return FileResponse(requested_file)
        return FileResponse(frontend_dist / "index.html", headers=NO_CACHE_HEADERS)
