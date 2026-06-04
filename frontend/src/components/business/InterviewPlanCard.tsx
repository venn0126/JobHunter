import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { InterviewGuidePlanItem } from "@/types/demo";

export function InterviewPlanCard({
  item,
  reviewed,
  onToggle,
}: {
  item: InterviewGuidePlanItem;
  reviewed: boolean;
  onToggle: () => void;
}) {
  return (
    <Card surface="subtle" className={reviewed ? "border-cyanGlow/30 bg-cyanGlow/10 p-4" : "p-4"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={reviewed ? "cyan" : "blue"}>Day {item.day}</Badge>
            <Badge tone={reviewed ? "cyan" : "muted"}>{reviewed ? "已复习" : "待复习"}</Badge>
          </div>
          <div className="mt-3 font-medium">{item.title}</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.focus}</p>
        </div>
        <Button size="sm" variant={reviewed ? "secondary" : "primary"} onClick={onToggle}>
          {reviewed ? "取消复习" : "标记复习"}
        </Button>
      </div>
    </Card>
  );
}
