import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { OpportunityDirection } from "@/types/demo";

export function OpportunityHeatCard({ item }: { item: OpportunityDirection }) {
  return (
    <Link to="/opportunity">
      <Card surface="subtle" className="p-4 transition hover:border-cyanGlow/30 hover:bg-cyanGlow/10">
        <div className="flex items-center justify-between">
          <span className="font-medium">{item.name}</span>
          <span className="text-xl font-semibold text-cyanGlow">{item.heat}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="cyan" className="px-2 py-0.5 text-xs">
            增长 +{item.growth}%
          </Badge>
          <Badge tone="blue" className="px-2 py-0.5 text-xs">
            适配 {item.fit}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">{item.reason}</p>
      </Card>
    </Link>
  );
}
