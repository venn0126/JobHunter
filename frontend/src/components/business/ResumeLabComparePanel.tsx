import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CompactStatCard } from "@/components/ui/CompactStatCard";
import { Select } from "@/components/ui/Select";
import {
  getCompareVersionOptions,
  getResumeLabComparePath,
  getResumeLabPath,
  getResumeVersionDelta,
} from "@/services/resumeLabService";
import type { ResumeLab, ResumeLabVersion } from "@/types/demo";

export function ResumeLabComparePanel({
  compareVersions,
  lab,
  selectedVersionId,
}: {
  compareVersions: ResumeLabVersion[];
  lab: ResumeLab;
  selectedVersionId: string;
}) {
  const navigate = useNavigate();
  const [leftVersion, rightVersion] = compareVersions;
  const delta = getResumeVersionDelta(leftVersion, rightVersion);

  if (!leftVersion || !rightVersion || !delta) {
    return (
      <Card surface="subtle" className="p-5">
        <div className="font-semibold">版本对比</div>
        <p className="mt-2 text-sm leading-6 text-slate-400">至少需要两个简历版本才能进行对比。</p>
      </Card>
    );
  }

  return (
    <Card surface="subtle" className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cyan">版本对比</Badge>
            <h2 className="text-lg font-semibold">
              {leftVersion.name} vs {rightVersion.name}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            对比两个版本的投递表现、证据覆盖和修改建议，用于决定下一轮投递使用哪个版本。
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link to={getResumeLabPath(selectedVersionId)}>收起对比</Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {compareVersions.map((version, index) => (
          <label key={`${version.id}-${index}`}>
            <div className="mb-2 text-xs text-slate-500">对比版本 {index + 1}</div>
            <Select
              value={version.id}
              onChange={(event) => {
                navigate(
                  getResumeLabComparePath(compareVersions.map((item) => item.id), {
                    replaceIndex: index,
                    replaceWithVersionId: event.target.value,
                    selectedVersionId,
                  }),
                );
              }}
            >
              {getCompareVersionOptions(lab, compareVersions.map((item) => item.id), index).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </label>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <CompareMetric label="面试率差值" value={formatDelta(delta.interviewRate, "%")} />
        <CompareMetric label="面试数差值" value={formatDelta(delta.interviewCount)} />
        <CompareMetric label="无回复差值" value={formatDelta(delta.noResponseCount)} muted={delta.noResponseCount > 0} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {compareVersions.map((version) => (
          <Card key={version.id} surface="subtle" className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{version.name}</h3>
              <Badge tone={version.status === "推荐使用" ? "cyan" : "blue"}>{version.status}</Badge>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <CompactStatCard valueClassName="text-base" label="投递" value={version.applied_count} />
              <CompactStatCard valueClassName="text-base" label="面试" value={version.interview_count} />
              <CompactStatCard valueClassName="text-base" label="无回复" value={version.no_response_count} />
              <CompactStatCard valueClassName="text-base" label="面试率" value={`${version.interview_rate}%`} />
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs text-slate-500">优势</div>
              <ul className="space-y-2 text-sm leading-6 text-slate-300">
                {version.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-cyanGlow">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs text-slate-500">下一步建议</div>
              <ul className="space-y-2 text-sm leading-6 text-slate-400">
                {version.improvement_tips.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-cyanGlow">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}

function formatDelta(value: number, suffix = "") {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}${suffix}`;
}

function CompareMetric({ label, muted, value }: { label: string; muted?: boolean; value: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={muted ? "mt-2 text-3xl font-semibold text-risk-medium" : "mt-2 text-3xl font-semibold text-cyanGlow"}>
        {value}
      </div>
    </Card>
  );
}
