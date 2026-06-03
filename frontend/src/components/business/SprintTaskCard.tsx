import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { SprintTask } from "@/types/demo";

export function SprintTaskCard({ task }: { task: SprintTask }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-200">{task.title}</span>
        <Badge tone={task.priority === "P0" ? "cyan" : "blue"} className="border-0 px-2 text-xs">
          {task.priority}
        </Badge>
      </div>
    </Card>
  );
}
