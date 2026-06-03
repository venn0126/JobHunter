#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log rollback
mkdir -p data/runtime

DB_PATH="${DB_PATH:-data/runtime/jobhunter.sqlite}"
BACKUP_PATH="${BACKUP_PATH:-}"

echo "[rollback] target db: $DB_PATH"

if [[ -z "$BACKUP_PATH" ]]; then
  echo "[rollback] BACKUP_PATH is required, example:"
  echo "[rollback] BACKUP_PATH=data/runtime/jobhunter-YYYYmmdd-HHMMSS.sqlite.bak make rollback"
  exit 1
fi

if [[ ! -f "$BACKUP_PATH" ]]; then
  echo "[rollback] backup not found: $BACKUP_PATH"
  exit 1
fi

if [[ -f "$DB_PATH" ]]; then
  SAFETY_BACKUP="data/runtime/jobhunter-pre-rollback-$(date +%Y%m%d-%H%M%S).sqlite.bak"
  cp "$DB_PATH" "$SAFETY_BACKUP"
  echo "[rollback] current db backup: $SAFETY_BACKUP"
fi

cp "$BACKUP_PATH" "$DB_PATH"
echo "[rollback] restored from: $BACKUP_PATH"
echo "[rollback] log: $OPS_LOG_PATH"
echo "[rollback] ok"
