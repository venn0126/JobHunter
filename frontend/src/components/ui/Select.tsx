import type { ChangeEvent, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/classNames";

export function Select({ className, children, onChange, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
    event.currentTarget.blur();
  };

  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 text-sm text-white outline-none transition focus:border-cyanGlow/50",
        className,
      )}
      {...props}
      onChange={handleChange}
    >
      {children}
    </select>
  );
}
