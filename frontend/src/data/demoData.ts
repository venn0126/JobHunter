import careerPersonas from "@/mocks/career-personas.json";
import jobs from "@/mocks/jobs.json";
import market from "@/mocks/opportunity-market.json";
import sprint from "@/mocks/sprint-plan.json";
import type { DemoJob, OpportunityDirection, SprintTask } from "@/types/demo";

export const demoData = {
  careerPersonas,
  jobs: jobs as { items: DemoJob[] },
  market: market as { mode: string; recommended_directions: OpportunityDirection[] },
  sprint: sprint as { today: SprintTask[] },
};
