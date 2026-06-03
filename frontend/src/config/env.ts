import type { DataMode } from "@/types/common";

const allowedDataModes: DataMode[] = ["mock", "api", "hybrid"];

function normalizeDataMode(value: string | undefined): DataMode {
  if (allowedDataModes.includes(value as DataMode)) {
    return value as DataMode;
  }
  return "mock";
}

function normalizePositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api",
  dataMode: normalizeDataMode(import.meta.env.VITE_DATA_MODE),
  isDemoMode: import.meta.env.VITE_DEMO_MODE === "true",
  versionPollIntervalMs: normalizePositiveNumber(import.meta.env.VITE_VERSION_POLL_INTERVAL_MS, 60_000),
};
