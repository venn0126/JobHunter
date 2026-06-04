#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log init
load_local_env

AUTO_INSTALL_SYSTEM_DEPS="${AUTO_INSTALL_SYSTEM_DEPS:-true}"
if [[ "$AUTO_INSTALL_SYSTEM_DEPS" == "true" ]]; then
  ./scripts/bootstrap-system.sh
else
  echo "[init] skip system dependency bootstrap"
fi

echo "[init] installing frontend dependencies"
(cd frontend && npm install)

echo "[init] preparing backend virtualenv"
if [[ -d "backend/.venv" && ! -f "backend/.venv/bin/activate" ]]; then
  echo "[init] removing incomplete backend virtualenv"
  rm -rf backend/.venv
fi

if [[ ! -f "backend/.venv/bin/activate" ]]; then
  python3 -m venv backend/.venv
fi

echo "[init] installing backend dependencies"
(cd backend && source .venv/bin/activate && python -m pip install --upgrade pip && python -m pip install -r requirements.txt)

echo "[init] done"
