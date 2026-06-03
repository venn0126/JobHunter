import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { JobCard } from "@/components/business/JobCard";
import { SourceBadge } from "@/components/business/SourceBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import {
  getFilteredJobs,
  selectJobOptions,
  useJobStore,
  type JobSortKey,
} from "@/stores/jobStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import type { Priority } from "@/types/common";
import type { DemoJob } from "@/types/demo";

const priorityOptions: Array<"" | Priority> = ["", "P0", "P1", "P2"];
const pageSize = 6;

export function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filters = useJobStore((state) => state.filters);
  const jobs = useJobStore((state) => state.jobs);
  const sortKey = useJobStore((state) => state.sortKey);
  const setFilter = useJobStore((state) => state.setFilter);
  const setSortKey = useJobStore((state) => state.setSortKey);
  const resetFilters = useJobStore((state) => state.resetFilters);
  const addToPipeline = usePipelineStore((state) => state.addJob);
  const options = useMemo(() => selectJobOptions(jobs), [jobs]);
  const filteredJobs = useMemo(() => getFilteredJobs(jobs, filters, sortKey), [filters, jobs, sortKey]);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const visibleJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const role = searchParams.get("role");
    if (role) {
      setFilter("direction", role);
    }
  }, [searchParams, setFilter]);

  useEffect(() => {
    setPage(1);
  }, [filters.city, filters.direction, filters.priority, filters.sourceSite, sortKey]);

  const handleAddToPipeline = (job: DemoJob) => {
    const result = addToPipeline(job);
    const message = result === "added" ? `已加入管线：${job.title}` : `已在管线中：${job.title}`;
    setNotice(message);
    navigate(`/pipeline?job=${job.id}`, { state: { notice: message } });
  };

  const handleViewDecision = (job: DemoJob) => {
    navigate(`/jobs/${job.id}`);
  };

  return (
    <div className="space-y-6">
      <Card as="section" surface="hero" className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan" className="mb-4">
              岗位雷达
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              按优先级筛出今天最值得投的岗位。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
              支持城市、来源、优先级和方向筛选；从机会广场进入时自动带入方向筛选条件。
            </p>
          </div>
          <div className="rounded-3xl border border-cyanGlow/20 bg-cyanGlow/10 p-5 text-right">
            <div className="text-sm text-slate-400">当前结果</div>
            <div className="mt-2 text-4xl font-semibold text-cyanGlow">{filteredJobs.length}</div>
          </div>
        </div>
      </Card>

      <Panel title="筛选与排序">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SelectBox label="城市" value={filters.city} values={options.cities} onChange={(value) => setFilter("city", value)} />
          <SelectBox
            label="方向"
            value={filters.direction}
            values={options.directions}
            onChange={(value) => setFilter("direction", value)}
          />
          <SelectBox
            label="来源"
            value={filters.sourceSite}
            values={options.sourceSites}
            onChange={(value) => setFilter("sourceSite", value)}
          />
          <SelectBox
            label="优先级"
            value={filters.priority}
            values={priorityOptions.filter(Boolean)}
            onChange={(value) => setFilter("priority", value as "" | Priority)}
          />
          <SelectBox
            label="排序"
            value={sortKey}
            values={["recommended", "match"]}
            valueLabel={(value) => (value === "recommended" ? "综合推荐" : "匹配度")}
            onChange={(value) => setSortKey(value as JobSortKey)}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={resetFilters}>
            清空筛选
          </Button>
          {notice ? <span className="text-sm text-cyanGlow">{notice}</span> : null}
        </div>
      </Panel>

      {filteredJobs.length > 0 ? (
        <>
          <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAddToPipeline={handleAddToPipeline}
                onViewDecision={handleViewDecision}
              />
            ))}
          </section>
          <Card surface="subtle" className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              第 {page} / {pageCount} 页 · 已预留 100+ 岗位分页能力
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                上一页
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => setPage((value) => value + 1)}
              >
                下一页
              </Button>
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          title="没有符合条件的岗位"
          description="可以清空筛选，或返回机会广场重新选择方向。当前空状态用于验证筛选边界不崩溃。"
          action={
            <>
            <Button onClick={resetFilters}>清空筛选</Button>
            <Button asChild variant="secondary">
              <Link to="/opportunity">返回机会广场</Link>
            </Button>
            </>
          }
        />
      )}

      <Panel title="来源标识边界验证">
        <div className="flex flex-wrap gap-2">
          {jobs.map((job) => (
            <SourceBadge key={job.id} source={job.source} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SelectBox({
  label,
  onChange,
  value,
  valueLabel,
  values,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  valueLabel?: (value: string) => string;
  values: string[];
}) {
  return (
    <label>
      <div className="mb-2 text-xs text-slate-500">{label}</div>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">全部</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {valueLabel ? valueLabel(item) : item}
          </option>
        ))}
      </Select>
    </label>
  );
}
