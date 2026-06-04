import { demoData } from "@/data/demoData";
import type { CareerVaultItem, DemoJob, ResumeLab, ResumeLabVersion } from "@/types/demo";

export const defaultCompareVersionLimit = 2;

export function getResumeLab(): ResumeLab {
  return demoData.resumeLab;
}

export function getResumeLabPath(versionId?: string, compareVersionIds: string[] = []) {
  const searchParams = new URLSearchParams();
  if (versionId) {
    searchParams.set("version", versionId);
  }
  compareVersionIds.slice(0, defaultCompareVersionLimit).forEach((compareVersionId) => {
    searchParams.append("compare", compareVersionId);
  });

  const search = searchParams.toString();
  return search ? `/resume-lab?${search}` : "/resume-lab";
}

export function getBestResumeVersion(lab: ResumeLab): ResumeLabVersion | undefined {
  return lab.versions.find((version) => version.id === lab.summary.best_version_id) ?? sortResumeVersions(lab.versions)[0];
}

export function getActiveResumeVersionId(lab: ResumeLab, selectedVersionId?: string) {
  const selectedVersion = lab.versions.find((version) => version.id === selectedVersionId);
  if (selectedVersion) {
    return selectedVersion.id;
  }

  return getBestResumeVersion(lab)?.id ?? "";
}

export function getResumeVersionById(lab: ResumeLab, versionId?: string) {
  return lab.versions.find((version) => version.id === versionId);
}

export function getResumeVersionsByIds(lab: ResumeLab, versionIds: string[]) {
  return versionIds
    .map((versionId) => getResumeVersionById(lab, versionId))
    .filter((version): version is ResumeLabVersion => Boolean(version));
}

export function resolveCompareVersionIds(
  lab: ResumeLab,
  selectedVersionId?: string,
  requestedVersionIds: string[] = [],
) {
  const versionIds = new Set(lab.versions.map((version) => version.id));
  const validRequestedIds = requestedVersionIds.filter((versionId) => versionIds.has(versionId));

  if (validRequestedIds.length >= defaultCompareVersionLimit) {
    return validRequestedIds.slice(0, defaultCompareVersionLimit);
  }

  const activeVersionId = getActiveResumeVersionId(lab, selectedVersionId);
  const fallbackIds = sortResumeVersions(lab.versions).map((version) => version.id);
  return [...new Set([...validRequestedIds, activeVersionId, ...fallbackIds])]
    .filter((versionId) => versionIds.has(versionId))
    .slice(0, defaultCompareVersionLimit);
}

export function getCompareVersionOptions(lab: ResumeLab, compareVersionIds: string[], targetSlot: number) {
  const blockedIds = new Set(compareVersionIds.filter((_, index) => index !== targetSlot));
  return lab.versions.filter((version) => !blockedIds.has(version.id));
}

export function getResumeLabComparePath(
  compareVersionIds: string[],
  options: { selectedVersionId?: string; replaceIndex?: number; replaceWithVersionId?: string } = {},
) {
  const nextCompareVersionIds = [...compareVersionIds];
  if (options.replaceIndex !== undefined && options.replaceWithVersionId) {
    nextCompareVersionIds[options.replaceIndex] = options.replaceWithVersionId;
  }

  const uniqueCompareVersionIds = [...new Set(nextCompareVersionIds)].filter(Boolean);
  return getResumeLabPath(options.selectedVersionId ?? uniqueCompareVersionIds[0], uniqueCompareVersionIds);
}

export function getResumeLabComparePathForVersion(
  lab: ResumeLab,
  activeVersionId: string,
  targetVersionId: string,
) {
  const fallbackVersionId = sortResumeVersions(lab.versions).find((version) => version.id !== targetVersionId)?.id ?? "";
  const compareVersionIds = activeVersionId === targetVersionId
    ? [targetVersionId, fallbackVersionId]
    : [activeVersionId, targetVersionId];

  return getResumeLabComparePath(compareVersionIds.filter(Boolean), { selectedVersionId: targetVersionId });
}

export function getResumeLabMetrics(versions: ResumeLabVersion[]) {
  const appliedCount = versions.reduce((sum, version) => sum + version.applied_count, 0);
  const interviewCount = versions.reduce((sum, version) => sum + version.interview_count, 0);
  const noResponseCount = versions.reduce((sum, version) => sum + version.no_response_count, 0);
  const interviewRate = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0;

  return {
    appliedCount,
    interviewCount,
    interviewRate,
    noResponseCount,
    versionCount: versions.length,
  };
}

export function sortResumeVersions(versions: ResumeLabVersion[]) {
  return [...versions].sort((left, right) => right.interview_rate - left.interview_rate);
}

export function getResumeVersionEvidence(version: ResumeLabVersion, vaultItems: CareerVaultItem[]) {
  return version.key_changes
    .filter((change) => change.evidence_id)
    .map((change) => ({
      change,
      item: vaultItems.find((vaultItem) => vaultItem.id === change.evidence_id),
    }));
}

export function getResumeVersionJobs(version: ResumeLabVersion): DemoJob[] {
  return version.target_job_ids
    .map((jobId) => demoData.jobs.items.find((job) => job.id === jobId))
    .filter((job): job is DemoJob => Boolean(job));
}

export function getResumeVersionDelta(left?: ResumeLabVersion, right?: ResumeLabVersion) {
  if (!left || !right) {
    return undefined;
  }

  return {
    appliedCount: right.applied_count - left.applied_count,
    interviewCount: right.interview_count - left.interview_count,
    interviewRate: right.interview_rate - left.interview_rate,
    noResponseCount: right.no_response_count - left.no_response_count,
  };
}
