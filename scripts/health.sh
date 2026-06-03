#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

echo "[health] checking required files"
test -f Makefile
test -f version.json
test -f frontend/package.json
test -f backend/requirements.txt

if ! cmp -s version.json frontend/public/version.json; then
  echo "[health] version files differ, run: make sync-version"
  exit 1
fi

ensure_dependencies "health"

echo "[health] frontend typecheck"
(cd frontend && npm run typecheck)

echo "[health] backend import check"
(cd backend && source .venv/bin/activate && python - <<'PY'
from main import app

print(f"[health] backend app: {app.title}")
PY
)

echo "[health] ok"
