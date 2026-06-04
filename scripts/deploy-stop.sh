#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log deploy-stop

PID_FILE="$(deploy_pid_file)"
PID="$(read_deploy_pid || true)"

if ! is_deploy_process "$PID"; then
  echo "[deploy-stop] app is not running"
  rm -f "$PID_FILE"
  exit 0
fi

echo "[deploy-stop] stopping pid=${PID}"
kill "$PID" >/dev/null 2>&1 || true

for _ in {1..20}; do
  if ! is_pid_running "$PID"; then
    rm -f "$PID_FILE"
    echo "[deploy-stop] ok"
    exit 0
  fi
  sleep 0.5
done

echo "[deploy-stop] force killing pid=${PID}"
kill -KILL "$PID" >/dev/null 2>&1 || true
rm -f "$PID_FILE"
echo "[deploy-stop] ok"
