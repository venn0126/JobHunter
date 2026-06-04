import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PipelineKanbanCard } from "@/components/business/PipelineKanbanCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { usePipelineDrag } from "@/hooks/usePipelineDrag";
import { useToast } from "@/hooks/useToast";
import { getPipelineMoveToast } from "@/services/pipelineNoticeService";
import {
  getActivePipelineEntries,
  getArchivedPipelineEntries,
  getPipelineEntriesByStatus,
  getPipelineSummary,
  getNextPipelineStatuses,
  pipelineColumns,
  pipelineStatusLabel,
  usePipelineStore,
  type PipelineEntry,
} from "@/stores/pipelineStore";
import type { PipelineStatus } from "@/types/common";

export function PipelinePage() {
  const [searchParams] = useSearchParams();
  const focusJobId = searchParams.get("job") ?? "";
  const { showToast } = useToast();
  const entries = usePipelineStore((state) => state.entries);
  const moveEntry = usePipelineStore((state) => state.moveEntry);
  const resetDemo = usePipelineStore((state) => state.resetDemo);
  const summary = useMemo(() => getPipelineSummary(entries), [entries]);
  const archivedEntries = useMemo(() => getArchivedPipelineEntries(entries), [entries]);
  const activeEntries = useMemo(() => getActivePipelineEntries(entries), [entries]);

  const handleMove = (jobId: string, status: PipelineStatus) => {
    const result = moveEntry(jobId, status);
    showToast(getPipelineMoveToast(result, status));
  };
  const pipelineDrag = usePipelineDrag({ entries, onMove: handleMove });

  const handleResetDemo = () => {
    resetDemo();
    showToast({ title: "已恢复 Demo 管线" });
  };

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              求职管线
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              把每个岗位推进到明确的下一步。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              Kanban 管理感兴趣、简历定制、投递、HR 沟通、面试和 Offer 阶段；移动端可用按钮切换状态。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/jobs">从岗位雷达加入</Link>
            </Button>
            <Button variant="secondary" onClick={handleResetDemo}>
              恢复 Demo 管线
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {summary.map((item) => (
          <Card key={item.id} surface="subtle" className="p-4">
            <div className="text-sm text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-semibold">{item.count}</div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-6">
        {pipelineColumns.map((column) => {
          const columnEntries = getPipelineEntriesByStatus(entries, column.id);
          return (
            <Panel key={column.id} title={column.label}>
              <div className="mb-3 text-xs leading-5 text-slate-500">桌面端可拖拽卡片到目标列；移动端使用卡片按钮推进。</div>
              <div
                className={
                  pipelineDrag.dragOverStatus === column.id
                    ? "min-h-40 space-y-3 rounded-2xl border border-cyanGlow/40 bg-cyanGlow/10 p-2"
                    : "min-h-40 space-y-3 rounded-2xl border border-transparent p-2"
                }
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    pipelineDrag.clearDragOver();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  pipelineDrag.setDragOverStatus(column.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  pipelineDrag.handleDrop(column.id);
                }}
              >
                {columnEntries.length > 0 ? (
                  columnEntries.map((entry) => (
                    <div
                      key={entry.job.id}
                      className={focusJobId === entry.job.id ? "rounded-2xl ring-2 ring-cyanGlow/50" : undefined}
                    >
                      <PipelineKanbanCard
                        dragging={pipelineDrag.draggedJobId === entry.job.id}
                        entry={entry}
                        onDragEnd={pipelineDrag.clearDrag}
                        onDragStart={() => pipelineDrag.startDrag(entry.job.id)}
                        onMove={handleMove}
                      />
                    </div>
                  ))
                ) : (
                  <Card surface="subtle" className="p-4 text-sm leading-6 text-slate-500">
                    暂无岗位
                  </Card>
                )}
              </div>
            </Panel>
          );
        })}
      </section>

      {archivedEntries.length > 0 ? (
        <Panel title="归档结果">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {archivedEntries.map((entry) => (
              <Card key={entry.job.id} surface="subtle" className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{entry.job.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{entry.job.company}</div>
                  </div>
                  <Badge tone={entry.status === "rejected" ? "danger" : "muted"}>
                    {pipelineStatusLabel[entry.status]}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{entry.nextAction}</p>
                <Button asChild className="mt-4" size="sm" variant="secondary">
                  <Link to={`/jobs/${entry.job.id}`}>查看决策卡</Link>
                </Button>
              </Card>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel title="移动端快捷推进">
        <div className="grid gap-3 md:grid-cols-2">
          {activeEntries.map((entry) => (
            <MobileMoveCard key={entry.job.id} entry={entry} onMove={handleMove} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function MobileMoveCard({
  entry,
  onMove,
}: {
  entry: PipelineEntry;
  onMove: (jobId: string, status: PipelineStatus) => void;
}) {
  const nextStatuses = getNextPipelineStatuses(entry.status);

  return (
    <Card surface="subtle" className="p-4">
      <div className="font-medium">{entry.job.title}</div>
      <div className="mt-1 text-sm text-slate-400">
        当前：{pipelineStatusLabel[entry.status]} · {entry.job.company}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {nextStatuses.length > 0 ? (
          nextStatuses.map((status) => (
            <Button key={status} size="sm" variant="secondary" onClick={() => onMove(entry.job.id, status)}>
              到{pipelineStatusLabel[status]}
            </Button>
          ))
        ) : (
          <span className="text-sm text-slate-500">当前状态暂无可推进动作</span>
        )}
      </div>
    </Card>
  );
}
