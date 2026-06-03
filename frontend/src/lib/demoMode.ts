import { appConfig } from "@/config/env";
import { storageKeys } from "@/lib/storageKeys";

const demoModeParam = "mode";
const demoResetParam = "reset";
const demoQueryValue = "demo";

export function enableDemoMode() {
  localStorage.setItem(storageKeys.demoMode, "true");
  applyDemoModeClass(true);
}

export function enableDemoModeFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const enabledByQuery = params.get(demoModeParam) === demoQueryValue;

  if (enabledByQuery) {
    localStorage.setItem(storageKeys.demoMode, "true");
  }

  return enabledByQuery;
}

export function isDemoModeEnabled(enabledByQuery = false) {
  return appConfig.isDemoMode || enabledByQuery || localStorage.getItem(storageKeys.demoMode) === "true";
}

export function applyDemoModeClass(enabled = isDemoModeEnabled()) {
  document.documentElement.classList.toggle("demo-mode", enabled);
}

export function isDemoResetSearch(search: string) {
  return new URLSearchParams(search).get(demoResetParam) === demoQueryValue;
}

export function createDemoModeSearch(search: string) {
  const params = new URLSearchParams(search);
  params.delete(demoResetParam);
  params.set(demoModeParam, demoQueryValue);
  return `?${params.toString()}`;
}
