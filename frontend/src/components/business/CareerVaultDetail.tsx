import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { CareerVaultItem } from "@/types/demo";

export function CareerVaultDetail({
  item,
  jobId,
  onDelete,
  onUpdate,
}: {
  item: CareerVaultItem;
  jobId: string;
  onDelete: (itemId: string) => void;
  onUpdate: (itemId: string, patch: Partial<CareerVaultItem>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <label>
          <div className="mb-2 text-xs text-slate-500">标题</div>
          <Input value={item.title} onChange={(event) => onUpdate(item.id, { title: event.target.value })} />
        </label>
        <label>
          <div className="mb-2 text-xs text-slate-500">量化成果</div>
          <Input value={item.impact} onChange={(event) => onUpdate(item.id, { impact: event.target.value })} />
        </label>
      </div>

      <Card surface="subtle" className="p-4">
        <div className="mb-2 text-sm text-slate-500">摘要</div>
        <Textarea value={item.summary} onChange={(event) => onUpdate(item.id, { summary: event.target.value })} />
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <EvidenceBlock label="Situation" value={item.star.situation} />
        <EvidenceBlock label="Task" value={item.star.task} />
        <EvidenceBlock label="Action" value={item.star.action} />
        <EvidenceBlock label="Result" value={item.star.result} />
      </div>

      <Card surface="subtle" className="p-4">
        <div className="mb-3 text-sm text-slate-500">关联技能</div>
        <div className="flex flex-wrap gap-2">
          {item.skills.map((skill) => (
            <Badge key={skill} tone="cyan" className="px-2 py-0.5 text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary">
          <Link to={`/jobs/${jobId}`}>用于修复决策卡风险</Link>
        </Button>
        <Button variant="danger" onClick={() => onDelete(item.id)}>
          删除素材
        </Button>
      </div>
    </div>
  );
}

function EvidenceBlock({ label, value }: { label: string; value: string }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="mb-2 text-xs text-slate-500">{label}</div>
      <p className="text-sm leading-6 text-slate-300">{value}</p>
    </Card>
  );
}
