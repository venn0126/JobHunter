import careerPersonas from "@/mocks/career-personas.json";
import dashboard from "@/mocks/dashboard.json";
import jobs from "@/mocks/jobs.json";
import market from "@/mocks/opportunity-market.json";
import sprint from "@/mocks/sprint-plan.json";
import type {
  DashboardMetric,
  DashboardRadarItem,
  DemoJob,
  OpportunityMarket,
  PipelineSummary,
  SprintTask,
} from "@/types/demo";

export const demoData = {
  careerPersonas,
  dashboard: dashboard as {
    metrics: DashboardMetric[];
    pipeline: PipelineSummary[];
    radar: DashboardRadarItem[];
  },
  jobs: jobs as { items: DemoJob[] },
  market: market as OpportunityMarket,
  sprint: sprint as { today: SprintTask[] },
};
