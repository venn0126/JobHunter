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

export interface InterviewGuideQuestion {
  id: string;
  question: string;
  intent: string;
  framework: string[];
  evidence_ids: string[];
  risk_tip: string;
}

export interface InterviewGuidePlanItem {
  day: number;
  title: string;
  focus: string;
}

export interface InterviewGuide {
  job_id: string;
  company_brief: {
    business: string;
    interview_style: string;
    role_focus: string;
  };
  interview_focus: string[];
  questions: InterviewGuideQuestion[];
  reverse_questions: string[];
  seven_day_plan: InterviewGuidePlanItem[];
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

export interface ResumeEvidenceRef {
  quote: string;
  source_id: string;
  source_type: "career_vault_project" | "career_vault_skill" | "career_vault_story";
}

export interface ResumeStudioSection {
  id: string;
  after: string;
  before: string;
  evidence: ResumeEvidenceRef[];
  missing_evidence_id?: string;
  reason: string;
  section: string;
  status: "可直接使用" | "建议补充";
}

export interface ResumeStudioDraft {
  company: string;
  job_id: string;
  job_title: string;
  keywords: string[];
  sections: ResumeStudioSection[];
  summary: {
    needs_evidence: number;
    readiness: string;
    ready_sections: number;
    target_role: string;
  };
}

export interface ResumeLabVersion {
  id: string;
  name: string;
  status: "推荐使用" | "继续观察" | "建议调整" | "已停用";
  applied_count: number;
  best_for: string[];
  interview_count: number;
  interview_rate: number;
  key_changes: Array<{
    after: string;
    before: string;
    evidence_id?: string;
    reason: string;
    section: string;
  }>;
  no_response_count: number;
  recommendation: string;
  strengths: string[];
  target_job_ids: string[];
  improvement_tips: string[];
  updated_at: string;
}

export interface ResumeLab {
  summary: {
    best_version_id: string;
    primary_job_id: string;
    recommendation: string;
  };
  versions: ResumeLabVersion[];
}
