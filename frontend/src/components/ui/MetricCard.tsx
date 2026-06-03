import { Card } from "@/components/ui/Card";

export function MetricCard({ hint, label, value }: { hint?: string; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-4xl font-semibold">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  );
}
