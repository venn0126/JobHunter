#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log health

HEALTH_REQUIRED_FILES="pending"
HEALTH_VERSION_SYNC="pending"
HEALTH_DEPENDENCIES="pending"
HEALTH_FRONTEND_TYPECHECK="pending"
HEALTH_BACKEND_IMPORT="pending"
HEALTH_INFRA="pending"
HEALTH_BACKEND_API="pending"
HEALTH_REPORT_PATH="logs/ops/health-${OPS_RUN_ID}.json"
HEALTH_LATEST_PATH="logs/ops/health-latest.json"
export HEALTH_REQUIRED_FILES HEALTH_VERSION_SYNC HEALTH_DEPENDENCIES HEALTH_FRONTEND_TYPECHECK HEALTH_BACKEND_IMPORT HEALTH_INFRA HEALTH_BACKEND_API
export HEALTH_REPORT_PATH HEALTH_LATEST_PATH

write_health_report() {
  local status="$1"
  local exit_code="$2"
  HEALTH_STATUS="$status" HEALTH_EXIT_CODE="$exit_code" python3 - <<'PY'
from datetime import datetime, timezone
from pathlib import Path
import json
import os
import shutil

report_path = Path(os.environ["HEALTH_REPORT_PATH"])
latest_path = Path(os.environ["HEALTH_LATEST_PATH"])
report = {
    "status": os.environ["HEALTH_STATUS"],
    "exit_code": int(os.environ["HEALTH_EXIT_CODE"]),
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "log_path": os.environ.get("OPS_LOG_PATH", ""),
    "checks": {
        "required_files": os.environ.get("HEALTH_REQUIRED_FILES", "pending"),
        "version_sync": os.environ.get("HEALTH_VERSION_SYNC", "pending"),
        "dependencies": os.environ.get("HEALTH_DEPENDENCIES", "pending"),
        "frontend_typecheck": os.environ.get("HEALTH_FRONTEND_TYPECHECK", "pending"),
        "backend_import": os.environ.get("HEALTH_BACKEND_IMPORT", "pending"),
        "infra": os.environ.get("HEALTH_INFRA", "pending"),
        "backend_api": os.environ.get("HEALTH_BACKEND_API", "pending"),
    },
}
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
shutil.copyfile(report_path, latest_path)
print(f"[health] report: {report_path}")
print(f"[health] latest: {latest_path}")
PY
}

finish_health() {
  local exit_code="$?"
  if [[ -n "${SERVER_PID:-}" ]]; then
    cleanup_backend_server "$SERVER_PID"
  fi
  local status="failed"
  if [[ "$exit_code" -eq 0 ]]; then
    status="ok"
  fi
  write_health_report "$status" "$exit_code"
}
trap finish_health EXIT

echo "[health] checking required files"
test -f Makefile
test -f version.json
test -f frontend/package.json
test -f backend/requirements.txt
HEALTH_REQUIRED_FILES="ok"

if ! cmp -s version.json frontend/public/version.json; then
  echo "[health] version files differ, run: make sync-version"
  exit 1
fi
HEALTH_VERSION_SYNC="ok"

ensure_dependencies "health"
HEALTH_DEPENDENCIES="ok"

load_runtime_env
configure_runtime_env
./scripts/infra-up.sh
HEALTH_INFRA="ok"

echo "[health] frontend typecheck"
(cd frontend && npm run typecheck)
HEALTH_FRONTEND_TYPECHECK="ok"

echo "[health] backend import check"
(cd backend && source .venv/bin/activate && python - <<'PY'
from main import app

print(f"[health] backend app: {app.title}")
PY
)
HEALTH_BACKEND_IMPORT="ok"

echo "[health] backend API dependency check"
PORT="$(reserve_local_port)"
start_backend_server "$PORT" "${OPS_LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"
wait_for_backend_health "$PORT"
python3 - "$PORT" <<'PY'
import json
import sys
import urllib.request

port = sys.argv[1]
with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/health", timeout=5) as response:
    payload = json.loads(response.read().decode("utf-8"))
with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/system/health", timeout=5) as response:
    system_payload = json.loads(response.read().decode("utf-8"))

data = payload["data"]
system_data = system_payload["data"]
dependencies = data.get("dependencies", {})
errors = {
    name: value
    for name, value in dependencies.items()
    if value.get("status") != "ok"
}
if errors:
    raise SystemExit(f"[health] dependency errors: {errors}")
if system_data.get("status") != data.get("status"):
    raise SystemExit("[health] /api/system/health does not match /api/health")
print(f"[health] backend api status: {data.get('status')}")
PY
HEALTH_BACKEND_API="ok"

echo "[health] ok"
