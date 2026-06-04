#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

PID="$(read_deploy_pid || true)"
LOG_FILE="$(deploy_log_file)"

if is_deploy_process "$PID"; then
  echo "[deploy-status] running"
  ps -o pid,ppid,stat,etime,comm,args -p "$PID"
  echo "[deploy-status] log: ${LOG_FILE}"
  exit 0
fi

if [[ -n "$PID" ]]; then
  echo "[deploy-status] stale pid file removed: $(deploy_pid_file) pid=${PID}"
  rm -f "$(deploy_pid_file)"
fi

echo "[deploy-status] stopped"
