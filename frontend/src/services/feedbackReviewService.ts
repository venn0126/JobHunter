import { demoData } from "@/data/demoData";
import type {
  ApplicationFeedbackOutcome,
  ApplicationFeedbackRecord,
  ApplicationFeedbackReview,
  DemoJob,
  ResumeLabVersion,
} from "@/types/demo";

export interface FeedbackRecordView {
  job?: DemoJob;
  record: ApplicationFeedbackRecord;
  resumeVersion?: ResumeLabVersion;
}

export const feedbackOutcomeLabel: Record<ApplicationFeedbackOutcome, string> = {
  applied: "已投递",
  interview: "收到面试",
  no_response: "无回复",
  offer: "Offer",
  rejected: "被拒",
  withdrawn: "已放弃",
};

export function getFeedbackReview(): ApplicationFeedbackReview {
  return demoData.feedbackReview;
}

export function getFeedbackRecordViews(records: ApplicationFeedbackRecord[]): FeedbackRecordView[] {
  return records.map((record) => ({
    job: demoData.jobs.items.find((job) => job.id === record.job_id),
    record,
    resumeVersion: demoData.resumeLab.versions.find((version) => version.id === record.resume_version_id),
  }));
}

export function getFeedbackMetrics(records: ApplicationFeedbackRecord[]) {
  const appliedCount = records.length;
  const interviewCount = records.filter((record) => record.outcome === "interview" || record.outcome === "offer").length;
  const noResponseCount = records.filter((record) => record.outcome === "no_response").length;
  const rejectedCount = records.filter((record) => record.outcome === "rejected").length;
  const activeFollowUpCount = records.filter((record) =>
    ["applied", "no_response", "interview"].includes(record.outcome),
  ).length;
  const interviewRate = appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0;
  const noResponseRate = appliedCount > 0 ? Math.round((noResponseCount / appliedCount) * 100) : 0;

  return {
    activeFollowUpCount,
    appliedCount,
    interviewCount,
    interviewRate,
    noResponseCount,
    noResponseRate,
    rejectedCount,
  };
}

export function getFeedbackOutcomeRows(records: ApplicationFeedbackRecord[]) {
  const outcomeOrder: ApplicationFeedbackOutcome[] = ["interview", "no_response", "rejected", "applied", "offer", "withdrawn"];
  return outcomeOrder
    .map((outcome) => ({
      count: records.filter((record) => record.outcome === outcome).length,
      id: outcome,
      label: feedbackOutcomeLabel[outcome],
    }))
    .filter((row) => row.count > 0);
}

export function getResumeVersionFeedbackRows(records: ApplicationFeedbackRecord[]) {
  return demoData.resumeLab.versions
    .map((version) => {
      const versionRecords = records.filter((record) => record.resume_version_id === version.id);
      const metrics = getFeedbackMetrics(versionRecords);
      return {
        ...metrics,
        version,
      };
    })
    .filter((row) => row.appliedCount > 0)
    .sort((left, right) => right.interviewRate - left.interviewRate);
}

export function getRecentFeedbackViews(records: ApplicationFeedbackRecord[], limit = 4) {
  return getFeedbackRecordViews(records)
    .sort((left, right) => Date.parse(right.record.updated_at) - Date.parse(left.record.updated_at))
    .slice(0, limit);
}

export function getUpcomingFollowUps(records: ApplicationFeedbackRecord[], limit = 4) {
  return getFeedbackRecordViews(records)
    .filter(({ record }) => Boolean(record.follow_up_at) && record.outcome !== "rejected" && record.outcome !== "withdrawn")
    .sort((left, right) => Date.parse(left.record.follow_up_at ?? "") - Date.parse(right.record.follow_up_at ?? ""))
    .slice(0, limit);
}

export function getFeedbackTrend(records: ApplicationFeedbackRecord[]) {
  const grouped = new Map<string, { applied: number; interviews: number }>();
  records.forEach((record) => {
    const weekKey = getWeekKey(record.applied_at);
    const current = grouped.get(weekKey) ?? { applied: 0, interviews: 0 };
    current.applied += 1;
    if (record.outcome === "interview" || record.outcome === "offer") {
      current.interviews += 1;
    }
    grouped.set(weekKey, current);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([week, value]) => ({
      interviewRate: value.applied > 0 ? Math.round((value.interviews / value.applied) * 100) : 0,
      ...value,
      week,
    }));
}

function getWeekKey(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const monday = new Date(date);
  const day = date.getDay() || 7;
  monday.setDate(date.getDate() - day + 1);
  return `${monday.getMonth() + 1}/${monday.getDate()} 周`;
}
