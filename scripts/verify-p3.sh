#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-p3
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-p3"

echo "[verify-p3] running health"
./scripts/health.sh

echo "[verify-p3] running auth/persona smoke"
./scripts/verify-auth-persona.sh

echo "[verify-p3] running demo bootstrap smoke"
./scripts/verify-demo-bootstrap.sh

echo "[verify-p3] running core read API smoke"
./scripts/verify-core-read-api.sh

echo "[verify-p3] running generated API smoke"
./scripts/verify-generated-api.sh

echo "[verify-p3] running write API smoke"
./scripts/verify-write-api.sh

echo "[verify-p3] running system API smoke"
./scripts/verify-system-api.sh

echo "[verify-p3] running frontend API adapter smoke"
./scripts/verify-frontend-api-adapter.sh

echo "[verify-p3] ok"
