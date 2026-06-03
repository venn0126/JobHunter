import { demoData } from "@/data/demoData";
import type { CareerVaultItem, ResumeStudioDraft, ResumeStudioSection } from "@/types/demo";

export type ResumeSectionDecision = "accepted" | "revoked";
export type ResumeSectionDecisionMap = Record<string, ResumeSectionDecision>;

export function getResumeStudioDraft(jobId?: string): ResumeStudioDraft {
  return demoData.resumeStudio.items.find((item) => item.job_id === jobId) ?? demoData.resumeStudio.items[0];
}

export function getResumeStudioPath(jobId?: string) {
  return jobId ? `/resume?job=${encodeURIComponent(jobId)}` : "/resume";
}

export function getResumeVersionName(draft: Pick<ResumeStudioDraft, "summary">) {
  return `${draft.summary.target_role}强化版 v1`;
}

export function isResumeSectionAccepted(section: ResumeStudioSection, decisions: ResumeSectionDecisionMap) {
  const decision = decisions[section.id];
  if (decision) {
    return decision === "accepted";
  }

  return section.status === "可直接使用";
}

export function getAcceptedResumeSections(sections: ResumeStudioSection[], decisions: ResumeSectionDecisionMap) {
  return sections.filter((section) => isResumeSectionAccepted(section, decisions));
}

export function resolveResumeEvidence(section: ResumeStudioSection, vaultItems: CareerVaultItem[]) {
  return section.evidence.map((reference) => ({
    item: vaultItems.find((vaultItem) => vaultItem.id === reference.source_id),
    reference,
  }));
}
