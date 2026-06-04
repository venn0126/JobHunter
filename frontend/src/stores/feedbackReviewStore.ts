import { create } from "zustand";
import { demoData } from "@/data/demoData";
import type { ApplicationFeedbackOutcome, ApplicationFeedbackRecord } from "@/types/demo";

export interface FeedbackDraftInput {
  feedbackTags: string[];
  jobId: string;
  nextAction: string;
  notes: string;
  outcome: ApplicationFeedbackOutcome;
  resumeVersionId: string;
}

interface FeedbackReviewState {
  records: ApplicationFeedbackRecord[];
  resetDemo: () => void;
  upsertRecord: (input: FeedbackDraftInput) => ApplicationFeedbackRecord;
}

function createDemoFeedbackRecords() {
  return demoData.feedbackReview.records.map(cloneRecord);
}

function cloneRecord(record: ApplicationFeedbackRecord): ApplicationFeedbackRecord {
  return {
    ...record,
    feedback_tags: [...record.feedback_tags],
  };
}

function createFeedbackRecord(input: FeedbackDraftInput, existingRecord?: ApplicationFeedbackRecord): ApplicationFeedbackRecord {
  const today = new Date().toISOString().slice(0, 10);

  return {
    applied_at: existingRecord?.applied_at ?? today,
    channel: existingRecord?.channel ?? "手动记录",
    feedback_tags: input.feedbackTags,
    follow_up_at: shouldCreateFollowUp(input.outcome) ? getFollowUpDate(today) : undefined,
    id: existingRecord?.id ?? `fb_manual_${input.jobId}`,
    job_id: input.jobId,
    next_action: input.nextAction,
    notes: input.notes,
    outcome: input.outcome,
    resume_version_id: input.resumeVersionId,
    stage: getFeedbackStage(input.outcome),
    updated_at: today,
  };
}

function shouldCreateFollowUp(outcome: ApplicationFeedbackOutcome) {
  return outcome === "applied" || outcome === "no_response" || outcome === "interview";
}

function getFollowUpDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 10);
}

function getFeedbackStage(outcome: ApplicationFeedbackOutcome) {
  const stageMap: Record<ApplicationFeedbackOutcome, string> = {
    applied: "已投递待跟进",
    interview: "收到面试待准备",
    no_response: "投递后无回复",
    offer: "Offer 待评估",
    rejected: "简历筛选未通过",
    withdrawn: "已放弃跟进",
  };
  return stageMap[outcome];
}

export const useFeedbackReviewStore = create<FeedbackReviewState>((set, get) => ({
  records: createDemoFeedbackRecords(),
  resetDemo: () => set({ records: createDemoFeedbackRecords() }),
  upsertRecord: (input) => {
    const existingRecord = get().records.find((record) => record.job_id === input.jobId);
    const nextRecord = createFeedbackRecord(input, existingRecord);
    set((state) => ({
      records: existingRecord
        ? state.records.map((record) => (record.id === existingRecord.id ? nextRecord : record))
        : [nextRecord, ...state.records],
    }));
    return nextRecord;
  },
}));
