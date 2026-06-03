import type { Priority } from "@/types/common";

export interface SprintTask {
  id: string;
  title: string;
  priority: Priority;
  status: "todo" | "doing" | "done";
}

export interface OpportunityDirection {
  name: string;
  heat: number;
  growth: number;
  fit: string;
  reason: string;
}

export interface DemoJob {
  id: string;
  title: string;
  company: string;
  city: string;
  priority: Priority;
  decision: string;
  match: number;
  source: {
    source_site: string;
    source_label: string;
    source_type: string;
    source_url: string;
    source_confidence: "high" | "medium" | "low";
  };
}
