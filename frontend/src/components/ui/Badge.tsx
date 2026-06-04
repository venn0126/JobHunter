import type { PropsWithChildren } from "react";
import { cn } from "@/lib/classNames";

export type BadgeTone = "default" | "cyan" | "blue" | "muted" | "warning" | "danger";

const toneClassName: Record<BadgeTone, string> = {
  default: "border-white/10 bg-white/5 text-slate-300",
  cyan: "border-cyanGlow/30 bg-cyanGlow/10 text-cyanGlow",
  blue: "border-blueGlow/30 bg-blueGlow/10 text-blue-200",
  danger: "border-risk-high/30 bg-risk-high/10 text-risk-high",
  muted: "border-white/10 bg-white/5 text-slate-400",
  warning: "border-risk-medium/30 bg-risk-medium/10 text-risk-medium",
};

export function Badge({
  children,
  className,
  tone = "default",
}: PropsWithChildren<{ className?: string; tone?: BadgeTone }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm",
        toneClassName[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
