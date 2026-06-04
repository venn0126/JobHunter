import { Link, useSearchParams } from "react-router-dom";
import { ResumeLabComparePanel } from "@/components/business/ResumeLabComparePanel";
import { ResumeLabVersionCard } from "@/components/business/ResumeLabVersionCard";
import { ResumeLabVersionDetail } from "@/components/business/ResumeLabVersionDetail";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { Panel } from "@/components/ui/Panel";
import { getResumeStudioPath } from "@/services/resumeStudioService";
import {
  getActiveResumeVersionId,
  getBestResumeVersion,
  getResumeLabComparePathForVersion,
  getResumeLab,
  getResumeLabPath,
  getResumeLabMetrics,
  getResumeVersionById,
  getResumeVersionEvidence,
  getResumeVersionJobs,
  getResumeVersionsByIds,
  resolveCompareVersionIds,
  sortResumeVersions,
} from "@/services/resumeLabService";
import { useCareerVaultStore } from "@/stores/careerVaultStore";

export function ResumeLabPage() {
  const [searchParams] = useSearchParams();
  const selectedVersionId = searchParams.get("version") ?? "";
  const requestedCompareVersionIds = searchParams.getAll("compare");
  const shouldShowCompare = requestedCompareVersionIds.length > 0;
  const vaultItems = useCareerVaultStore((state) => state.items);
  const lab = getResumeLab();
  const versions = sortResumeVersions(lab.versions);
  const bestVersion = getBestResumeVersion(lab);
  const activeVersionId = getActiveResumeVersionId(lab, selectedVersionId);
  const activeVersion = getResumeVersionById(lab, activeVersionId);
  const compareVersionIds = resolveCompareVersionIds(lab, activeVersionId, requestedCompareVersionIds);
  const compareVersions = getResumeVersionsByIds(lab, compareVersionIds);
  const metrics = getResumeLabMetrics(lab.versions);
  const editPath = getResumeStudioPath(lab.summary.primary_job_id);
  const activeVersionEvidence = activeVersion ? getResumeVersionEvidence(activeVersion, vaultItems) : [];
  const activeVersionJobs = activeVersion ? getResumeVersionJobs(activeVersion) : [];

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              P1-B/C 简历版本实验
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              用投递结果反向优化简历版本。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              Resume A/B Lab 汇总每个简历版本的投递数、面试数、无回复数和面试率，让用户知道下一轮优先使用哪个版本。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to={editPath}>回到简历工作室</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/feedback">查看反馈复盘</Link>
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard hint="当前可对比版本" label="版本数" value={`${metrics.versionCount}`} />
        <MetricCard hint="所有版本累计" label="投递数" value={`${metrics.appliedCount}`} />
        <MetricCard hint="所有版本累计" label="面试数" value={`${metrics.interviewCount}`} />
        <MetricCard hint="所有版本累计" label="无回复数" value={`${metrics.noResponseCount}`} />
        <MetricCard hint="按累计投递计算" label="综合面试率" value={`${metrics.interviewRate}%`} />
      </section>

      {bestVersion ? (
        <Card surface="accent" className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="cyan">最佳版本</Badge>
                <span className="text-lg font-semibold">{bestVersion.name}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{lab.summary.recommendation}</p>
            </div>
            <div className="rounded-2xl border border-cyanGlow/20 bg-ink-900/50 p-4 text-right">
              <div className="text-sm text-slate-400">{bestVersion.name}</div>
              <div className="mt-2 text-4xl font-semibold text-cyanGlow">{bestVersion.interview_rate}%</div>
              <div className="mt-1 text-xs text-slate-500">当前最高面试率</div>
            </div>
          </div>
        </Card>
      ) : null}

      <Panel title="简历版本列表">
        {versions.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {versions.map((version) => (
              <ResumeLabVersionCard
                active={version.id === activeVersionId}
                comparePath={getResumeLabComparePathForVersion(lab, activeVersionId, version.id)}
                editPath={editPath}
                key={version.id}
                versionPath={getResumeLabPath(version.id)}
                version={version}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="暂无简历版本"
            description="请先回到简历工作室保存一个简历版本，再进入版本实验查看投递表现。"
            action={
              <Button asChild>
                <Link to={editPath}>回到简历工作室</Link>
              </Button>
            }
          />
        )}
      </Panel>

      {activeVersion ? (
        <Panel title="版本详情">
          <ResumeLabVersionDetail
            evidenceLinks={activeVersionEvidence}
            jobs={activeVersionJobs}
            primaryJobId={lab.summary.primary_job_id}
            version={activeVersion}
          />
        </Panel>
      ) : null}

      {shouldShowCompare ? (
        <Panel title="版本对比">
          <ResumeLabComparePanel compareVersions={compareVersions} lab={lab} selectedVersionId={activeVersionId} />
        </Panel>
      ) : null}
    </div>
  );
}
