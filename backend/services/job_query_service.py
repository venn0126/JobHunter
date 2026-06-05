from __future__ import annotations

from typing import Any, Literal

from services.demo_dataset_service import read_demo_items

JobSortKey = Literal["recommended", "match"]

PRIORITY_WEIGHT = {"P0": 3, "P1": 2, "P2": 1}
MAX_PAGE_SIZE = 100


def normalize_page(page: int) -> int:
    return max(1, page)


def normalize_page_size(page_size: int) -> int:
    return min(MAX_PAGE_SIZE, max(1, page_size))


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


def paginate_items(items: list[dict[str, Any]], *, page: int, page_size: int) -> dict[str, Any]:
    normalized_page = normalize_page(page)
    normalized_page_size = normalize_page_size(page_size)
    total = len(items)
    start = (normalized_page - 1) * normalized_page_size
    end = start + normalized_page_size
    return {
        "items": items[start:end],
        "pagination": {
            "page": normalized_page,
            "page_size": normalized_page_size,
            "total": total,
            "has_next": end < total,
        },
    }


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
