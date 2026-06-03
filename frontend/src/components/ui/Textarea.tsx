import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/classNames";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanGlow/50",
        className,
      )}
      {...props}
    />
  );
}
