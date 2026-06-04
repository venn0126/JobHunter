import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCareerVaultPath } from "@/services/careerVaultService";
import { getResumeStudioPath } from "@/services/resumeStudioService";
import type { CareerVaultItem, DemoJob, ResumeLabVersion } from "@/types/demo";

export function ResumeLabVersionDetail({
  evidenceLinks,
  jobs,
  primaryJobId,
  version,
}: {
  evidenceLinks: Array<{
    change: ResumeLabVersion["key_changes"][number];
    item?: CareerVaultItem;
  }>;
  jobs: DemoJob[];
  primaryJobId: string;
  version: ResumeLabVersion;
}) {
  return (
    <div className="space-y-5">
      <Card surface="subtle" className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="cyan">当前查看</Badge>
              <h3 className="text-xl font-semibold">{version.name}</h3>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{version.recommendation}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-semibold text-cyanGlow">{version.interview_rate}%</div>
            <div className="text-xs text-slate-500">面试率</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild size="sm">
            <Link to={getResumeStudioPath(primaryJobId)}>回到简历工作室修改</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/feedback">进入反馈复盘</Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card surface="subtle" className="p-5">
          <h4 className="mb-4 font-semibold">关键修改与证据</h4>
          <div className="space-y-4">
            {version.key_changes.map((change, index) => (
              <Card key={`${version.id}-${change.section}-${index}`} surface="subtle" className="p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone={change.evidence_id ? "blue" : "warning"}>{change.section}</Badge>
                  <span className="text-xs text-slate-500">{change.evidence_id ? "已关联证据" : "建议补充证据"}</span>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <ResumeChangeText title="修改前" value={change.before || "原简历未覆盖该内容。"} />
                  <ResumeChangeText title="优化后" value={change.after} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{change.reason}</p>
                {change.evidence_id ? (
                  <Button asChild className="mt-3" size="sm" variant="secondary">
                    <Link to={getCareerVaultPath(change.evidence_id, { jobId: primaryJobId })}>查看引用证据</Link>
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card surface="subtle" className="p-5">
            <h4 className="mb-3 font-semibold">证据入口</h4>
            {evidenceLinks.length > 0 ? (
              <div className="space-y-3">
                {evidenceLinks.map(({ change, item }) => (
                  <Link
                    className="block rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 p-3 transition hover:border-cyanGlow/40"
                    key={`${version.id}-${change.evidence_id}`}
                    to={getCareerVaultPath(change.evidence_id, { jobId: primaryJobId })}
                  >
                    <div className="font-medium text-cyanGlow">{item?.title ?? change.evidence_id}</div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">{item?.impact ?? change.reason}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-400">当前版本暂无直接证据引用，请先补充职业素材。</p>
            )}
          </Card>

          <Card surface="subtle" className="p-5">
            <h4 className="mb-3 font-semibold">投递过的岗位</h4>
            {jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link
                    className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyanGlow/30 hover:bg-cyanGlow/10"
                    key={job.id}
                    to={`/jobs/${job.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {job.company} / {job.city}
                        </div>
                      </div>
                      <Badge tone="blue" className="px-2 py-0.5 text-xs">
                        {job.priority}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-400">暂无岗位关联，后续由反馈复盘写入。</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResumeChangeText({ title, value }: { title: string; value: string }) {
  return (
    <Card surface="subtle" className="p-3">
      <div className="mb-2 text-xs text-slate-500">{title}</div>
      <p className="text-sm leading-6 text-slate-300">{value}</p>
    </Card>
  );
}
