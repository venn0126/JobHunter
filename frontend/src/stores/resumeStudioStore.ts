import { create } from "zustand";
import type { ResumeSectionDecisionMap } from "@/services/resumeStudioService";

export interface ResumeStudioJobState {
  decisions: ResumeSectionDecisionMap;
  savedVersionName: string;
}

interface ResumeStudioState {
  draftsByJobId: Record<string, ResumeStudioJobState>;
  acceptSection: (jobId: string, sectionId: string) => void;
  resetDemo: () => void;
  revokeSection: (jobId: string, sectionId: string) => void;
  saveVersion: (jobId: string, versionName: string) => void;
}

function createEmptyJobState(): ResumeStudioJobState {
  return {
    decisions: {},
    savedVersionName: "",
  };
}

export const emptyResumeStudioJobState = createEmptyJobState();

function createDemoResumeStudioState() {
  return {
    draftsByJobId: {},
  };
}

function patchJobState(
  state: ResumeStudioState,
  jobId: string,
  patcher: (jobState: ResumeStudioJobState) => ResumeStudioJobState,
) {
  const currentJobState = state.draftsByJobId[jobId] ?? createEmptyJobState();
  return {
    draftsByJobId: {
      ...state.draftsByJobId,
      [jobId]: patcher(currentJobState),
    },
  };
}

export const useResumeStudioStore = create<ResumeStudioState>((set) => ({
  ...createDemoResumeStudioState(),
  acceptSection: (jobId, sectionId) =>
    set((state) =>
      patchJobState(state, jobId, (jobState) => ({
        ...jobState,
        decisions: { ...jobState.decisions, [sectionId]: "accepted" },
      })),
    ),
  resetDemo: () => set(createDemoResumeStudioState()),
  revokeSection: (jobId, sectionId) =>
    set((state) =>
      patchJobState(state, jobId, (jobState) => ({
        ...jobState,
        decisions: { ...jobState.decisions, [sectionId]: "revoked" },
      })),
    ),
  saveVersion: (jobId, versionName) =>
    set((state) =>
      patchJobState(state, jobId, (jobState) => ({
        ...jobState,
        savedVersionName: versionName,
      })),
    ),
}));
