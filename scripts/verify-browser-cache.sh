#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

ensure_dependencies "verify-browser-cache"
start_ops_log verify-browser-cache
LOG_PATH="$OPS_LOG_PATH"

PORT="$(reserve_local_port)"

echo "[verify-browser-cache] building frontend"
./scripts/sync-version.sh
(cd frontend && npm run build)

ASSET_PATH="$(find frontend/dist/assets -type f -name '*.js' | sort | head -n 1 | sed 's#^frontend/dist##')"
if [[ -z "$ASSET_PATH" ]]; then
  echo "[verify-browser-cache] no js asset found"
  exit 1
fi
CSS_ASSET_PATH="$(find frontend/dist/assets -type f -name '*.css' | sort | head -n 1 | sed 's#^frontend/dist##')"
MISSING_ASSET_PATH="${ASSET_PATH%.js}-missing.js"
BODY_PATH="$(mktemp)"

echo "[verify-browser-cache] starting backend on 127.0.0.1:${PORT}"
start_backend_server "$PORT" "${LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"

cleanup() {
  cleanup_backend_server "$SERVER_PID"
  rm -f "$BODY_PATH"
}
trap cleanup EXIT

wait_for_backend_health "$PORT"

headers_for() {
  local path="$1"
  curl --noproxy "*" -sS -D - -o /dev/null "http://127.0.0.1:${PORT}${path}"
}

assert_header_contains() {
  local path="$1"
  local header="$2"
  local expected="$3"
  local headers
  headers="$(headers_for "$path")"
  if ! grep -iq "^${header}: .*${expected}" <<<"$headers"; then
    echo "[verify-browser-cache] header mismatch: ${path} ${header} expected=${expected}"
    echo "$headers"
    exit 1
  fi
  echo "[verify-browser-cache] header ok: ${path} ${header} contains ${expected}"
}

assert_status() {
  local path="$1"
  local expected="$2"
  local status
  status="$(curl --noproxy "*" -sS -o "$BODY_PATH" -w "%{http_code}" "http://127.0.0.1:${PORT}${path}")"
  if [[ "$status" != "$expected" ]]; then
    echo "[verify-browser-cache] status mismatch: ${path} expected=${expected} actual=${status}"
    cat "$BODY_PATH"
    exit 1
  fi
  echo "[verify-browser-cache] status ok: ${path} ${status}"
}

assert_header_contains "/" "cache-control" "no-store"
assert_header_contains "/version.json" "cache-control" "no-store"
assert_header_contains "$ASSET_PATH" "cache-control" "immutable"
if [[ -n "$CSS_ASSET_PATH" ]]; then
  assert_header_contains "$CSS_ASSET_PATH" "cache-control" "immutable"
fi
assert_status "$ASSET_PATH" "200"
assert_status "$MISSING_ASSET_PATH" "404"

if curl --noproxy "*" -sS "http://127.0.0.1:${PORT}${MISSING_ASSET_PATH}" | grep -qi "<!doctype html"; then
  echo "[verify-browser-cache] missing asset returned HTML fallback"
  exit 1
fi

echo "[verify-browser-cache] asset path: $ASSET_PATH"
echo "[verify-browser-cache] missing asset path: $MISSING_ASSET_PATH"
echo "[verify-browser-cache] log: $LOG_PATH"
echo "[verify-browser-cache] ok"
