import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ResumeLabVersion } from "@/types/demo";

export function ResumeLabVersionCard({
  active,
  comparePath,
  editPath,
  versionPath,
  version,
}: {
  active: boolean;
  comparePath: string;
  editPath: string;
  versionPath: string;
  version: ResumeLabVersion;
}) {
  return (
    <Card surface="subtle" className={active ? "border-cyanGlow/40 bg-cyanGlow/10 p-5 shadow-glow" : "p-5"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{version.name}</h3>
            <Badge tone={getStatusTone(version.status)}>{version.status}</Badge>
          </div>
          <div className="mt-2 text-xs text-slate-500">最近更新：{version.updated_at}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-cyanGlow">{version.interview_rate}%</div>
          <div className="text-xs text-slate-500">面试率</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <VersionMetric label="投递" value={version.applied_count} />
        <VersionMetric label="面试" value={version.interview_count} />
        <VersionMetric label="无回复" value={version.no_response_count} />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs text-slate-500">适合岗位方向</div>
        <div className="flex flex-wrap gap-2">
          {version.best_for.map((item) => (
            <Badge key={item} tone="blue" className="px-2 py-0.5 text-xs">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">{version.recommendation}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild size="sm" variant="secondary">
          <Link to={versionPath}>查看详情</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link to={comparePath}>加入对比</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link to={editPath}>回到简历工作室修改</Link>
        </Button>
      </div>
    </Card>
  );
}

function VersionMetric({ label, value }: { label: string; value: number }) {
  return (
    <Card surface="subtle" className="p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </Card>
  );
}

function getStatusTone(status: ResumeLabVersion["status"]) {
  if (status === "推荐使用") {
    return "cyan";
  }
  if (status === "建议调整") {
    return "warning";
  }
  if (status === "已停用") {
    return "muted";
  }
  return "blue";
}
