import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/classNames";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyanGlow/50 focus:ring-2 focus:ring-cyanGlow/15",
        className,
      )}
      {...props}
    />
  );
}
