#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

ensure_dependencies "verify-update-restore"
start_ops_log verify-update-restore

echo "[verify-update-restore] building frontend modules"
(cd frontend && npm run build)

(cd frontend && node --input-type=module <<'JS'
import { createServer } from "vite";

globalThis.localStorage = {
  store: new Map(),
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  },
  removeItem(key) {
    this.store.delete(key);
  },
  setItem(key, value) {
    this.store.set(key, String(value));
  },
};

const vite = await createServer({
  configFile: "vite.config.ts",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const { rememberUpdateRestorePoint, readUpdateRestorePoint, readUpdateRestorePath, clearUpdateRestorePath } =
    await vite.ssrLoadModule("/src/lib/updateRestore.ts");

  rememberUpdateRestorePoint({
    filters: { city: "上海", direction: "AI 应用工程师", priority: "P0", sourceSite: "BOSS直聘" },
    path: "/jobs?role=AI%20应用工程师",
    personaId: "persona_backend_ai",
    sortKey: "match",
  });

  const point = readUpdateRestorePoint();
  if (point.path !== "/jobs?role=AI%20应用工程师" || point.personaId !== "persona_backend_ai" || point.sortKey !== "match") {
    throw new Error(`restore point mismatch: ${JSON.stringify(point)}`);
  }
  if (point.filters?.city !== "上海" || point.filters?.priority !== "P0") {
    throw new Error(`restore filters mismatch: ${JSON.stringify(point.filters)}`);
  }

  globalThis.localStorage.setItem("jobhunter-update-restore-path", "https://evil.example/path");
  if (readUpdateRestorePath() !== "/") {
    throw new Error("external restore path was not normalized");
  }

  globalThis.localStorage.setItem("jobhunter-update-restore-path", "//evil.example/path");
  if (readUpdateRestorePath() !== "/") {
    throw new Error("protocol-relative restore path was not normalized");
  }

  clearUpdateRestorePath();
  if (readUpdateRestorePath() !== "/") {
    throw new Error("restore path was not cleared");
  }

  console.log("[verify-update-restore] restore helpers ok");
} finally {
  await vite.close();
}
JS
)

echo "[verify-update-restore] log: $OPS_LOG_PATH"
echo "[verify-update-restore] ok"
