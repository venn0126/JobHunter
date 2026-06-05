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
from pathlib import Path
import sys
import time
import urllib.error
import urllib.request

port = sys.argv[1]
base_url = f"http://127.0.0.1:{port}/api"
mock_datasets = json.loads(Path("data/demo/mock-datasets.json").read_text(encoding="utf-8"))
expected_keys = set(mock_datasets.keys())
expected_files = set(mock_datasets.values())
demo_personas = json.loads((Path("frontend/src/mocks") / mock_datasets["careerPersonas"]).read_text(encoding="utf-8"))
seed_persona_ids = {item["id"] for item in demo_personas["personas"]}
seed_active_persona_id = demo_personas["active_persona_id"]

os.environ["no_proxy"] = "127.0.0.1,localhost,*"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(method, path, body=None, headers=None):
    data = None
    req_headers = {"Accept": "application/json", **(headers or {})}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base_url + path, data=data, headers=req_headers, method=method)
    try:
        with opener.open(req, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return response.status, payload
    except urllib.error.HTTPError as exc:
        raw_payload = exc.read().decode("utf-8")
        try:
            payload = json.loads(raw_payload)
        except json.JSONDecodeError:
            payload = {"raw": raw_payload}
        return exc.code, payload


summary_status, summary_payload = request("GET", "/demo/summary")
if summary_status != 200 or summary_payload["data"]["dataset_count"] != len(expected_keys):
    raise SystemExit(f"summary failed: {summary_status} {summary_payload}")
if set(summary_payload["data"]["datasets"]) != expected_keys:
    raise SystemExit(f"summary datasets mismatch: {summary_payload}")
if summary_payload["data"].get("missing_files"):
    raise SystemExit(f"summary missing mock files: {summary_payload}")

bootstrap_status, bootstrap_payload = request("GET", "/mock/bootstrap")
if bootstrap_status != 200 or set(bootstrap_payload["data"].keys()) != expected_keys:
    raise SystemExit(f"bootstrap failed: {bootstrap_status} {bootstrap_payload.keys()}")

manifest = json.loads(Path("data/demo/seed-manifest.json").read_text(encoding="utf-8"))
manifest_files = {Path(path).name for path in manifest.get("frontendSeeds", [])}
if manifest_files != expected_files:
    raise SystemExit(f"seed manifest mismatch: expected={sorted(expected_files)} actual={sorted(manifest_files)}")

demo_email = os.environ.get("DEMO_USER_EMAIL", "demo@jobhunter.local")
demo_password = os.environ.get("DEMO_USER_PASSWORD", "jobhunter-demo")
demo_user_public_id = os.environ.get("DEMO_USER_PUBLIC_ID", "demo_user")
login_status, login_payload = request("POST", "/auth/login", {"email": demo_email, "password": demo_password})
if login_status != 200 or not login_payload["success"]:
    raise SystemExit(f"demo login failed: {login_status} {login_payload}")

auth_headers = {"Authorization": f"Bearer {login_payload['data']['accessToken']}"}
extra_name = f"验证重置清理{int(time.time())}"
create_status, create_payload = request(
    "POST",
    "/personas",
    {
        "name": extra_name,
        "target_roles": ["临时验证岗位"],
        "core_skills": ["Reset 验证"],
        "preferred_cities": ["远程"],
    },
    auth_headers,
)
if create_status != 200 or not create_payload["success"]:
    raise SystemExit(f"create temporary persona failed: {create_status} {create_payload}")
extra_persona_id = create_payload["data"]["id"]

reset_status, reset_payload = request("POST", "/demo/reset")
if reset_status != 200 or not reset_payload["data"]["reset"]:
    raise SystemExit(f"reset failed: {reset_status} {reset_payload}")
if reset_payload["data"]["demo_user_id"] != demo_user_public_id:
    raise SystemExit(f"unexpected demo user: {reset_payload}")
if reset_payload["data"].get("personas_deleted", 0) < 1:
    raise SystemExit(f"reset did not clean temporary persona: {reset_payload}")

personas_status, personas_payload = request("GET", "/personas", headers=auth_headers)
if personas_status != 200 or not personas_payload["success"]:
    raise SystemExit(f"list personas after reset failed: {personas_status} {personas_payload}")
persona_ids = {item["id"] for item in personas_payload["data"]["personas"]}
if extra_persona_id in persona_ids:
    raise SystemExit(f"temporary persona still exists after reset: {personas_payload}")
if persona_ids != seed_persona_ids:
    raise SystemExit(f"personas not restored to seed: expected={sorted(seed_persona_ids)} actual={sorted(persona_ids)}")
if personas_payload["data"]["active_persona_id"] != seed_active_persona_id:
    raise SystemExit(f"active persona mismatch after reset: {personas_payload}")

print("[verify-demo-bootstrap] summary ok")
print("[verify-demo-bootstrap] bootstrap ok")
print("[verify-demo-bootstrap] reset ok")
PY

echo "[verify-demo-bootstrap] ok"
