#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

mkdir -p data/runtime logs/ops

LOG_PATH="logs/ops/reset-demo-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_PATH") 2>&1

echo "[reset-demo] restoring standard demo state"

SEED_MANIFEST="data/demo/seed-manifest.json"
if [[ ! -f "$SEED_MANIFEST" ]]; then
  echo "[reset-demo] missing seed manifest: $SEED_MANIFEST"
  exit 1
fi

DB_PATH="data/runtime/jobhunter.sqlite"
if [[ -f "$DB_PATH" ]]; then
  BACKUP_PATH="data/runtime/jobhunter-reset-$(date +%Y%m%d-%H%M%S).sqlite.bak"
  cp "$DB_PATH" "$BACKUP_PATH"
  rm "$DB_PATH"
  echo "[reset-demo] backup: $BACKUP_PATH"
fi

./scripts/migrate.sh
./scripts/sync-version.sh

echo "[reset-demo] seed manifest: $SEED_MANIFEST"
echo "[reset-demo] browser state: click the topbar \"重置 Demo\" button after opening the app"
echo "[reset-demo] log: $LOG_PATH"
echo "[reset-demo] ok"
