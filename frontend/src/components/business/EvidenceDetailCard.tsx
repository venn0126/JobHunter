import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCareerVaultPath } from "@/services/careerVaultService";
import type { CareerVaultItem } from "@/types/demo";

export function EvidenceDetailCard({
  evidenceId,
  item,
  jobId,
}: {
  evidenceId?: string;
  item?: CareerVaultItem;
  jobId?: string;
}) {
  if (!item) {
    return (
      <Card surface="subtle" className="border-risk-medium/30 bg-risk-medium/10 p-5">
        <Badge tone="warning">证据缺失</Badge>
        <h3 className="mt-3 text-lg font-semibold">{evidenceId ?? "未指定证据"}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          当前证据暂未收录到职业素材库，可跳转补充素材后再用于决策卡、简历工作室和面试作战卡。
        </p>
        <Button asChild className="mt-4" size="sm" variant="secondary">
          <Link to={getCareerVaultPath(evidenceId, { jobId })}>补充证据素材</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card surface="subtle" className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="cyan">证据详情</Badge>
          <Badge tone="blue">{item.type}</Badge>
        </div>
        <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
        <Card surface="subtle" className="mt-4 border-cyanGlow/20 bg-cyanGlow/10 p-4">
          <div className="text-xs text-cyanGlow">量化成果</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{item.impact}</p>
        </Card>
      </Card>

      <Card surface="subtle" className="p-5">
        <h4 className="mb-3 font-semibold">STAR 结构</h4>
        <div className="grid gap-3 md:grid-cols-2">
          <EvidenceField label="Situation" value={item.star.situation} />
          <EvidenceField label="Task" value={item.star.task} />
          <EvidenceField label="Action" value={item.star.action} />
          <EvidenceField label="Result" value={item.star.result} />
        </div>
      </Card>

      <Card surface="subtle" className="p-5">
        <h4 className="mb-3 font-semibold">关联技能</h4>
        <div className="flex flex-wrap gap-2">
          {item.skills.map((skill) => (
            <Badge key={skill} tone="blue" className="px-2 py-0.5 text-xs">
              {skill}
            </Badge>
          ))}
        </div>
        <Button asChild className="mt-4" size="sm" variant="secondary">
          <Link to={getCareerVaultPath(item.id, { jobId })}>进入职业素材库编辑</Link>
        </Button>
      </Card>
    </div>
  );
}

function EvidenceField({ label, value }: { label: string; value: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="mb-2 text-xs text-slate-500">{label}</div>
      <p className="text-sm leading-6 text-slate-300">{value}</p>
    </Card>
  );
}
