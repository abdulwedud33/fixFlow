import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "tertiary" | "destructive" | "accent-ghost";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  disabled,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) {
  const sizeStyles = {
    xs: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
    sm: "h-8 px-3 text-xs gap-2 rounded-btn",
    md: "h-10 px-4 text-sm gap-2 rounded-btn",
    lg: "h-11 px-5 text-sm font-medium gap-2.5 rounded-btn",
  }[size];

  const variantStyles = {
    primary:
      "bg-accent text-canvas font-semibold hover:bg-accent-hover active:bg-accent-active shadow-glow-accent border border-accent/30 focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none",
    secondary:
      "bg-surface-card text-content-primary hover:bg-surface-hover active:bg-surface-card border border-border hover:border-border-strong shadow-sm focus-visible:ring-2 focus-visible:ring-accent/20 disabled:opacity-40 disabled:pointer-events-none",
    outline:
      "bg-transparent text-content-primary border border-border hover:border-border-strong hover:bg-surface-hover/50 focus-visible:ring-2 focus-visible:ring-border disabled:opacity-40 disabled:pointer-events-none",
    tertiary:
      "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-hover/70 focus-visible:ring-2 focus-visible:ring-border disabled:opacity-40 disabled:pointer-events-none",
    "accent-ghost":
      "bg-accent-subtle text-accent hover:bg-accent-muted border border-accent/20 hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-40 disabled:pointer-events-none",
    destructive:
      "bg-error-muted text-error border border-error/30 hover:bg-error/20 active:bg-error/30 focus-visible:ring-2 focus-visible:ring-error/40 disabled:opacity-40 disabled:pointer-events-none",
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{loadingText || "Processing..."}</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
