import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { FeedbackRecordCard } from "@/components/business/FeedbackRecordCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompactStatCard } from "@/components/ui/CompactStatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { Panel } from "@/components/ui/Panel";
import {
  getFeedbackMetrics,
  getFeedbackOutcomeRows,
  getFeedbackReview,
  getFeedbackTrend,
  getRecentFeedbackViews,
  getResumeVersionFeedbackRows,
  getUpcomingFollowUps,
  type FeedbackRecordView,
} from "@/services/feedbackReviewService";
import type { FeedbackStrategySuggestion } from "@/types/demo";

type BadgeTone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

export function FeedbackPage() {
  const review = getFeedbackReview();
  const metrics = getFeedbackMetrics(review.records);
  const outcomeRows = getFeedbackOutcomeRows(review.records);
  const versionRows = getResumeVersionFeedbackRows(review.records);
  const recentViews = getRecentFeedbackViews(review.records);
  const followUps = getUpcomingFollowUps(review.records);
  const trend = getFeedbackTrend(review.records);

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              P1-F 投递反馈复盘
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              把每次投递结果，反向喂给下一轮策略。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              汇总投递、无回复、被拒和面试结果，识别哪个简历版本、岗位方向和证据缺口最影响面试率。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/resume-lab">查看简历版本实验</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/pipeline">回到求职管线</Link>
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard hint="当前记录样本" label="投递记录" value={`${metrics.appliedCount}`} />
        <MetricCard hint="面试 / Offer" label="面试数" value={`${metrics.interviewCount}`} />
        <MetricCard hint="目标持续提升" label="面试率" value={`${metrics.interviewRate}%`} />
        <MetricCard hint="需主动跟进" label="无回复率" value={`${metrics.noResponseRate}%`} />
        <MetricCard hint="简历筛选未通过" label="被拒数" value={`${metrics.rejectedCount}`} />
        <MetricCard hint="仍需推进" label="待跟进" value={`${metrics.activeFollowUpCount}`} />
      </section>

      <Card surface="accent" className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="cyan">策略建议</Badge>
              <span className="text-lg font-semibold">{review.summary.primary_focus}</span>
            </div>
            <p className="text-sm leading-6 text-slate-300">{review.summary.recommendation}</p>
          </div>
          <div className="rounded-2xl border border-cyanGlow/20 bg-ink-900/50 p-4 text-right">
            <div className="text-sm text-slate-400">目标面试率</div>
            <div className="mt-2 text-4xl font-semibold text-cyanGlow">{review.summary.target_interview_rate}%</div>
          </div>
        </div>
      </Card>

      {review.records.length > 0 ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel title="结果分布">
              <div className="space-y-4">
                {outcomeRows.map((row) => (
                  <ProgressRow
                    count={row.count}
                    key={row.id}
                    label={row.label}
                    total={review.records.length}
                    tone={getOutcomeTone(row.id)}
                  />
                ))}
              </div>
            </Panel>

            <Panel title="复盘趋势">
              <div className="grid gap-3 md:grid-cols-2">
                {trend.map((item) => (
                  <Card key={item.week} surface="subtle" className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{item.week}</div>
                      <Badge tone={item.interviewRate >= review.summary.target_interview_rate ? "cyan" : "warning"}>
                        {item.interviewRate}% 面试率
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <CompactStatCard label="投递" value={item.applied} />
                      <CompactStatCard label="面试" value={item.interviews} />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyanGlow to-blueGlow"
                        style={{ width: `${Math.min(100, item.interviewRate)}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </Panel>
          </section>

          <Panel title="简历版本反馈表现">
            <div className="grid gap-4 xl:grid-cols-3">
              {versionRows.map((row) => (
                <Card key={row.version.id} surface="subtle" className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{row.version.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{row.version.status}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold text-cyanGlow">{row.interviewRate}%</div>
                      <div className="text-xs text-slate-500">反馈面试率</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <CompactStatCard label="投递" value={row.appliedCount} />
                    <CompactStatCard label="面试" value={row.interviewCount} />
                    <CompactStatCard label="无回复" value={row.noResponseCount} />
                  </div>
                  <Button asChild className="mt-4" size="sm" variant="secondary">
                    <Link to={`/resume-lab?version=${row.version.id}`}>查看版本详情</Link>
                  </Button>
                </Card>
              ))}
            </div>
          </Panel>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Panel title="最近反馈记录">
              <div className="space-y-4">
                {recentViews.map((view) => (
                  <FeedbackRecordCard key={view.record.id} view={view} />
                ))}
              </div>
            </Panel>

            <div className="space-y-6">
              <Panel title="最近跟进">
                <div className="space-y-3">
                  {followUps.map((view) => (
                    <FollowUpCard key={view.record.id} view={view} />
                  ))}
                </div>
              </Panel>

              <Panel title="下一轮策略">
                <div className="space-y-3">
                  {review.strategy_suggestions.map((suggestion) => (
                    <StrategyCard key={suggestion.id} suggestion={suggestion} />
                  ))}
                </div>
              </Panel>
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          title="暂无投递反馈"
          description="先从求职管线记录投递状态，或进入简历版本实验查看版本表现。"
          action={
            <>
              <Button asChild>
                <Link to="/pipeline">回到求职管线</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/resume-lab">查看简历版本实验</Link>
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

function ProgressRow({
  count,
  label,
  total,
  tone,
}: {
  count: number;
  label: string;
  total: number;
  tone: BadgeTone;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Badge tone={tone} className="px-2 py-0.5 text-xs">
            {label}
          </Badge>
          <span className="text-slate-400">{count} 条</span>
        </div>
        <span className="text-cyanGlow">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-cyanGlow to-blueGlow" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function FollowUpCard({ view }: { view: FeedbackRecordView }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-medium">{view.job?.title ?? view.record.job_id}</div>
          <div className="mt-1 text-sm text-slate-400">{view.job?.company ?? "未知公司"}</div>
        </div>
        <Badge tone="warning">{view.record.follow_up_at}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{view.record.next_action}</p>
    </Card>
  );
}

function StrategyCard({ suggestion }: { suggestion: FeedbackStrategySuggestion }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={suggestion.priority === "P0" ? "danger" : suggestion.priority === "P1" ? "warning" : "blue"}>
          {suggestion.priority}
        </Badge>
        <div className="font-medium">{suggestion.title}</div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{suggestion.description}</p>
      <Button asChild className="mt-4" size="sm" variant="secondary">
        <Link to={suggestion.action_path}>执行建议</Link>
      </Button>
    </Card>
  );
}

function getOutcomeTone(outcome: string): BadgeTone {
  if (outcome === "interview" || outcome === "offer") {
    return "cyan";
  }
  if (outcome === "rejected") {
    return "danger";
  }
  if (outcome === "no_response") {
    return "warning";
  }
  return "blue";
}
