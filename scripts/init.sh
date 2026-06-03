#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

load_local_env

echo "[init] installing frontend dependencies"
(cd frontend && npm install)

echo "[init] preparing backend virtualenv"
if [[ ! -d "backend/.venv" ]]; then
  python3 -m venv backend/.venv
fi

echo "[init] installing backend dependencies"
(cd backend && source .venv/bin/activate && python -m pip install --upgrade pip && python -m pip install -r requirements.txt)

echo "[init] done"
