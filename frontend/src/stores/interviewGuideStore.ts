import { create } from "zustand";

interface InterviewGuideState {
  reviewedPlanByJobId: Record<string, Record<number, boolean>>;
  resetDemo: () => void;
  togglePlanReviewed: (jobId: string, day: number) => void;
}

export const emptyInterviewPlanState: Record<number, boolean> = {};

function createDemoInterviewGuideState() {
  return {
    reviewedPlanByJobId: {},
  };
}

export const useInterviewGuideStore = create<InterviewGuideState>((set) => ({
  ...createDemoInterviewGuideState(),
  resetDemo: () => set(createDemoInterviewGuideState()),
  togglePlanReviewed: (jobId, day) =>
    set((state) => {
      const currentPlanState = state.reviewedPlanByJobId[jobId] ?? emptyInterviewPlanState;
      return {
        reviewedPlanByJobId: {
          ...state.reviewedPlanByJobId,
          [jobId]: {
            ...currentPlanState,
            [day]: !currentPlanState[day],
          },
        },
      };
    }),
}));
