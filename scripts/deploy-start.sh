#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log deploy-start
load_runtime_env
configure_runtime_env

ensure_dependencies "deploy-start"

PID_FILE="$(deploy_pid_file)"
LOG_FILE="$(deploy_log_file)"
mkdir -p "$(deploy_runtime_dir)"

EXISTING_PID="$(read_deploy_pid || true)"
if is_deploy_process "$EXISTING_PID"; then
  echo "[deploy-start] already running: pid=${EXISTING_PID}"
  echo "[deploy-start] log: ${LOG_FILE}"
  exit 0
fi

if [[ -n "$EXISTING_PID" ]]; then
  echo "[deploy-start] removing stale pid file: ${PID_FILE}"
  rm -f "$PID_FILE"
fi

ensure_port_available "$BACKEND_HOST" "$BACKEND_PORT"

prepare_runtime_build "deploy-start" "true"

write_deploy_log_header "$LOG_FILE"
echo "[deploy-start] starting app at http://${BACKEND_HOST}:${BACKEND_PORT}"
(
  cd "$ROOT_DIR/backend"
  source .venv/bin/activate
  exec env DATABASE_URL="$DATABASE_URL" REDIS_URL="$REDIS_URL" uvicorn main:app --host "$BACKEND_HOST" --port "$BACKEND_PORT"
) >> "$ROOT_DIR/$LOG_FILE" 2>&1 &
APP_PID="$!"
echo "$APP_PID" > "$PID_FILE"

trap 'rm -f "$PID_FILE"; exit 1' INT TERM

for _ in {1..40}; do
  if ! is_pid_running "$APP_PID"; then
    echo "[deploy-start] app exited during startup"
    tail -n 80 "$LOG_FILE" || true
    rm -f "$PID_FILE"
    exit 1
  fi

  if curl --noproxy "*" -fsS "http://127.0.0.1:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
    echo "[deploy-start] ok: pid=${APP_PID}"
    echo "[deploy-start] log: ${LOG_FILE}"
    exit 0
  fi
  sleep 0.5
done

echo "[deploy-start] health check timeout"
tail -n 80 "$LOG_FILE" || true
kill "$APP_PID" >/dev/null 2>&1 || true
rm -f "$PID_FILE"
exit 1
