from __future__ import annotations

from typing import Any, Literal

from core.ids import new_public_id
from services.demo_write_state_service import read_vault_state, write_blocked_by_degraded_state, write_vault_state
from services.demo_dataset_service import read_demo_items
from services.pagination_service import paginate_items
from services.result import ServiceResult
from services.task_state_service import utc_now
from services.text_normalization_service import normalize_text_list

VaultItemType = Literal["project", "skill", "story", "certificate"]


def normalize_vault_payload(payload: dict[str, Any]) -> dict[str, Any]:
    items = payload.get("items", [])
    deleted_item_ids = payload.get("deleted_item_ids", [])
    return {
        "deleted_item_ids": deleted_item_ids if isinstance(deleted_item_ids, list) else [],
        "items": items if isinstance(items, list) else [],
    }


def merge_with_demo_vault_items(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = normalize_vault_payload(payload)
    deleted_ids = {item_id for item_id in normalized["deleted_item_ids"] if isinstance(item_id, str)}
    items_by_id = {
        item.get("id"): item
        for item in read_demo_items("vault")
        if isinstance(item, dict) and item.get("id") not in deleted_ids
    }
    for item in normalized["items"]:
        item_id = item.get("id") if isinstance(item, dict) else None
        if item_id and item_id not in deleted_ids:
            items_by_id[item_id] = item
    return {
        "deleted_item_ids": list(deleted_ids),
        "items": list(items_by_id.values()),
    }


def list_vault_items(*, page: int = 1, page_size: int = 20) -> ServiceResult:
    result = read_vault_state()
    payload = merge_with_demo_vault_items(result.data)
    return ServiceResult(status=result.status, data=paginate_items(payload["items"], page=page, page_size=page_size), message=result.message)


def get_vault_item(item_id: str) -> ServiceResult:
    result = read_vault_state()
    payload = merge_with_demo_vault_items(result.data)
    item = next((entry for entry in payload["items"] if entry.get("id") == item_id), None)
    if not item:
        return ServiceResult(status="miss", message="vault item not found")
    return ServiceResult(status="hit", data=item, message=result.message)


def build_vault_item(
    *,
    item_type: str,
    title: str,
    summary: str,
    tags: list[str] | None,
    skills: list[str] | None,
    impact: str,
    star: dict[str, str] | None,
    item_id: str | None = None,
) -> dict[str, Any]:
    now = utc_now()
    return {
        "id": item_id or new_public_id("ev"),
        "type": item_type,
        "title": title.strip(),
        "summary": summary.strip(),
        "tags": normalize_text_list(tags, limit=20),
        "skills": normalize_text_list(skills, limit=30),
        "impact": impact.strip(),
        "star": {
            "situation": (star or {}).get("situation", "").strip(),
            "task": (star or {}).get("task", "").strip(),
            "action": (star or {}).get("action", "").strip(),
            "result": (star or {}).get("result", "").strip(),
        },
        "updated_at": now,
    }


def create_vault_item(
    *,
    item_type: str,
    title: str,
    summary: str,
    tags: list[str] | None = None,
    skills: list[str] | None = None,
    impact: str = "",
    star: dict[str, str] | None = None,
) -> ServiceResult:
    if item_type not in {"project", "skill", "story", "certificate"}:
        return ServiceResult(status="invalid", message="invalid vault item type")
    if not title.strip():
        return ServiceResult(status="invalid", message="vault item title is required")

    state_result = read_vault_state()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result
    payload = normalize_vault_payload(state_result.data)
    item = build_vault_item(
        item_type=item_type,
        title=title,
        summary=summary,
        tags=tags,
        skills=skills,
        impact=impact,
        star=star,
    )
    payload["items"] = [item, *payload["items"]]
    write_result = write_vault_state(payload)
    return ServiceResult(status=write_result.status, data=item, message=write_result.message)


def update_vault_item(
    item_id: str,
    *,
    item_type: str | None = None,
    title: str | None = None,
    summary: str | None = None,
    tags: list[str] | None = None,
    skills: list[str] | None = None,
    impact: str | None = None,
    star: dict[str, str] | None = None,
) -> ServiceResult:
    state_result = read_vault_state()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result
    payload = merge_with_demo_vault_items(state_result.data)
    item = next((entry for entry in payload["items"] if entry.get("id") == item_id), None)
    if not item:
        return ServiceResult(status="miss", message="vault item not found")
    if item_type is not None:
        if item_type not in {"project", "skill", "story", "certificate"}:
            return ServiceResult(status="invalid", message="invalid vault item type")
        item["type"] = item_type
    if title is not None:
        if not title.strip():
            return ServiceResult(status="invalid", message="vault item title is required")
        item["title"] = title.strip()
    if summary is not None:
        item["summary"] = summary.strip()
    if tags is not None:
        item["tags"] = normalize_text_list(tags, limit=20)
    if skills is not None:
        item["skills"] = normalize_text_list(skills, limit=30)
    if impact is not None:
        item["impact"] = impact.strip()
    if star is not None:
        item["star"] = {
            "situation": star.get("situation", "").strip(),
            "task": star.get("task", "").strip(),
            "action": star.get("action", "").strip(),
            "result": star.get("result", "").strip(),
        }
    item["updated_at"] = utc_now()

    write_result = write_vault_state(payload)
    return ServiceResult(status=write_result.status, data=item, message=write_result.message)


def delete_vault_item(item_id: str) -> ServiceResult:
    state_result = read_vault_state()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result
    payload = merge_with_demo_vault_items(state_result.data)
    next_items = [entry for entry in payload["items"] if entry.get("id") != item_id]
    if len(next_items) == len(payload["items"]):
        return ServiceResult(status="miss", message="vault item not found")
    payload["items"] = next_items
    payload["deleted_item_ids"] = [*payload["deleted_item_ids"], item_id]
    write_result = write_vault_state(payload)
    return ServiceResult(status=write_result.status, data={"deleted": True, "id": item_id}, message=write_result.message)
