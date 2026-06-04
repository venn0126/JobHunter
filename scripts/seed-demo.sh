#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log seed-demo
load_runtime_env
configure_runtime_env
ensure_dependencies "seed-demo"

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

echo "[seed-demo] P3-A only validates seed files; database seed import starts in P3-B"
echo "[seed-demo] ok"
