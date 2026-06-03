import { storageKeys } from "@/lib/storageKeys";

export function rememberUpdateRestorePath(path: string) {
  localStorage.setItem(storageKeys.updateRestorePath, normalizeRestorePath(path));
}

export function readUpdateRestorePath() {
  return normalizeRestorePath(localStorage.getItem(storageKeys.updateRestorePath) || "/");
}

export function clearUpdateRestorePath() {
  localStorage.removeItem(storageKeys.updateRestorePath);
}

function normalizeRestorePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  return path;
}
