import React from "react";
import { Wrench } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Wrench,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`p-10 border border-border/80 border-dashed rounded-card bg-surface-subtle/40 flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-card border border-border flex items-center justify-center text-accent mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-content-primary mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-content-secondary max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
