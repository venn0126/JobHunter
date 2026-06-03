from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

NO_CACHE_HEADERS = {"Cache-Control": "no-store, no-cache, must-revalidate"}


def mount_frontend(app: FastAPI, frontend_dist: Path) -> None:
    if not frontend_dist.exists():
        return

    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        requested_file = frontend_dist / full_path
        if full_path and requested_file.is_file():
            if requested_file.name == "version.json":
                return FileResponse(requested_file, headers=NO_CACHE_HEADERS)
            return FileResponse(requested_file)
        return FileResponse(frontend_dist / "index.html", headers=NO_CACHE_HEADERS)
