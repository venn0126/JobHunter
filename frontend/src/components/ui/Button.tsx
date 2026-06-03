import type { ButtonHTMLAttributes, ReactElement } from "react";
import { cloneElement } from "react";
import { cn } from "@/lib/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "border-cyanGlow/40 bg-cyanGlow text-ink-950 hover:bg-cyan-200",
  secondary: "border-white/10 bg-white/8 text-slate-100 hover:bg-white/12",
  ghost: "border-transparent bg-transparent text-slate-300 hover:bg-white/8 hover:text-white",
  danger: "border-risk-high/40 bg-risk-high/15 text-risk-high hover:bg-risk-high/20",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  asChild,
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  const classNames = cn(
    "inline-flex items-center justify-center rounded-full border font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
    variantClassName[variant],
    sizeClassName[size],
    className,
  );

  if (asChild && children) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn(classNames, (children as ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button
      className={classNames}
      {...props}
    >
      {children}
    </button>
  );
}
