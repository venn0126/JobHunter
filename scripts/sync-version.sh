#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

mkdir -p frontend/public
cp version.json frontend/public/version.json
echo "[sync-version] frontend/public/version.json updated"
