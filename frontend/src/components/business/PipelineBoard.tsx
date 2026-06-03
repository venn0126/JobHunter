import { Card } from "@/components/ui/Card";
import type { PipelineSummary } from "@/types/demo";

const defaultColumns: PipelineSummary[] = [
  { id: "interested", label: "感兴趣", count: 0 },
  { id: "tailored", label: "已定制简历", count: 0 },
  { id: "applied", label: "已投递", count: 0 },
  { id: "hr_contact", label: "HR 沟通", count: 0 },
  { id: "interviewing", label: "面试中", count: 0 },
  { id: "offer", label: "Offer", count: 0 },
];

export function PipelineBoard({ columns = defaultColumns }: { columns?: PipelineSummary[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {columns.map((column) => (
        <Card key={column.id} surface="subtle" className="p-4">
          <div className="text-sm text-slate-400">{column.label}</div>
          <div className="mt-3 text-3xl font-semibold">{column.count}</div>
        </Card>
      ))}
    </div>
  );
}
