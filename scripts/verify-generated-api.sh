#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-generated-api
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-generated-api"
./scripts/infra-up.sh
./scripts/migrate.sh
./scripts/seed-demo.sh

PORT="$(reserve_local_port)"
echo "[verify-generated-api] starting backend on 127.0.0.1:${PORT}"
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


def ensure_generated(payload, *, job_id=None, source=None):
    if not payload["success"] or not payload["data"]["task_id"]:
        raise SystemExit(f"invalid generated payload: {payload}")
    data = payload["data"]
    if data["status"] not in {"succeeded", "fallback_mock", "fallback_cache"}:
        raise SystemExit(f"unexpected generation status: {payload}")
    if source and data["source"] != source:
        raise SystemExit(f"unexpected source: expected={source} actual={data['source']} payload={payload}")
    if job_id and data["result"].get("job_id") != job_id:
        raise SystemExit(f"job id mismatch: expected={job_id} payload={payload}")
    if not data["cache"]["key"] or not data["generation"]["payload_hash"]:
        raise SystemExit(f"missing cache metadata: {payload}")
    return data


checks = [
    ("GET", "/jobs/job_1001/decision?force_refresh=true", None, "job_1001", "mock"),
    ("GET", "/jobs/job_1002/decision?force_refresh=true", None, "job_1002", "fallback_mock"),
    ("GET", "/jobs/job_1001/recruiter-lens?force_refresh=true", None, "job_1001", "mock"),
    ("GET", "/decisions?page=1&page_size=2&force_refresh=true", None, None, "fallback_mock"),
    ("POST", "/tailor/run", {"job_id": "job_1001", "force_refresh": True}, "job_1001", "mock"),
    ("POST", "/interview/start", {"job_id": "job_1001", "force_refresh": True}, "job_1001", "mock"),
    ("GET", "/interview/cards?job_id=job_1001&force_refresh=true", None, "job_1001", "mock"),
]

first_task_id = None
for method, path, body, job_id, source in checks:
    status, payload = request(method, path, body)
    if status != 200:
        raise SystemExit(f"generated check failed: {method} {path} {status} {payload}")
    data = ensure_generated(payload, job_id=job_id, source=source)
    if path.startswith("/decisions"):
        if len(data["result"]["items"]) != 2 or data["result"]["pagination"]["total"] < 2:
            raise SystemExit(f"decision list pagination failed: {payload}")
    first_task_id = first_task_id or data["task_id"]
    print(f"[verify-generated-api] ok {method} {path}")

status, first_payload = request("GET", "/jobs/job_1001/decision", None)
status2, second_payload = request("GET", "/jobs/job_1001/decision", None)
if status != 200 or status2 != 200:
    raise SystemExit(f"cache request failed: {status} {first_payload} / {status2} {second_payload}")
first_data = ensure_generated(first_payload, job_id="job_1001")
second_data = ensure_generated(second_payload, job_id="job_1001")
if first_data["source"] != "cache" or second_data["source"] != "cache":
    raise SystemExit(f"cache hit failed: first={first_payload} second={second_payload}")
if first_data["task_id"] != second_data["task_id"]:
    raise SystemExit(f"stable task id failed: first={first_data['task_id']} second={second_data['task_id']}")
print("[verify-generated-api] ok repeated decision cache hit")

task_id = first_data["task_id"] or first_task_id
task_status, task_payload = request("GET", f"/tasks/{task_id}")
if task_status != 200 or task_payload["data"]["task_id"] != task_id or task_payload["data"]["status"] != "succeeded":
    raise SystemExit(f"task state check failed: {task_status} {task_payload}")

events_status, events_payload = request("GET", f"/tasks/{task_id}/events")
event_types = {item["event_type"] for item in events_payload["data"]["items"]} if events_status == 200 else set()
if events_status != 200 or "cache_hit" not in event_types:
    raise SystemExit(f"task events check failed: {events_status} {events_payload}")
print(f"[verify-generated-api] ok task state/events {task_id}")

status, payload = request("GET", "/jobs/not_exists/decision")
if status != 404 or payload["code"] != "RESOURCE_NOT_FOUND":
    raise SystemExit(f"decision 404 failed: {status} {payload}")
print("[verify-generated-api] ok decision 404")
PY

echo "[verify-generated-api] ok"
