import { Card } from "@/components/ui/Card";

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-4xl font-semibold">{value}</div>
    </Card>
  );
}
