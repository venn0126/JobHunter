from __future__ import annotations

from typing import Any

from services.demo_dataset_service import read_demo_dataset, read_demo_items
from services.pagination_service import paginate_items


def get_resume_lab() -> dict[str, Any]:
    return read_demo_dataset("resumeLab")


def list_resume_versions(*, page: int = 1, page_size: int = 20) -> dict[str, Any]:
    lab = get_resume_lab()
    paginated = paginate_items(lab.get("versions", []), page=page, page_size=page_size)
    return {**paginated, "summary": lab.get("summary", {})}


def find_resume_version(resume_id: str) -> dict[str, Any] | None:
    return next((item for item in get_resume_lab().get("versions", []) if item.get("id") == resume_id), None)


def get_resume_profile(resume_id: str) -> dict[str, Any] | None:
    version = find_resume_version(resume_id)
    if not version:
        return None
    return {
        "id": version["id"],
        "name": version["name"],
        "best_for": version.get("best_for", []),
        "strengths": version.get("strengths", []),
        "improvement_tips": version.get("improvement_tips", []),
        "recommendation": version.get("recommendation", ""),
    }


def compare_resume_versions(version_ids: list[str]) -> dict[str, Any]:
    versions = get_resume_lab().get("versions", [])
    selected = [version for version in versions if not version_ids or version.get("id") in version_ids]
    return {"items": selected[:2]}


def get_resume_studio_draft(job_id: str | None = None) -> dict[str, Any]:
    drafts = read_demo_items("resumeStudio")
    draft = next((item for item in drafts if item.get("job_id") == job_id), None) if job_id else None
    return draft or (drafts[0] if drafts else {})
