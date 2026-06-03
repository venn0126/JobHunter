import type { DataMode } from "@/types/common";

const allowedDataModes: DataMode[] = ["mock", "api", "hybrid"];

function normalizeDataMode(value: string | undefined): DataMode {
  if (allowedDataModes.includes(value as DataMode)) {
    return value as DataMode;
  }
  return "mock";
}

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api",
  dataMode: normalizeDataMode(import.meta.env.VITE_DATA_MODE),
};
