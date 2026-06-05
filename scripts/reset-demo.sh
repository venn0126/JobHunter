#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log reset-demo
mkdir -p data/runtime

echo "[reset-demo] restoring standard demo state"

SEED_MANIFEST="data/demo/seed-manifest.json"
if [[ ! -f "$SEED_MANIFEST" ]]; then
  echo "[reset-demo] missing seed manifest: $SEED_MANIFEST"
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
import hashlib
import json

manifest_path = Path("data/demo/seed-manifest.json")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
print(f"[reset-demo] seed manifest version: {manifest.get('version', 'unknown')}")

for seed in manifest.get("frontendSeeds", []):
    seed_path = Path(seed)
    if not seed_path.is_file():
        raise SystemExit(f"[reset-demo] missing frontend seed: {seed_path}")
    digest = hashlib.sha256(seed_path.read_bytes()).hexdigest()[:12]
    print(f"[reset-demo] seed ok: {seed_path} sha256={digest}")
PY

DB_PATH="data/runtime/jobhunter.sqlite"
if [[ -f "$DB_PATH" ]]; then
  BACKUP_PATH="data/runtime/jobhunter-reset-$(date +%Y%m%d-%H%M%S).sqlite.bak"
  cp "$DB_PATH" "$BACKUP_PATH"
  rm "$DB_PATH"
  echo "[reset-demo] backup: $BACKUP_PATH"
fi

./scripts/migrate.sh
./scripts/seed-demo.sh
./scripts/sync-version.sh

echo "[reset-demo] seed manifest: $SEED_MANIFEST"
echo "[reset-demo] browser state: open /settings and click \"重置标准 Demo\" after opening the app"
echo "[reset-demo] log: $OPS_LOG_PATH"
echo "[reset-demo] ok"
