import careerPersonas from "@/mocks/career-personas.json";
import dashboard from "@/mocks/dashboard.json";
import decisionCards from "@/mocks/job-decision-cards.json";
import jobs from "@/mocks/jobs.json";
import market from "@/mocks/opportunity-market.json";
import recruiterLens from "@/mocks/recruiter-lens.json";
import sprint from "@/mocks/sprint-plan.json";
import type {
  DashboardMetric,
  DashboardRadarItem,
  DemoJob,
  JobDecisionCard,
  OpportunityMarket,
  PipelineSummary,
  RecruiterLens,
  SprintTask,
} from "@/types/demo";

export const demoData = {
  careerPersonas,
  dashboard: dashboard as {
    metrics: DashboardMetric[];
    pipeline: PipelineSummary[];
    radar: DashboardRadarItem[];
  },
  decisionCards: decisionCards as { items: JobDecisionCard[] },
  jobs: jobs as { items: DemoJob[] },
  market: market as OpportunityMarket,
  recruiterLens: recruiterLens as { items: RecruiterLens[] },
  sprint: sprint as { today: SprintTask[] },
};
