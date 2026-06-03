const restorePathKey = "jobhunter-update-restore-path";

export function rememberUpdateRestorePath(path: string) {
  localStorage.setItem(restorePathKey, path);
}

export function readUpdateRestorePath() {
  return localStorage.getItem(restorePathKey) || "/";
}

export function clearUpdateRestorePath() {
  localStorage.removeItem(restorePathKey);
}
