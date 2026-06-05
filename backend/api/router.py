from fastapi import APIRouter

from api import auth, dashboard, debug, demo, health, jobs, market, mock, personas, pipeline, resume, sprint, system, tasks, vault, version

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(version.router)
api_router.include_router(demo.router)
api_router.include_router(debug.router)
api_router.include_router(system.router)
api_router.include_router(tasks.router)
api_router.include_router(auth.router)
api_router.include_router(personas.router)
api_router.include_router(mock.router)
api_router.include_router(dashboard.router)
api_router.include_router(market.router)
api_router.include_router(jobs.router)
api_router.include_router(vault.router)
api_router.include_router(resume.router)
api_router.include_router(sprint.router)
api_router.include_router(pipeline.router)
