import { appConfig } from "@/config/env";
import { storageKeys } from "@/lib/storageKeys";

export function enableDemoMode() {
  localStorage.setItem(storageKeys.demoMode, "true");
  applyDemoModeClass(true);
}

export function enableDemoModeFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const enabledByQuery = params.get("mode") === "demo";

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
