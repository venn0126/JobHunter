import { create } from "zustand";
import { demoData } from "@/data/demoData";
import type { Priority } from "@/types/common";
import type { DemoJob } from "@/types/demo";

export type JobSortKey = "recommended" | "match";

export interface JobFilters {
  city: string;
  direction: string;
  priority: "" | Priority;
  sourceSite: string;
}

interface PipelineEntry {
  addedAt: string;
  job: DemoJob;
}

interface JobState {
  filters: JobFilters;
  jobs: DemoJob[];
  pipelineEntries: PipelineEntry[];
  sortKey: JobSortKey;
  addToPipeline: (job: DemoJob) => "added" | "exists";
  resetFilters: () => void;
  setFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  setSortKey: (sortKey: JobSortKey) => void;
}

export const emptyJobFilters: JobFilters = {
  city: "",
  direction: "",
  priority: "",
  sourceSite: "",
};

export const useJobStore = create<JobState>((set, get) => ({
  filters: emptyJobFilters,
  jobs: demoData.jobs.items,
  pipelineEntries: [],
  sortKey: "recommended",
  addToPipeline: (job) => {
    const exists = get().pipelineEntries.some((entry) => entry.job.id === job.id);
    if (exists) {
      return "exists";
    }
    set((state) => ({
      pipelineEntries: [{ addedAt: new Date().toISOString(), job }, ...state.pipelineEntries],
    }));
    return "added";
  },
  resetFilters: () => set({ filters: emptyJobFilters }),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setSortKey: (sortKey) => set({ sortKey }),
}));

export function getFilteredJobs(jobs: DemoJob[], filters: JobFilters, sortKey: JobSortKey) {
  const filtered = jobs.filter((job) => {
    const cityMatched = !filters.city || job.city === filters.city;
    const directionMatched = !filters.direction || job.direction === filters.direction;
    const priorityMatched = !filters.priority || job.priority === filters.priority;
    const sourceMatched = !filters.sourceSite || job.source.source_site === filters.sourceSite;
    return cityMatched && directionMatched && priorityMatched && sourceMatched;
  });

  return filtered.sort((left, right) => {
    if (sortKey === "match") {
      return right.match - left.match;
    }

    const priorityWeight: Record<Priority, number> = { P0: 3, P1: 2, P2: 1 };
    const priorityDiff = priorityWeight[right.priority] - priorityWeight[left.priority];
    return priorityDiff || right.match - left.match;
  });
}

export function selectJobOptions(jobs: DemoJob[]) {
  return {
    cities: unique(jobs.map((job) => job.city)),
    directions: unique(jobs.map((job) => job.direction)),
    sourceSites: unique(jobs.map((job) => job.source.source_site)),
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
