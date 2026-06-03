#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

ensure_dependencies "verify-version-cache"
mkdir -p logs/ops

LOG_PATH="logs/ops/verify-version-cache-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_PATH") 2>&1

PORT="$(reserve_local_port)"

echo "[verify-version-cache] building frontend"
./scripts/sync-version.sh
(cd frontend && npm run build)

echo "[verify-version-cache] starting backend on 127.0.0.1:${PORT}"
start_backend_server "$PORT" "${LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"

cleanup() {
  cleanup_backend_server "$SERVER_PID"
}
trap cleanup EXIT

wait_for_backend_health "$PORT"

assert_no_cache() {
  local path="$1"
  local headers
  headers="$(curl --noproxy "*" -fsS -D - -o /dev/null "http://127.0.0.1:${PORT}${path}")"
  if ! grep -iq "^cache-control: .*no-store" <<<"$headers"; then
    echo "[verify-version-cache] missing no-store header: ${path}"
    echo "$headers"
    exit 1
  fi
  echo "[verify-version-cache] no-store ok: ${path}"
}

assert_no_cache "/version.json"
assert_no_cache "/api/version"
assert_no_cache "/"

echo "[verify-version-cache] log: $LOG_PATH"
echo "[verify-version-cache] ok"
