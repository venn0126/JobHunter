import { Link } from "react-router-dom";
import { SourceBadge } from "@/components/business/SourceBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getNextPipelineStatuses, pipelineStatusLabel, type PipelineEntry } from "@/stores/pipelineStore";
import type { PipelineStatus } from "@/types/common";

export function PipelineKanbanCard({
  entry,
  onMove,
}: {
  entry: PipelineEntry;
  onMove: (jobId: string, status: PipelineStatus) => void;
}) {
  const nextStatuses = getNextPipelineStatuses(entry.status);

  return (
    <Card surface="subtle" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{entry.job.title}</div>
          <div className="mt-1 text-sm text-slate-400">
            {entry.job.company} · {entry.job.city}
          </div>
        </div>
        <Badge tone={entry.job.priority === "P0" ? "cyan" : "blue"} className="px-2 py-0.5 text-xs">
          {entry.job.priority}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SourceBadge source={entry.job.source} />
        <Badge className="px-2 py-0.5 text-xs">{entry.job.match}% 匹配</Badge>
      </div>

      <Card surface="subtle" className="mt-3 border-cyanGlow/15 bg-cyanGlow/5 p-3">
        <div className="text-xs text-slate-500">下一步</div>
        <div className="mt-1 text-sm leading-6 text-slate-300">{entry.nextAction}</div>
      </Card>

      <div className="mt-3 text-xs leading-5 text-slate-500">更新于 {formatRelativeTime(entry.updatedAt)}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link to={`/jobs/${entry.job.id}`}>决策卡</Link>
        </Button>
        {nextStatuses.length > 0 ? (
          nextStatuses.map((status) => (
            <Button key={status} size="sm" variant="ghost" onClick={() => onMove(entry.job.id, status)}>
              到{pipelineStatusLabel[status]}
            </Button>
          ))
        ) : (
          <span className="text-xs text-slate-500">暂无可推进动作</span>
        )}
      </div>
    </Card>
  );
}

function formatRelativeTime(value: string) {
  const diff = Date.now() - Date.parse(value);
  const minutes = Math.max(1, Math.floor(diff / 1000 / 60));
  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }
  return `${Math.floor(hours / 24)} 天前`;
}
