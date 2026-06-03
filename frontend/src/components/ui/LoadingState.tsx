import { Card } from "@/components/ui/Card";

export function LoadingState({ label = "正在加载" }: { label?: string }) {
  return (
    <Card surface="subtle" className="flex items-center gap-3 p-4 text-sm text-slate-400">
      <span className="size-2 animate-pulse rounded-full bg-cyanGlow shadow-glow" />
      {label}
    </Card>
  );
}
