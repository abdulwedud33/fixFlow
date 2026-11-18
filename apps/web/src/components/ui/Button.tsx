import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  // Height and padding tokens
  const sizeStyles = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }[size];

  // Visual variant tokens from DESIGN.md
  const variantStyles = {
    primary:
      "bg-brand-700 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm focus-visible:ring-2 focus-visible:ring-brand-700/20 disabled:bg-slate-300 disabled:text-slate-500",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400",
    tertiary:
      "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-300 disabled:text-slate-400",
    destructive:
      "bg-danger-700 text-white hover:bg-red-700 active:bg-danger-700 shadow-sm focus-visible:ring-2 focus-visible:ring-danger-700/20 disabled:bg-slate-300 disabled:text-slate-500",
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium rounded-btn transition-colors focus:outline-none disabled:cursor-not-allowed select-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {isLoading ? loadingText || "Saving..." : children}
    </button>
  );
}
