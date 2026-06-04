import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/classNames";

export function CompactStatCard({
  className,
  label,
  value,
  valueClassName,
}: {
  className?: string;
  label: string;
  value: number | string;
  valueClassName?: string;
}) {
  return (
    <Card surface="subtle" className={cn("p-3", className)}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold", valueClassName)}>{value}</div>
    </Card>
  );
}
