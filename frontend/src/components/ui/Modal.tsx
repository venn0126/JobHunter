import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function Modal({
  children,
  onClose,
  open,
  title,
}: PropsWithChildren<{ onClose: () => void; open: boolean; title: string }>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-md">
      <Card className="w-full max-w-xl p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}
