import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function EmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card surface="hero" className="p-8">
      <div className="text-xl font-semibold">{title}</div>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
      {action ? <div className="mt-5 flex flex-wrap gap-3">{action}</div> : null}
    </Card>
  );
}
