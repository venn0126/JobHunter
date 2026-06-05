#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-auth-persona
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-auth-persona"
./scripts/infra-up.sh
./scripts/migrate.sh
./scripts/seed-demo.sh

PORT="$(reserve_local_port)"
echo "[verify-auth-persona] starting backend on 127.0.0.1:${PORT}"
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
import time
import urllib.error
import urllib.request

port = sys.argv[1]
base_url = f"http://127.0.0.1:{port}/api"
os.environ["no_proxy"] = "127.0.0.1,localhost,*"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def request(method, path, body=None, headers=None):
    data = None
    req_headers = {"Content-Type": "application/json", **(headers or {})}
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(base_url + path, data=data, headers=req_headers, method=method)
    try:
        with opener.open(req, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return response.status, payload
    except urllib.error.HTTPError as exc:
        payload = json.loads(exc.read().decode("utf-8"))
        return exc.code, payload


email = f"verify-{int(time.time())}@jobhunter.local"
register_status, register_payload = request(
    "POST",
    "/auth/register",
    {"name": "验证用户", "email": email, "password": "verify123456"},
)
if register_status != 200 or not register_payload["success"]:
    raise SystemExit(f"register failed: {register_status} {register_payload}")

access_token = register_payload["data"]["accessToken"]
refresh_token = register_payload["data"]["refreshToken"]
auth_headers = {"Authorization": f"Bearer {access_token}", "X-Refresh-Token": refresh_token}

login_status, login_payload = request("POST", "/auth/login", {"email": email, "password": "verify123456"})
if login_status != 200 or not login_payload["success"]:
    raise SystemExit(f"login failed: {login_status} {login_payload}")

me_status, me_payload = request("GET", "/auth/me", headers=auth_headers)
if me_status != 200 or me_payload["data"]["email"] != email:
    raise SystemExit(f"me failed: {me_status} {me_payload}")

update_status, update_payload = request("PATCH", "/auth/me", {"name": "验证用户A", "direction": "后端开发"}, auth_headers)
if update_status != 200 or update_payload["data"]["name"] != "验证用户A":
    raise SystemExit(f"update me failed: {update_status} {update_payload}")

create_status, create_payload = request(
    "POST",
    "/personas",
    {
        "name": "后端验证身份",
        "target_roles": ["后端工程师", "Java 后端"],
        "core_skills": ["Java", "Redis", "PostgreSQL"],
        "preferred_cities": ["北京", "上海"],
    },
    auth_headers,
)
if create_status != 200 or not create_payload["success"]:
    raise SystemExit(f"create persona failed: {create_status} {create_payload}")

persona_id = create_payload["data"]["id"]
list_status, list_payload = request("GET", "/personas", headers=auth_headers)
if list_status != 200 or not any(item["id"] == persona_id for item in list_payload["data"]["personas"]):
    raise SystemExit(f"list personas failed: {list_status} {list_payload}")

patch_status, patch_payload = request(
    "PATCH",
    f"/personas/{persona_id}",
    {"core_skills": ["Java", "Redis", "系统设计"]},
    auth_headers,
)
if patch_status != 200 or "系统设计" not in patch_payload["data"]["core_skills"]:
    raise SystemExit(f"patch persona failed: {patch_status} {patch_payload}")

activate_status, activate_payload = request("POST", f"/personas/{persona_id}/activate", headers=auth_headers)
if activate_status != 200 or activate_payload["data"]["active_persona_id"] != persona_id:
    raise SystemExit(f"activate persona failed: {activate_status} {activate_payload}")

refresh_status, refresh_payload = request("POST", "/auth/refresh", {"refreshToken": refresh_token})
if refresh_status != 200 or not refresh_payload["data"]["accessToken"]:
    raise SystemExit(f"refresh failed: {refresh_status} {refresh_payload}")

logout_status, logout_payload = request("POST", "/auth/logout", {"refreshToken": refresh_token}, auth_headers)
if logout_status != 200 or not logout_payload["success"]:
    raise SystemExit(f"logout failed: {logout_status} {logout_payload}")

print("[verify-auth-persona] auth ok")
print("[verify-auth-persona] persona ok")
PY

echo "[verify-auth-persona] ok"
