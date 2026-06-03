import { Badge } from "@/components/ui/Badge";
import type { DemoJob } from "@/types/demo";

const sourceFallbackLabel: Record<string, string> = {
  boss: "BOSS 直聘",
  company_site: "官网",
  lagou: "拉勾",
  liepin: "猎聘",
  mock_seed: "Demo 数据",
  referral: "内推",
};

export function SourceBadge({ source }: { source: DemoJob["source"] }) {
  const label = source.source_label || sourceFallbackLabel[source.source_site] || "未知来源";
  return (
    <Badge tone={source.source_confidence === "high" ? "cyan" : "muted"} className="px-2 py-0.5 text-xs">
      {label}
    </Badge>
  );
}
