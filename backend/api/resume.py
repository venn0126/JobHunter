from typing import Any

from fastapi import APIRouter, Query, Request

from core.responses import fail, ok
from schemas.common import ApiResponse
from services.demo_dataset_service import read_demo_dataset, read_demo_items

router = APIRouter(tags=["resume"])


@router.get("/resume-lab", response_model=ApiResponse[dict[str, Any]])
def resume_lab(request: Request):
    try:
        return ok(data=read_demo_dataset("resumeLab"), request=request)
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)


@router.get("/resumes/versions", response_model=ApiResponse[dict[str, Any]])
def resume_versions(request: Request):
    try:
        lab = read_demo_dataset("resumeLab")
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)
    return ok(data={"items": lab.get("versions", []), "summary": lab.get("summary", {})}, request=request)


@router.get("/resumes/{resume_id}/profile", response_model=ApiResponse[dict[str, Any]])
def resume_profile(resume_id: str, request: Request):
    try:
        lab = read_demo_dataset("resumeLab")
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)

    version = next((item for item in lab.get("versions", []) if item.get("id") == resume_id), None)
    if not version:
        return fail(code="RESOURCE_NOT_FOUND", message="resume profile not found", request=request, status_code=404)
    return ok(
        data={
            "id": version["id"],
            "name": version["name"],
            "best_for": version.get("best_for", []),
            "strengths": version.get("strengths", []),
            "improvement_tips": version.get("improvement_tips", []),
            "recommendation": version.get("recommendation", ""),
        },
        request=request,
    )


@router.get("/resume-lab/compare", response_model=ApiResponse[dict[str, Any]])
def resume_lab_compare(
    request: Request,
    version_ids: list[str] = Query(default_factory=list, alias="version_id"),
):
    try:
        versions = read_demo_dataset("resumeLab").get("versions", [])
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)

    selected = [version for version in versions if not version_ids or version.get("id") in version_ids]
    return ok(data={"items": selected[:2]}, request=request)


@router.get("/resume-studio", response_model=ApiResponse[dict[str, Any]])
def resume_studio(request: Request, job_id: str | None = Query(default=None, max_length=120)):
    try:
        drafts = read_demo_items("resumeStudio")
    except (FileNotFoundError, ValueError) as exc:
        return fail(code="DEMO_DATA_ERROR", message=str(exc), request=request, status_code=500)

    draft = next((item for item in drafts if item.get("job_id") == job_id), None) if job_id else None
    return ok(data=draft or (drafts[0] if drafts else {}), request=request)
