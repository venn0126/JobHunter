import { storageKeys } from "@/lib/storageKeys";
import type { JobFilters, JobSortKey } from "@/stores/jobStore";

export interface UpdateRestorePoint {
  filters?: Partial<JobFilters>;
  path: string;
  personaId?: string;
  sortKey?: JobSortKey;
}

export function rememberUpdateRestorePoint(point: UpdateRestorePoint) {
  localStorage.setItem(
    storageKeys.updateRestorePath,
    JSON.stringify({
      ...point,
      path: normalizeRestorePath(point.path),
    }),
  );
}

export function rememberUpdateRestorePath(path: string) {
  rememberUpdateRestorePoint({ path });
}

export function readUpdateRestorePath() {
  return readUpdateRestorePoint().path;
}

export function readUpdateRestorePoint(): UpdateRestorePoint {
  const rawValue = localStorage.getItem(storageKeys.updateRestorePath);
  if (!rawValue) {
    return { path: "/" };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<UpdateRestorePoint>;
    return {
      filters: normalizeRestoreFilters(parsed.filters),
      path: normalizeRestorePath(parsed.path || "/"),
      personaId: typeof parsed.personaId === "string" ? parsed.personaId : undefined,
      sortKey: parsed.sortKey === "match" || parsed.sortKey === "recommended" ? parsed.sortKey : undefined,
    };
  } catch {
    return { path: normalizeRestorePath(rawValue) };
  }
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

function normalizeRestoreFilters(filters: unknown): Partial<JobFilters> | undefined {
  if (!filters || typeof filters !== "object") {
    return undefined;
  }

  const rawFilters = filters as Partial<Record<keyof JobFilters, unknown>>;
  return {
    city: typeof rawFilters.city === "string" ? rawFilters.city : "",
    direction: typeof rawFilters.direction === "string" ? rawFilters.direction : "",
    priority:
      rawFilters.priority === "" || rawFilters.priority === "P0" || rawFilters.priority === "P1" || rawFilters.priority === "P2"
        ? rawFilters.priority
        : "",
    sourceSite: typeof rawFilters.sourceSite === "string" ? rawFilters.sourceSite : "",
  };
}
