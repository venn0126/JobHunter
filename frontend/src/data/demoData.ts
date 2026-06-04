import careerPersonas from "@/mocks/career-personas.json";
import careerVault from "@/mocks/career-vault.json";
import dashboard from "@/mocks/dashboard.json";
import decisionCards from "@/mocks/job-decision-cards.json";
import jobs from "@/mocks/jobs.json";
import market from "@/mocks/opportunity-market.json";
import recruiterLens from "@/mocks/recruiter-lens.json";
import resumeLab from "@/mocks/resume-lab.json";
import resumeStudio from "@/mocks/resume-studio.json";
import sprint from "@/mocks/sprint-plan.json";
import type {
  DashboardMetric,
  DashboardRadarItem,
  CareerVaultItem,
  DemoJob,
  JobDecisionCard,
  OpportunityMarket,
  PipelineSummary,
  RecruiterLens,
  ResumeLab,
  ResumeStudioDraft,
  SprintTask,
} from "@/types/demo";

export const demoData = {
  careerPersonas,
  careerVault: careerVault as { items: CareerVaultItem[] },
  dashboard: dashboard as {
    metrics: DashboardMetric[];
    pipeline: PipelineSummary[];
    radar: DashboardRadarItem[];
  },
  decisionCards: decisionCards as { items: JobDecisionCard[] },
  jobs: jobs as { items: DemoJob[] },
  market: market as OpportunityMarket,
  recruiterLens: recruiterLens as { items: RecruiterLens[] },
  resumeLab: resumeLab as ResumeLab,
  resumeStudio: resumeStudio as { items: ResumeStudioDraft[] },
  sprint: sprint as { today: SprintTask[] },
};
