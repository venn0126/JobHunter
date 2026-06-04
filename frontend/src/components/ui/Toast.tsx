import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/classNames";
import type { AppToast } from "@/stores/toastStore";

const toneClassName: Record<AppToast["tone"], string> = {
  danger: "border-risk-high/30 bg-risk-high/15",
  info: "border-blueGlow/30 bg-blueGlow/10",
  success: "border-cyanGlow/30 bg-cyanGlow/10",
  warning: "border-risk-medium/30 bg-risk-medium/15",
};

export function Toast({
  message,
  title,
  tone = "success",
}: {
  message?: string;
  title: string;
  tone?: AppToast["tone"];
}) {
  return (
    <Card className={cn("w-full max-w-sm p-4 shadow-card backdrop-blur-xl", toneClassName[tone])}>
      <div className="font-medium text-white">{title}</div>
      {message ? <div className="mt-1 text-sm leading-6 text-slate-300">{message}</div> : null}
    </Card>
  );
}
