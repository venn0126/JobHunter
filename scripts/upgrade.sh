#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log upgrade
echo "[upgrade] start"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "[upgrade] abort: working tree is dirty. Commit or stash changes first."
  exit 1
fi

git fetch origin
CURRENT="$(git rev-parse HEAD)"
TARGET="$(git rev-parse origin/main)"

if [[ "$CURRENT" == "$TARGET" ]]; then
  echo "[upgrade] already up to date"
else
  git merge --ff-only origin/main
fi

make init
make migrate
make health

echo "[upgrade] done"
