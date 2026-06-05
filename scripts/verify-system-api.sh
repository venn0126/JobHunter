#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-system-api
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-system-api"
./scripts/infra-up.sh

PORT="$(reserve_local_port)"
echo "[verify-system-api] starting backend on 127.0.0.1:${PORT}"
start_backend_server "$PORT" "${OPS_LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"

cleanup() {
  cleanup_backend_server "$SERVER_PID"
}
trap cleanup EXIT

wait_for_backend_health "$PORT"

python3 - "$PORT" <<'PY'
import json
import os
import sys
import urllib.error
import urllib.request

port = sys.argv[1]
base_url = f"http://127.0.0.1:{port}/api"
os.environ["no_proxy"] = "127.0.0.1,localhost,*"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(method, path, body=None):
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base_url + path, data=data, headers=headers, method=method)
    try:
        with opener.open(req, timeout=8) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read().decode("utf-8"))


def must_ok(method, path, body=None):
    status, payload = request(method, path, body)
    if status != 200 or not payload.get("success"):
        raise SystemExit(f"request failed: {method} {path} {status} {payload}")
    return payload["data"], payload


health, _ = must_ok("GET", "/health")
system_health, _ = must_ok("GET", "/system/health")
if health["status"] != system_health["status"] or health["app"] != system_health["app"]:
    raise SystemExit(f"health alias mismatch: {health} / {system_health}")
if health["version"] != system_health["version"] or health["data_mode"] != system_health["data_mode"]:
    raise SystemExit(f"health alias mismatch: {health} / {system_health}")
if health["status"] not in {"ok", "degraded"}:
    raise SystemExit(f"health status mismatch: {health}")
print("[verify-system-api] ok health aliases")

version, _ = must_ok("GET", "/version")
system_version, _ = must_ok("GET", "/system/version")
if version != system_version or not version.get("version") or not version.get("build_id"):
    raise SystemExit(f"version alias mismatch: {version} / {system_version}")
print("[verify-system-api] ok version aliases")

update_check, _ = must_ok("GET", "/system/update/check")
if "current" not in update_check or "latest" not in update_check or "has_update" not in update_check:
    raise SystemExit(f"update check payload mismatch: {update_check}")
print("[verify-system-api] ok update check")

update_task, _ = must_ok(
    "POST",
    "/system/update/apply",
    {"channel": "demo", "dry_run": True, "target_version": version["version"]},
)
task_id = update_task["task_id"]
if update_task["status"] != "succeeded" or update_task["progress"] != 100:
    raise SystemExit(f"update task failed: {update_task}")
if update_task["payload"]["schema_version"] != "v1" or update_task["payload"]["dry_run"] is not True:
    raise SystemExit(f"update task payload mismatch: {update_task}")
print("[verify-system-api] ok update apply")

update_status, _ = must_ok("GET", f"/system/update/status/{task_id}")
if update_status["task_id"] != task_id or update_status["payload"]["schema_version"] != "v1":
    raise SystemExit(f"update status failed: {update_status}")

task_status, _ = must_ok("GET", f"/tasks/{task_id}")
if task_status["task_id"] != task_id or task_status["status"] != "succeeded":
    raise SystemExit(f"task status failed: {task_status}")

events, _ = must_ok("GET", f"/tasks/{task_id}/events")
event_types = {item["event_type"] for item in events["items"]}
if "system.update.completed" not in event_types:
    raise SystemExit(f"task events failed: {events}")
print("[verify-system-api] ok update task/status/events")

status, payload = request("GET", "/system/update/status/not_exists")
if status != 404 or payload["code"] != "RESOURCE_NOT_FOUND":
    raise SystemExit(f"update status 404 failed: {status} {payload}")
print("[verify-system-api] ok update status 404")
PY

echo "[verify-system-api] ok"
