#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

load_runtime_env

configure_runtime_env

ensure_dependencies "start"

echo "[start] building frontend"
./scripts/sync-version.sh
(cd frontend && npm run build)

echo "[start] serving app at http://${BACKEND_HOST}:${BACKEND_PORT}"
(cd backend && source .venv/bin/activate && uvicorn main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT")
