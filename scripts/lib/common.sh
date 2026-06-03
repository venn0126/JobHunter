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

configure_dev_env() {
  BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
  BACKEND_PORT="${BACKEND_PORT:-8000}"
  FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"
  FRONTEND_PORT="${FRONTEND_PORT:-5173}"
  export BACKEND_HOST BACKEND_PORT FRONTEND_HOST FRONTEND_PORT
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://${BACKEND_HOST}:${BACKEND_PORT}/api}"
  export VITE_DATA_MODE="${VITE_DATA_MODE:-${DATA_MODE:-mock}}"
}

configure_runtime_env() {
  BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
  BACKEND_PORT="${BACKEND_PORT:-8000}"
  export BACKEND_HOST BACKEND_PORT
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}"
  export VITE_DATA_MODE="${VITE_DATA_MODE:-${DATA_MODE:-mock}}"
}

activate_backend() {
  source backend/.venv/bin/activate
}
