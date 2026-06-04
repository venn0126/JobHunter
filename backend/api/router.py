from fastapi import APIRouter

from api import debug, demo, health, system, version

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(version.router)
api_router.include_router(demo.router)
api_router.include_router(debug.router)
api_router.include_router(system.router)
