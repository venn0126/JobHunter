from fastapi import APIRouter

from api import demo, health, version

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(version.router)
api_router.include_router(demo.router)
