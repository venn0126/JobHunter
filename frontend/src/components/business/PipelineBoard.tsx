import { Card } from "@/components/ui/Card";

export interface PipelineColumnSummary {
  id: string;
  label: string;
  count: number;
}

const defaultColumns: PipelineColumnSummary[] = [
  { id: "interested", label: "感兴趣", count: 3 },
  { id: "tailored", label: "已定制简历", count: 2 },
  { id: "applied", label: "已投递", count: 5 },
  { id: "interviewing", label: "面试中", count: 1 },
];

export function PipelineBoard({ columns = defaultColumns }: { columns?: PipelineColumnSummary[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => (
        <Card key={column.id} surface="subtle" className="p-4">
          <div className="text-sm text-slate-400">{column.label}</div>
          <div className="mt-3 text-3xl font-semibold">{column.count}</div>
        </Card>
      ))}
    </div>
  );
}
