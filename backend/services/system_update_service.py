from __future__ import annotations

from typing import Any

from core.ids import new_public_id
from services.result import ServiceResult
from services.task_state_service import RedisTaskStateStore, build_task_state, utc_now
from services.version_service import read_version_info


UPDATE_TASK_SCHEMA_VERSION = "v1"


def read_update_check() -> ServiceResult:
    current = read_version_info()
    latest = {**current}
    return ServiceResult(
        status="ok",
        data={
            "current": current,
            "latest": latest,
            "has_update": False,
            "channel": "stable",
            "checked_at": utc_now(),
            "strategy": "local_demo",
            "message": "当前为本地演示更新通道，未发现可应用的新版本。",
        },
    )


def build_update_payload(*, channel: str, dry_run: bool, target_version: str | None) -> dict[str, Any]:
    version_info = read_version_info()
    return {
        "channel": channel,
        "current_version": version_info.get("version"),
        "current_build_id": version_info.get("build_id"),
        "dry_run": dry_run,
        "schema_version": UPDATE_TASK_SCHEMA_VERSION,
        "target_version": target_version or version_info.get("version"),
    }


def create_update_task(*, channel: str = "stable", dry_run: bool = False, target_version: str | None = None) -> ServiceResult:
    store = RedisTaskStateStore()
    task_id = new_public_id("update")
    payload = build_update_payload(channel=channel, dry_run=dry_run, target_version=target_version)
    state = build_task_state(
        task_id=task_id,
        status="succeeded",
        progress=100,
        message="演示环境更新任务已完成。" if not dry_run else "演示环境更新预检已完成。",
        payload={
            **payload,
            "mode": "simulated",
            "steps": [
                {"id": "check", "label": "检查版本文件", "status": "succeeded"},
                {"id": "backup", "label": "记录恢复点", "status": "succeeded"},
                {"id": "apply", "label": "应用更新", "status": "skipped" if dry_run else "succeeded"},
                {"id": "health", "label": "健康检查", "status": "succeeded"},
            ],
        },
    )
    state_result = store.set_state(state)
    event_result = store.append_event(
        task_id,
        "system.update.completed",
        state["message"] or "system update completed",
        {"channel": channel, "dry_run": dry_run, "target_version": payload["target_version"]},
    )
    if state_result.status == "degraded":
        return ServiceResult(status="degraded", data=state, message=state_result.message)
    if event_result.status == "degraded":
        return ServiceResult(status="degraded", data=state, message=event_result.message)
    return ServiceResult(status="stored", data=state)


def get_update_task(task_id: str) -> ServiceResult:
    result = RedisTaskStateStore().get_state(task_id)
    if result.status != "hit":
        return result
    payload = result.data.get("payload", {}) if isinstance(result.data, dict) else {}
    if not isinstance(payload, dict) or payload.get("schema_version") != UPDATE_TASK_SCHEMA_VERSION:
        return ServiceResult(status="miss")
    return result
