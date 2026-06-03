import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { GlobalHotRole, OpportunityDirection } from "@/types/demo";

export function OpportunityHeatCard({ item }: { item: GlobalHotRole | OpportunityDirection }) {
  const params = new URLSearchParams({
    role: item.filters.role,
    skills: item.filters.skills.join(","),
  });

  return (
    <Link to={`/jobs?${params.toString()}`}>
      <Card surface="subtle" className="p-4 transition hover:border-cyanGlow/30 hover:bg-cyanGlow/10">
        <div className="flex items-center justify-between">
          <span className="font-medium">{item.name}</span>
          <span className="text-xl font-semibold text-cyanGlow">{item.heat}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="cyan" className="px-2 py-0.5 text-xs">
            增长 +{item.growth}%
          </Badge>
          {"fit" in item ? (
            <Badge tone="blue" className="px-2 py-0.5 text-xs">
              适配 {item.fit}
            </Badge>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} className="px-2 py-0.5 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {"reason" in item ? <p className="mt-3 text-sm leading-6 text-slate-400">{item.reason}</p> : null}
      </Card>
    </Link>
  );
}
