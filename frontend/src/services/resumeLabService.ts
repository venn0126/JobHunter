import { demoData } from "@/data/demoData";
import type { ResumeLab, ResumeLabVersion } from "@/types/demo";

export function getResumeLab(): ResumeLab {
  return demoData.resumeLab;
}

export function getResumeLabPath(versionId?: string) {
  return versionId ? `/resume-lab?version=${encodeURIComponent(versionId)}` : "/resume-lab";
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
