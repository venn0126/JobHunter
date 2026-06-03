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
  direction: string;
  salary: string;
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

export interface JobDecisionCard {
  job_id: string;
  decision: string;
  priority: Priority;
  overall_grade: string;
  scores: {
    match: number;
    job_quality: number;
    growth: number;
    salary: number;
    competition_risk: number;
    apply_cost: number;
  };
  hit_reasons: string[];
  gaps: Array<{
    evidence_id: string;
    text: string;
  }>;
  risks: Array<{
    evidence_id?: string;
    fix_action: string;
    level: "低" | "中" | "高";
    text: string;
    type: string;
  }>;
  next_actions: Array<{
    label: string;
    target_path: string;
  }>;
}

export interface RecruiterLens {
  job_id: string;
  first_impression: string;
  highlights: string[];
  concerns: string[];
  likely_questions: string[];
  improve_tips: string[];
}

export interface CareerVaultItem {
  id: string;
  type: "project" | "skill" | "story" | "certificate";
  title: string;
  summary: string;
  tags: string[];
  skills: string[];
  impact: string;
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}
