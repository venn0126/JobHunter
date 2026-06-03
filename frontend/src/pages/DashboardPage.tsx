import { Link } from "react-router-dom";
import { AbilityRadar } from "@/components/business/AbilityRadar";
import { JobCard } from "@/components/business/JobCard";
import { OpportunityHeatCard } from "@/components/business/OpportunityHeatCard";
import { PipelineBoard } from "@/components/business/PipelineBoard";
import { SprintTaskCard } from "@/components/business/SprintTaskCard";
import { UpdateNotice } from "@/components/business/UpdateNotice";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Panel } from "@/components/ui/Panel";
import { demoData } from "@/data/demoData";
import { useAppStore } from "@/stores/appStore";

export function DashboardPage() {
  const dataMode = useAppStore((state) => state.dataMode);
  const { dashboard, jobs, market, sprint } = demoData;
  const topJobs = jobs.items.slice(0, 3);

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <Badge tone="cyan" className="mb-4">
              P0 4.4 首页驾驶舱
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              从海投到精投，建立可解释的 AI 求职作战驾驶舱。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              首页集中展示今日 Sprint、机会热度、Top 推荐岗位和求职管线，让评委 30 秒内看懂完整求职闭环。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["求职身份", "机会热度", "岗位雷达", "求职管线"].map((item) => (
                <Badge key={item} className="px-4 py-2">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/jobs">查看岗位雷达</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/pipeline">查看求职管线</Link>
              </Button>
            </div>
          </div>
          <Card className="border-cyanGlow/20 bg-ink-900/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-400">当前数据模式</div>
              <Badge tone="blue">{dataMode}</Badge>
            </div>
            <AbilityRadar items={dashboard.radar} />
          </Card>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.id} hint={metric.hint} label={metric.label} value={metric.value} />
        ))}
      </section>

      <UpdateNotice />

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="今日求职 Sprint">
          <div className="space-y-3">
            {sprint.today.map((task) => (
              <SprintTaskCard key={task.id} task={task} />
            ))}
          </div>
        </Panel>
        <Panel title="机会热度广场">
          <div className="space-y-3">
            {market.recommended_directions.map((item) => (
              <OpportunityHeatCard key={item.name} item={item} />
            ))}
          </div>
        </Panel>
        <Panel title="岗位雷达 Top 推荐">
          <div className="space-y-3">
            {topJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="求职管线">
        <PipelineBoard columns={dashboard.pipeline} />
      </Panel>
    </div>
  );
}
