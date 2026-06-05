#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"
ROOT_DIR="$(resolve_root_dir)"
cd "$ROOT_DIR"

start_ops_log verify-frontend-api-adapter
load_runtime_env
configure_runtime_env
ensure_dependencies "verify-frontend-api-adapter"
./scripts/infra-up.sh

PORT="$(reserve_local_port)"
echo "[verify-frontend-api-adapter] starting backend on 127.0.0.1:${PORT}"
start_backend_server "$PORT" "${OPS_LOG_PATH}.server"
SERVER_PID="$BACKEND_SERVER_PID"

cleanup() {
  cleanup_backend_server "$SERVER_PID"
}
trap cleanup EXIT

wait_for_backend_health "$PORT"

(cd frontend && VITE_API_BASE_URL="http://127.0.0.1:${PORT}/api" node --input-type=module <<'JS')
import { createServer } from "vite";

globalThis.window = {
  clearTimeout,
  setTimeout,
};

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
  const { apiGet, apiPost, ApiClientError } = await vite.ssrLoadModule("/src/services/apiClient.ts");
  const { syncRuntimeData } = await vite.ssrLoadModule("/src/services/bootstrapDataService.ts");
  const { useRuntimeDataStore } = await vite.ssrLoadModule("/src/stores/runtimeDataStore.ts");

  const health = await apiGet("/health");
  if (!health.app || !["ok", "degraded"].includes(health.status)) {
    throw new Error(`health payload mismatch: ${JSON.stringify(health)}`);
  }

  try {
    await apiGet("/debug/failure");
    throw new Error("debug failure did not fail");
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status < 400) {
      throw error;
    }
  }

  const mockResult = await syncRuntimeData("mock");
  if (mockResult.mode !== "mock" || useRuntimeDataStore.getState().mode !== "mock") {
    throw new Error("mock runtime sync failed");
  }

  const apiResult = await syncRuntimeData("api");
  if (apiResult.mode !== "api" || useRuntimeDataStore.getState().data.jobs.items.length < 1) {
    throw new Error("api runtime sync failed");
  }

  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error("simulated network failure"));
  try {
    const fallbackResult = await syncRuntimeData("api");
    const fallbackState = useRuntimeDataStore.getState();
    if (fallbackResult.mode !== "mock" || fallbackState.mode !== "mock" || fallbackState.loading) {
      throw new Error(`api fallback state mismatch: ${JSON.stringify({
        error: fallbackState.error,
        loading: fallbackState.loading,
        mode: fallbackState.mode,
        resultMode: fallbackResult.mode,
      })}`);
    }
    if (!fallbackState.error.includes("api fallback")) {
      throw new Error(`api fallback error missing: ${fallbackState.error}`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  const updateTask = await apiPost("/system/update/apply", { channel: "demo", dry_run: true });
  if (!updateTask.task_id || updateTask.status !== "succeeded") {
    throw new Error(`apiPost failed: ${JSON.stringify(updateTask)}`);
  }

  console.log("[verify-frontend-api-adapter] api client/runtime adapter ok");
} finally {
  await vite.close();
}
JS

echo "[verify-frontend-api-adapter] ok"
