#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-demo-bootstrap
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-demo-bootstrap"
./scripts/infra-up.sh
./scripts/migrate.sh
./scripts/seed-demo.sh

PORT="$(reserve_local_port)"
echo "[verify-demo-bootstrap] starting backend on 127.0.0.1:${PORT}"
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
import urllib.request

port = sys.argv[1]
base_url = f"http://127.0.0.1:{port}/api"
expected_keys = {
    "careerPersonas",
    "careerVault",
    "dashboard",
    "decisionCards",
    "feedbackReview",
    "interviewGuide",
    "jobs",
    "market",
    "recruiterLens",
    "resumeLab",
    "resumeStudio",
    "sprint",
}

os.environ["no_proxy"] = "127.0.0.1,localhost,*"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(method, path):
    req = urllib.request.Request(base_url + path, method=method)
    with opener.open(req, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))
        return response.status, payload


summary_status, summary_payload = request("GET", "/demo/summary")
if summary_status != 200 or summary_payload["data"]["dataset_count"] != len(expected_keys):
    raise SystemExit(f"summary failed: {summary_status} {summary_payload}")

bootstrap_status, bootstrap_payload = request("GET", "/mock/bootstrap")
if bootstrap_status != 200 or set(bootstrap_payload["data"].keys()) != expected_keys:
    raise SystemExit(f"bootstrap failed: {bootstrap_status} {bootstrap_payload.keys()}")

reset_status, reset_payload = request("POST", "/demo/reset")
if reset_status != 200 or not reset_payload["data"]["reset"]:
    raise SystemExit(f"reset failed: {reset_status} {reset_payload}")
if reset_payload["data"]["demo_user_id"] != "demo_user":
    raise SystemExit(f"unexpected demo user: {reset_payload}")

print("[verify-demo-bootstrap] summary ok")
print("[verify-demo-bootstrap] bootstrap ok")
print("[verify-demo-bootstrap] reset ok")
PY

echo "[verify-demo-bootstrap] ok"
