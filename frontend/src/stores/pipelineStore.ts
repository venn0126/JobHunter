import { create } from "zustand";
import { demoData } from "@/data/demoData";
import type { PipelineStatus } from "@/types/common";
import type { DemoJob } from "@/types/demo";

export interface PipelineEntry {
  addedAt: string;
  job: DemoJob;
  nextAction: string;
  status: PipelineStatus;
  updatedAt: string;
}

export type AddPipelineResult = "added" | "exists";
export type MovePipelineResult = "moved" | "invalid" | "missing";

interface PipelineState {
  entries: PipelineEntry[];
  addJob: (job: DemoJob, status?: PipelineStatus) => AddPipelineResult;
  moveEntry: (jobId: string, nextStatus: PipelineStatus) => MovePipelineResult;
  resetDemo: () => void;
}

export const pipelineColumns: Array<{ id: PipelineStatus; label: string }> = [
  { id: "interested", label: "感兴趣" },
  { id: "tailored", label: "已定制简历" },
  { id: "applied", label: "已投递" },
  { id: "hr_contact", label: "HR 沟通" },
  { id: "interviewing", label: "面试中" },
  { id: "offer", label: "Offer" },
];

const activeStatuses = pipelineColumns.map((column) => column.id);

const validTransitions: Record<PipelineStatus, PipelineStatus[]> = {
  applied: ["tailored", "hr_contact", "rejected", "withdrawn"],
  hr_contact: ["applied", "interviewing", "rejected", "withdrawn"],
  interested: ["tailored", "rejected", "withdrawn"],
  interviewing: ["hr_contact", "offer", "rejected", "withdrawn"],
  offer: ["withdrawn"],
  rejected: [],
  tailored: ["interested", "applied", "rejected", "withdrawn"],
  withdrawn: [],
};

export const pipelineStatusLabel: Record<PipelineStatus, string> = {
  applied: "已投递",
  hr_contact: "HR 沟通",
  interested: "感兴趣",
  interviewing: "面试中",
  offer: "Offer",
  rejected: "已拒绝",
  tailored: "已定制简历",
  withdrawn: "已撤回",
};

export function getPipelineSummary(entries: PipelineEntry[]) {
  return pipelineColumns.map((column) => ({
    count: entries.filter((entry) => entry.status === column.id).length,
    id: column.id,
    label: column.label,
  }));
}

export function getPipelineEntriesByStatus(entries: PipelineEntry[], status: PipelineStatus) {
  return entries
    .filter((entry) => entry.status === status)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export function getNextPipelineStatuses(status: PipelineStatus) {
  return validTransitions[status].filter((item) => activeStatuses.includes(item));
}

function createInitialEntries(): PipelineEntry[] {
  const [firstJob, secondJob, thirdJob] = demoData.jobs.items;
  const now = Date.now();
  return [
    createEntry(firstJob, "interested", new Date(now - 1000 * 60 * 18).toISOString(), "补充 RAG 项目量化成果"),
    createEntry(secondJob, "tailored", new Date(now - 1000 * 60 * 60 * 3).toISOString(), "定制 LLM 后端版简历"),
    createEntry(thirdJob, "applied", new Date(now - 1000 * 60 * 60 * 24).toISOString(), "明天上午跟进投递结果"),
  ].filter((entry): entry is PipelineEntry => Boolean(entry));
}

function createEntry(job: DemoJob | undefined, status: PipelineStatus, time: string, nextAction?: string) {
  if (!job) {
    return undefined;
  }

  return {
    addedAt: time,
    job: cloneJob(job),
    nextAction: nextAction ?? getDefaultNextAction(status),
    status,
    updatedAt: time,
  };
}

function cloneJob(job: DemoJob) {
  return {
    ...job,
    source: { ...job.source },
  };
}

function getDefaultNextAction(status: PipelineStatus) {
  const actions: Record<PipelineStatus, string> = {
    applied: "跟进投递反馈",
    hr_contact: "确认面试时间和岗位细节",
    interested: "补充素材并确认是否投递",
    interviewing: "准备面试作战卡",
    offer: "评估薪资和入职风险",
    rejected: "记录反馈并复盘",
    tailored: "检查简历版本并投递",
    withdrawn: "归档撤回原因",
  };
  return actions[status];
}

function isValidTransition(currentStatus: PipelineStatus, nextStatus: PipelineStatus) {
  return validTransitions[currentStatus].includes(nextStatus);
}

const initialEntries = createInitialEntries();

export const usePipelineStore = create<PipelineState>((set, get) => ({
  entries: initialEntries,
  addJob: (job, status = "interested") => {
    const exists = get().entries.some((entry) => entry.job.id === job.id);
    if (exists) {
      return "exists";
    }

    const now = new Date().toISOString();
    set((state) => ({
      entries: [
        {
          addedAt: now,
          job: cloneJob(job),
          nextAction: getDefaultNextAction(status),
          status,
          updatedAt: now,
        },
        ...state.entries,
      ],
    }));
    return "added";
  },
  moveEntry: (jobId, nextStatus) => {
    const entry = get().entries.find((item) => item.job.id === jobId);
    if (!entry) {
      return "missing";
    }
    if (!isValidTransition(entry.status, nextStatus)) {
      return "invalid";
    }

    set((state) => ({
      entries: state.entries.map((item) =>
        item.job.id === jobId
          ? {
              ...item,
              nextAction: getDefaultNextAction(nextStatus),
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    }));
    return "moved";
  },
  resetDemo: () => set({ entries: createInitialEntries() }),
}));
