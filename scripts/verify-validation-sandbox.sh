#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

ensure_dependencies "verify-validation-sandbox"
start_ops_log verify-validation-sandbox
LOG_PATH="$OPS_LOG_PATH"

PORT="$(reserve_local_port)"

echo "[verify-validation-sandbox] building frontend"
./scripts/sync-version.sh
(cd frontend && npm run build)

echo "[verify-validation-sandbox] starting backend on 127.0.0.1:${PORT}"
export DEBUG_ROUTES_ENABLED=true
start_backend_server "$PORT" "${LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"

cleanup() {
  cleanup_backend_server "$SERVER_PID"
}
trap cleanup EXIT

wait_for_backend_health "$PORT"

assert_status() {
  local path="$1"
  local expected="$2"
  local status
  status="$(curl --noproxy "*" -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}${path}")"
  if [[ "$status" != "$expected" ]]; then
    echo "[verify-validation-sandbox] unexpected status: ${path} expected=${expected} actual=${status}"
    exit 1
  fi
  echo "[verify-validation-sandbox] status ok: ${path} ${status}"
}

assert_status "/settings" "200"
assert_status "/debug" "200"
assert_status "/api/debug/failure" "503"

echo "[verify-validation-sandbox] log: $LOG_PATH"
echo "[verify-validation-sandbox] ok"
