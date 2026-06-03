import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/classNames";
import type { CareerVaultItem } from "@/types/demo";

export function CareerVaultListItem({
  active,
  item,
  onClick,
}: {
  active: boolean;
  item: CareerVaultItem;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition",
        active
          ? "border-cyanGlow/40 bg-cyanGlow/10 shadow-glow"
          : "border-white/10 bg-white/5 hover:border-cyanGlow/30 hover:bg-cyanGlow/10",
      )}
      type="button"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{item.title}</div>
        <Badge tone="blue" className="px-2 py-0.5 text-xs">
          {item.type}
        </Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{item.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} className="px-2 py-0.5 text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </button>
  );
}
