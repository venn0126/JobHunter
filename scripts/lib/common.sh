#!/usr/bin/env bash

set -euo pipefail

resolve_root_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    source "$env_file"
    set +a
  fi
}

load_local_env() {
  load_env_file ".env.local"
}

load_runtime_env() {
  if [[ -f ".env.demo" ]]; then
    load_env_file ".env.demo"
  else
    load_local_env
  fi
}

ensure_dependencies() {
  if [[ ! -d "frontend/node_modules" || ! -d "backend/.venv" ]]; then
    echo "[$1] missing dependencies, run: make init"
    exit 1
  fi
}

ensure_command() {
  local name="$1"
  local hint="$2"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "[common] missing command: $name"
    echo "[common] $hint"
    exit 1
  fi
}

docker_compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "[common] docker compose is required"
    echo "[common] install Docker Desktop or docker compose plugin first"
    exit 1
  fi
}

ensure_docker_running() {
  ensure_command "docker" "install Docker Desktop or Docker Engine first"
  if ! docker info >/dev/null 2>&1; then
    echo "[common] docker is not running"
    echo "[common] start Docker, then retry"
    exit 1
  fi
}

start_ops_log() {
  local name="$1"
  mkdir -p logs/ops
  OPS_RUN_ID="${OPS_RUN_ID:-$(date +%Y%m%d-%H%M%S)}"
  OPS_LOG_PATH="logs/ops/${name}-${OPS_RUN_ID}.log"
  export OPS_RUN_ID OPS_LOG_PATH
  exec > >(tee -a "$OPS_LOG_PATH") 2>&1
  echo "[$name] log: $OPS_LOG_PATH"
}

configure_dev_env() {
  BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
  BACKEND_PORT="${BACKEND_PORT:-8000}"
  FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
  FRONTEND_PORT="${FRONTEND_PORT:-5173}"
  configure_infra_env
  export BACKEND_HOST BACKEND_PORT FRONTEND_HOST FRONTEND_PORT
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://${BACKEND_HOST}:${BACKEND_PORT}/api}"
  export VITE_DATA_MODE="${VITE_DATA_MODE:-${DATA_MODE:-mock}}"
  export VITE_DEMO_MODE="${VITE_DEMO_MODE:-${DEMO_MODE:-false}}"
  export VITE_VERSION_POLL_INTERVAL_MS="${VITE_VERSION_POLL_INTERVAL_MS:-60000}"
}

configure_runtime_env() {
  BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
  BACKEND_PORT="${BACKEND_PORT:-8000}"
  configure_infra_env
  export BACKEND_HOST BACKEND_PORT
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}"
  export VITE_DATA_MODE="${VITE_DATA_MODE:-${DATA_MODE:-mock}}"
  export VITE_DEMO_MODE="${VITE_DEMO_MODE:-${DEMO_MODE:-false}}"
  export VITE_VERSION_POLL_INTERVAL_MS="${VITE_VERSION_POLL_INTERVAL_MS:-30000}"
}

configure_infra_env() {
  POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
  POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  POSTGRES_DB="${POSTGRES_DB:-jobhunter}"
  POSTGRES_USER="${POSTGRES_USER:-jobhunter}"
  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-jobhunter}"
  DATABASE_URL="${DATABASE_URL:-postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}}"

  REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
  REDIS_PORT="${REDIS_PORT:-6379}"
  REDIS_DB="${REDIS_DB:-0}"
  REDIS_URL="${REDIS_URL:-redis://${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}}"

  export POSTGRES_HOST POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD DATABASE_URL
  export REDIS_HOST REDIS_PORT REDIS_DB REDIS_URL
}

wait_for_infra() {
  echo "[infra] waiting for postgres"
  for _ in {1..60}; do
    if docker_compose exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      echo "[infra] postgres ready"
      break
    fi
    sleep 1
  done

  if ! docker_compose exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    echo "[infra] postgres did not become ready"
    docker_compose ps
    exit 1
  fi

  echo "[infra] waiting for redis"
  for _ in {1..60}; do
    if [[ "$(docker_compose exec -T redis redis-cli ping 2>/dev/null || true)" == "PONG" ]]; then
      echo "[infra] redis ready"
      break
    fi
    sleep 1
  done

  if [[ "$(docker_compose exec -T redis redis-cli ping 2>/dev/null || true)" != "PONG" ]]; then
    echo "[infra] redis did not become ready"
    docker_compose ps
    exit 1
  fi
}

activate_backend() {
  source backend/.venv/bin/activate
}

reserve_local_port() {
  python3 - <<'PY'
import socket

with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    print(sock.getsockname()[1])
PY
}

start_backend_server() {
  local port="$1"
  local log_path="$2"
  local root_dir
  root_dir="$(resolve_root_dir)"

  (cd "$root_dir/backend" && source .venv/bin/activate && uvicorn main:app --host 127.0.0.1 --port "$port" > "$root_dir/$log_path" 2>&1) &
  BACKEND_SERVER_PID="$!"
}

cleanup_backend_server() {
  local server_pid="${1:-}"
  if [[ -z "$server_pid" ]]; then
    return
  fi

  kill "$server_pid" >/dev/null 2>&1 || true
  wait "$server_pid" >/dev/null 2>&1 || true
}

wait_for_backend_health() {
  local port="$1"

  for _ in {1..40}; do
    if curl --noproxy "*" -fsS "http://127.0.0.1:${port}/api/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done

  echo "[common] backend health check timeout: http://127.0.0.1:${port}/api/health"
  return 1
}
