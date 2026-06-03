import { JobCard } from "@/components/business/JobCard";
import { PipelineBoard } from "@/components/business/PipelineBoard";
import { SprintTaskCard } from "@/components/business/SprintTaskCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Panel } from "@/components/ui/Panel";
import { demoData } from "@/data/demoData";
import { useAppStore } from "@/stores/appStore";

export function DashboardPage() {
  const dataMode = useAppStore((state) => state.dataMode);
  const { jobs, market, sprint } = demoData;

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <Badge tone="cyan" className="mb-4">
              P0 4.2 全局布局与视觉基础
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              从海投到精投，建立可解释的 AI 求职作战驾驶舱。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              当前阶段已接入全局布局、暗色视觉基准、可复用组件库和首页业务组件，为后续岗位雷达、管线和决策卡扩展打底。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["求职身份", "机会热度", "岗位雷达", "求职管线"].map((item) => (
                <Badge key={item} className="px-4 py-2">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <Card className="border-cyanGlow/20 bg-ink-900/80 p-5">
            <div className="text-sm text-slate-400">当前数据模式</div>
            <div className="mt-3 text-5xl font-semibold text-cyanGlow">{dataMode}</div>
            <div className="mt-6 h-36 rounded-full border border-cyanGlow/20 bg-[radial-gradient(circle,rgba(53,242,208,0.30),rgba(74,163,255,0.10)_48%,transparent_70%)]" />
          </Card>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="今日优先岗位" value="2" />
        <MetricCard label="强推荐岗位" value="1" />
        <MetricCard label="待跟进事项" value="3" />
        <MetricCard label="面试准备任务" value="1" />
      </section>

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
              <Card key={item.name} surface="subtle" className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-cyanGlow">{item.heat}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.reason}</p>
              </Card>
            ))}
          </div>
        </Panel>
        <Panel title="岗位雷达 Top 推荐">
          <div className="space-y-3">
            {jobs.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </Panel>
      </section>

      <Panel title="求职管线">
        <PipelineBoard />
      </Panel>
    </div>
  );
}
