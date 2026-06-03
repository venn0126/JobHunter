import type { PropsWithChildren } from "react";
import { Card } from "@/components/ui/Card";

export function Panel({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </Card>
  );
}
