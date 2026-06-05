from __future__ import annotations

from copy import deepcopy
from typing import Any

from services.demo_write_state_service import (
    read_market_state,
    write_blocked_by_degraded_state,
    write_market_state,
)
from services.result import ServiceResult
from services.task_state_service import utc_now


def normalize_market_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = deepcopy(payload) if isinstance(payload, dict) else {}
    normalized.setdefault("preferences", {})
    normalized.setdefault("favorites", [])
    return normalized


def update_direction_favorite(direction_id: str) -> ServiceResult:
    normalized_direction_id = direction_id.strip()
    if not normalized_direction_id:
        return ServiceResult(status="invalid", message="direction id is required")

    state_result = read_market_state()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result

    payload = normalize_market_payload(state_result.data)
    favorites = payload.get("favorites", [])
    if not isinstance(favorites, list):
        favorites = []
    if normalized_direction_id not in favorites:
        favorites.append(normalized_direction_id)
    payload["favorites"] = favorites
    payload["updated_at"] = utc_now()

    write_result = write_market_state(payload)
    return ServiceResult(
        status=write_result.status,
        data={
            "direction_id": normalized_direction_id,
            "favorited": True,
            "favorites": favorites,
        },
        message=write_result.message,
    )


def apply_direction_preference(direction_id: str) -> ServiceResult:
    normalized_direction_id = direction_id.strip()
    if not normalized_direction_id:
        return ServiceResult(status="invalid", message="direction id is required")

    state_result = read_market_state()
    blocked_result = write_blocked_by_degraded_state(state_result)
    if blocked_result:
        return blocked_result

    payload = normalize_market_payload(state_result.data)
    preferences = payload.get("preferences", {})
    if not isinstance(preferences, dict):
        preferences = {}
    preferences["active_direction_id"] = normalized_direction_id
    preferences["updated_at"] = utc_now()
    payload["preferences"] = preferences
    payload["mode"] = "personalized"
    payload["updated_at"] = utc_now()

    write_result = write_market_state(payload)
    return ServiceResult(
        status=write_result.status,
        data={
            "active_direction_id": normalized_direction_id,
            "mode": payload["mode"],
            "preferences": preferences,
        },
        message=write_result.message,
    )
