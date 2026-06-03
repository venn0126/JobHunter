#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

ensure_dependencies "verify-version-cache"
mkdir -p logs/ops

LOG_PATH="logs/ops/verify-version-cache-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_PATH") 2>&1

PORT="$(python3 - <<'PY'
import socket

with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    print(sock.getsockname()[1])
PY
)"

echo "[verify-version-cache] building frontend"
./scripts/sync-version.sh
(cd frontend && npm run build)

echo "[verify-version-cache] starting backend on 127.0.0.1:${PORT}"
(cd backend && source .venv/bin/activate && uvicorn main:app --host 127.0.0.1 --port "$PORT" > "../${LOG_PATH}.server" 2>&1) &
SERVER_PID="$!"

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
  wait "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in {1..40}; do
  if curl --noproxy "*" -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

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
