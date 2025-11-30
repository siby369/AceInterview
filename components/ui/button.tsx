"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button(props: ButtonProps) {
  const { variant = "primary", className, children, ...rest } = props;

  const base =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<Variant, string> = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-sm",
    outline:
      "border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-900",
    ghost:
      "bg-transparent text-slate-200 hover:bg-slate-900/60"
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}