#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

LOG_FILE="$(deploy_log_file)"

if [[ ! -f "$LOG_FILE" ]]; then
  echo "[deploy-logs] log file not found: ${LOG_FILE}"
  echo "[deploy-logs] start app first: make deploy-start"
  exit 1
fi

tail -n "${TAIL_LINES:-120}" -f "$LOG_FILE"
