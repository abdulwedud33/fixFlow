import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtext?: string;
  icon?: React.ElementType;
  accentColor?: "accent" | "sky" | "warning" | "success" | "error";
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  subtext,
  icon: Icon,
  accentColor = "accent",
  className = "",
}: MetricCardProps) {
  const accentBorder = {
    accent: "hover:border-accent/40",
    sky: "hover:border-sky/40",
    warning: "hover:border-warning/40",
    success: "hover:border-success/40",
    error: "hover:border-error/40",
  }[accentColor];

  const iconColor = {
    accent: "text-accent bg-accent-muted border-accent/20",
    sky: "text-sky bg-sky-muted border-sky/20",
    warning: "text-warning bg-warning-muted border-warning/20",
    success: "text-success bg-success-muted border-success/20",
    error: "text-error bg-error-muted border-error/20",
  }[accentColor];

  return (
    <div
      className={`p-5 bg-surface-card border border-border rounded-card transition-all duration-150 relative overflow-hidden group ${accentBorder} ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-content-secondary uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold font-mono text-content-primary tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-mono font-medium ${
              trend === "up"
                ? "text-success"
                : trend === "down"
                ? "text-error"
                : "text-content-muted"
            }`}
          >
            {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend === "neutral" && <Minus className="w-3.5 h-3.5 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-content-muted mt-2 truncate">{subtext}</p>}
    </div>
  );
}
