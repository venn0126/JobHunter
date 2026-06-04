#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log migrate
load_runtime_env
configure_runtime_env
ensure_dependencies "migrate"
./scripts/infra-up.sh

echo "[migrate] applying PostgreSQL baseline migration"
(cd backend && source .venv/bin/activate && DATABASE_URL="$DATABASE_URL" alembic upgrade head)

echo "[migrate] ok"
