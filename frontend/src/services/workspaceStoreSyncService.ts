import { useCareerVaultStore } from "@/stores/careerVaultStore";
import { useFeedbackReviewStore } from "@/stores/feedbackReviewStore";
import { useInterviewGuideStore } from "@/stores/interviewGuideStore";
import { useJobStore } from "@/stores/jobStore";
import { usePipelineStore, type PipelineEntry } from "@/stores/pipelineStore";
import { useResumeStudioStore } from "@/stores/resumeStudioStore";

export function syncWorkspaceStoresFromRuntimeData(options: { pipelineEntries?: PipelineEntry[] } = {}) {
  useJobStore.getState().resetDemo();
  useCareerVaultStore.getState().resetDemo();
  useFeedbackReviewStore.getState().resetDemo();
  usePipelineStore.getState().resetDemo();
  if (options.pipelineEntries) {
    usePipelineStore.getState().replaceEntries(options.pipelineEntries);
  }
  useResumeStudioStore.getState().resetDemo();
  useInterviewGuideStore.getState().resetDemo();
}
