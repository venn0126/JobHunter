#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log infra-down
load_runtime_env
configure_runtime_env
ensure_docker_running

echo "[infra-down] stopping PostgreSQL and Redis"
docker_compose down
echo "[infra-down] ok"
