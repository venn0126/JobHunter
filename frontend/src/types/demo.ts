import type { Priority } from "@/types/common";

export interface SprintTask {
  id: string;
  title: string;
  priority: Priority;
  status: "todo" | "doing" | "done";
  target_path: string;
}

export interface OpportunityDirection {
  name: string;
  heat: number;
  growth: number;
  fit: string;
  reason: string;
  tags: string[];
  filters: {
    role: string;
    skills: string[];
  };
}

export interface GlobalHotRole {
  name: string;
  heat: number;
  growth: number;
  tags: string[];
  filters: {
    role: string;
    skills: string[];
  };
}

export interface GlobalHotCity {
  name: string;
  heat: number;
}

export interface GlobalHotSkill {
  name: string;
  heat: number;
  growth: number;
}

export interface OpportunityMarket {
  mode: "global" | "personalized";
  global: {
    hot_roles: GlobalHotRole[];
    hot_cities: GlobalHotCity[];
    hot_skills: GlobalHotSkill[];
  };
  personalized: {
    recommended_directions: OpportunityDirection[];
    next_actions: string[];
  };
  recommended_directions: OpportunityDirection[];
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

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface DashboardRadarItem {
  label: string;
  value: number;
}

export interface PipelineSummary {
  id: string;
  label: string;
  count: number;
}
