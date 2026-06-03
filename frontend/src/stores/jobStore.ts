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

interface JobState {
  filters: JobFilters;
  jobs: DemoJob[];
  sortKey: JobSortKey;
  resetDemo: () => void;
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

function cloneDemoJobs() {
  return demoData.jobs.items.map((job) => ({
    ...job,
    source: { ...job.source },
  }));
}

function createDemoJobState() {
  return {
    filters: { ...emptyJobFilters },
    jobs: cloneDemoJobs(),
    sortKey: "recommended" as const,
  };
}

export const useJobStore = create<JobState>((set) => ({
  ...createDemoJobState(),
  resetDemo: () => set(createDemoJobState()),
  resetFilters: () => set({ filters: { ...emptyJobFilters } }),
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
