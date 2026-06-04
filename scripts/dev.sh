#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log dev
load_local_env

configure_dev_env

ensure_dependencies "dev"
./scripts/migrate.sh

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

echo "[dev] backend:  http://${BACKEND_HOST}:${BACKEND_PORT}"
(cd backend && source .venv/bin/activate && DATABASE_URL="$DATABASE_URL" REDIS_URL="$REDIS_URL" uvicorn main:app --reload --host "$BACKEND_HOST" --port "$BACKEND_PORT") &
BACKEND_PID=$!

echo "[dev] frontend: http://${FRONTEND_HOST}:${FRONTEND_PORT}"
(cd frontend && npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT") &
FRONTEND_PID=$!

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

wait "$BACKEND_PID" "$FRONTEND_PID"
