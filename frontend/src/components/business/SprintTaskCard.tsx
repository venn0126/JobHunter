import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { SprintTask } from "@/types/demo";

export function SprintTaskCard({ task }: { task: SprintTask }) {
  return (
    <Card surface="subtle" className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-slate-200">{task.title}</div>
          <div className="mt-1 text-xs text-slate-500">{task.status === "todo" ? "待处理" : task.status}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={task.priority === "P0" ? "cyan" : "blue"} className="border-0 px-2 text-xs">
            {task.priority}
          </Badge>
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <Link to={task.target_path}>去处理</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
