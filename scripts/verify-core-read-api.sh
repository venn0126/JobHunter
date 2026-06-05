#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-core-read-api
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-core-read-api"
./scripts/infra-up.sh
./scripts/migrate.sh
./scripts/seed-demo.sh

PORT="$(reserve_local_port)"
echo "[verify-core-read-api] starting backend on 127.0.0.1:${PORT}"
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
import urllib.parse
import urllib.request

port = sys.argv[1]
base_url = f"http://127.0.0.1:{port}/api"
os.environ["no_proxy"] = "127.0.0.1,localhost,*"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(path):
    req = urllib.request.Request(base_url + path, headers={"Accept": "application/json"}, method="GET")
    try:
        with opener.open(req, timeout=8) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read().decode("utf-8"))


checks = [
    ("/dashboard", lambda data: len(data["metrics"]) >= 1 and len(data["radar"]) >= 1),
    ("/market", lambda data: len(data["recommended_directions"]) >= 1),
    ("/jobs?page=1&page_size=2&sort=match", lambda data: len(data["items"]) == 2 and data["pagination"]["total"] >= 2),
    ("/jobs?direction=" + urllib.parse.quote("AI 应用工程师"), lambda data: all(item["direction"] == "AI 应用工程师" for item in data["items"])),
    ("/jobs/job_1001", lambda data: data["id"] == "job_1001"),
    ("/market/directions/" + urllib.parse.quote("LLM 工程师") + "/jobs", lambda data: all(item["direction"] == "LLM 工程师" for item in data["items"])),
    ("/vault?page=1&page_size=2", lambda data: len(data["items"]) == 2 and data["pagination"]["total"] >= 2),
    ("/vault/items/ev_rag_project", lambda data: data["id"] == "ev_rag_project"),
    ("/resume-lab", lambda data: len(data["versions"]) >= 1 and data["summary"]["best_version_id"]),
    ("/resume-lab/compare?version_id=resume_ai_app_v2&version_id=resume_backend_v1", lambda data: len(data["items"]) == 2),
    ("/resumes/versions?page=1&page_size=2", lambda data: len(data["items"]) == 2 and data["pagination"]["total"] >= 2 and data["summary"]["best_version_id"]),
    ("/resumes/resume_ai_app_v2/profile", lambda data: data["id"] == "resume_ai_app_v2"),
    ("/resume-studio?job_id=job_1001", lambda data: data["job_id"] == "job_1001"),
    ("/sprint", lambda data: len(data["today"]) >= 1),
    ("/pipeline", lambda data: len(data["entries"]) >= 1 and len(data["summary"]) >= 1),
]

for path, predicate in checks:
    status, payload = request(path)
    if status != 200 or not payload["success"] or not predicate(payload["data"]):
        raise SystemExit(f"check failed: {path} {status} {payload}")
    print(f"[verify-core-read-api] ok {path}")

status, payload = request("/jobs/not_exists")
if status != 404 or payload["code"] != "RESOURCE_NOT_FOUND":
    raise SystemExit(f"404 check failed: {status} {payload}")
print("[verify-core-read-api] ok /jobs/not_exists 404")

status, payload = request("/resumes/not_exists/profile")
if status != 404 or payload["code"] != "RESOURCE_NOT_FOUND":
    raise SystemExit(f"resume profile 404 check failed: {status} {payload}")
print("[verify-core-read-api] ok /resumes/not_exists/profile 404")
PY

echo "[verify-core-read-api] ok"
