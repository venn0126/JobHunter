import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/classNames";

type CardSurface = "default" | "hero" | "subtle" | "accent";

const surfaceClassName: Record<CardSurface, string> = {
  default: "rounded-3xl border border-white/10 bg-white/[0.045]",
  hero: "rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-glow backdrop-blur-xl",
  subtle: "rounded-2xl border border-white/10 bg-white/5",
  accent: "rounded-3xl border border-cyanGlow/20 bg-cyanGlow/10",
};

export function Card({
  as,
  children,
  className,
  surface = "default",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: ElementType; surface?: CardSurface }) {
  const Component = as ?? "div";

  return (
    <Component className={cn(surfaceClassName[surface], className)} {...props}>
      {children}
    </Component>
  );
}
