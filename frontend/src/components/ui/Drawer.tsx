import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/classNames";

export function Drawer({
  children,
  onClose,
  open,
  title,
}: PropsWithChildren<{ onClose: () => void; open: boolean; title: string }>) {
  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div className={cn("absolute inset-0 bg-ink-950/65 backdrop-blur-sm transition", open ? "opacity-100" : "opacity-0")} />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-ink-900 p-6 shadow-card transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
        {children}
      </aside>
    </div>
  );
}
