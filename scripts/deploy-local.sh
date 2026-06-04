#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log deploy-local
load_runtime_env
configure_runtime_env

ensure_dependencies "deploy-local"
./scripts/migrate.sh
./scripts/seed-demo.sh

echo "[deploy-local] building frontend"
./scripts/sync-version.sh
(cd frontend && npm run build)

echo "[deploy-local] serving app at http://${BACKEND_HOST}:${BACKEND_PORT}"
(cd backend && source .venv/bin/activate && DATABASE_URL="$DATABASE_URL" REDIS_URL="$REDIS_URL" uvicorn main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT")
