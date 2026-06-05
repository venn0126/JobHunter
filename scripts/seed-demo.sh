#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log seed-demo
load_runtime_env
configure_runtime_env
ensure_dependencies "seed-demo"
./scripts/infra-up.sh

echo "[seed-demo] validating demo seed manifest"
python3 - <<'PY'
from pathlib import Path
import hashlib
import json

manifest_path = Path("data/demo/seed-manifest.json")
if not manifest_path.is_file():
    raise SystemExit(f"[seed-demo] missing seed manifest: {manifest_path}")

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
print(f"[seed-demo] seed manifest version: {manifest.get('version', 'unknown')}")

for seed in manifest.get("frontendSeeds", []):
    seed_path = Path(seed)
    if not seed_path.is_file():
        raise SystemExit(f"[seed-demo] missing frontend seed: {seed_path}")
    digest = hashlib.sha256(seed_path.read_bytes()).hexdigest()[:12]
    print(f"[seed-demo] seed ok: {seed_path} sha256={digest}")
PY

(cd backend && source .venv/bin/activate && DATABASE_URL="$DATABASE_URL" python - <<'PY'
from core.db import SessionLocal
from services.demo_seed_service import seed_demo_identity

with SessionLocal() as db:
    result = seed_demo_identity(db)

print(f"[seed-demo] demo user: {result['demo_user_id']}")
print(f"[seed-demo] active persona: {result['active_persona_id']}")
print(f"[seed-demo] personas created: {result['personas_created']}")
print(f"[seed-demo] personas deleted: {result['personas_deleted']}")
PY
)

echo "[seed-demo] ok"
