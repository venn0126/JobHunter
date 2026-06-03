#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

mkdir -p data/runtime logs/ops

DB_PATH="data/runtime/jobhunter.sqlite"
if [[ -f "$DB_PATH" ]]; then
  BACKUP_PATH="data/runtime/jobhunter-$(date +%Y%m%d-%H%M%S).sqlite.bak"
  cp "$DB_PATH" "$BACKUP_PATH"
  echo "[migrate] backup: $BACKUP_PATH"
fi

python3 - <<'PY'
from datetime import datetime, timezone
from pathlib import Path
import sqlite3

db_path = Path("data/runtime/jobhunter.sqlite")
conn = sqlite3.connect(db_path)
try:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        "INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (?, ?)",
        ("0001_base", datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
finally:
    conn.close()

print(f"[migrate] ready: {db_path}")
PY
