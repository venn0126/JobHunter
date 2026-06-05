from __future__ import annotations

from typing import Any, Literal

from services.demo_dataset_service import read_demo_items
from services.pagination_service import paginate_items

JobSortKey = Literal["recommended", "match"]

PRIORITY_WEIGHT = {"P0": 3, "P1": 2, "P2": 1}


def job_matches(job: dict[str, Any], *, city: str | None, direction: str | None, priority: str | None, source_site: str | None) -> bool:
    source = job.get("source") or {}
    return (
        (not city or job.get("city") == city)
        and (not direction or job.get("direction") == direction)
        and (not priority or job.get("priority") == priority)
        and (not source_site or source.get("source_site") == source_site)
    )


def sort_jobs(jobs: list[dict[str, Any]], sort: JobSortKey) -> list[dict[str, Any]]:
    if sort == "match":
        return sorted(jobs, key=lambda job: job.get("match", 0), reverse=True)

    return sorted(
        jobs,
        key=lambda job: (PRIORITY_WEIGHT.get(job.get("priority"), 0), job.get("match", 0)),
        reverse=True,
    )


def query_demo_jobs(
    *,
    city: str | None = None,
    direction: str | None = None,
    priority: str | None = None,
    source_site: str | None = None,
    sort: JobSortKey = "recommended",
    page: int = 1,
    page_size: int = 20,
) -> dict[str, Any]:
    jobs = [
        job
        for job in read_demo_items("jobs")
        if job_matches(job, city=city, direction=direction, priority=priority, source_site=source_site)
    ]
    return paginate_items(sort_jobs(jobs, sort), page=page, page_size=page_size)


def get_demo_job(job_id: str) -> dict[str, Any] | None:
    return next((job for job in read_demo_items("jobs") if job.get("id") == job_id), None)


def get_jobs_by_direction(direction_id: str, *, page: int = 1, page_size: int = 20) -> dict[str, Any]:
    return query_demo_jobs(direction=direction_id, page=page, page_size=page_size)
