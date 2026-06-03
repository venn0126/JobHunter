import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/business/SourceBadge";
import type { DemoJob } from "@/types/demo";

export function JobCard({
  job,
  onAddToPipeline,
  onViewDecision,
}: {
  job: DemoJob;
  onAddToPipeline?: (job: DemoJob) => void;
  onViewDecision?: (job: DemoJob) => void;
}) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate font-medium">{job.title}</div>
          <div className="mt-1 text-sm text-slate-400">
            {job.company} · {job.city} · {job.salary}
          </div>
          <div className="mt-1 text-xs text-slate-500">{job.direction}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SourceBadge source={job.source} />
            <Badge tone="blue" className="px-2 py-0.5 text-xs">
              {job.decision}
            </Badge>
            {job.source.source_url ? (
              <a
                className="text-xs text-cyanGlow hover:underline"
                href={job.source.source_url}
                rel="noreferrer"
                target="_blank"
              >
                原始链接
              </a>
            ) : (
              <span className="text-xs text-slate-500">无原始链接</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-semibold text-cyanGlow">{job.match}%</div>
          <div className="text-xs text-slate-500">{job.priority}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onViewDecision?.(job)}>
          查看决策
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onAddToPipeline?.(job)}>
          加入管线
        </Button>
      </div>
    </Card>
  );
}
