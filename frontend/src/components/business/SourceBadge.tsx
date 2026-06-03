import { Badge } from "@/components/ui/Badge";
import type { DemoJob } from "@/types/demo";

export function SourceBadge({ source }: { source: DemoJob["source"] }) {
  const label = source.source_label || "未知来源";
  return (
    <Badge tone={source.source_confidence === "high" ? "cyan" : "muted"} className="px-2 py-0.5 text-xs">
      {label}
    </Badge>
  );
}
