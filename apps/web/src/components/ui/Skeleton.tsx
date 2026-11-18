import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-card/80 border border-border/40 rounded-btn ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="h-10 bg-surface-card/60 border border-border/40 rounded-btn w-full animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 bg-surface-subtle/50 border border-border/30 rounded-btn w-full flex items-center px-4 space-x-4 animate-pulse"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-surface-card rounded ${
                j === 0 ? "w-28" : j === 1 ? "w-40" : "flex-1"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 bg-surface-card border border-border rounded-card space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-surface-subtle rounded" />
        <div className="h-4 w-8 bg-surface-subtle rounded" />
      </div>
      <div className="h-7 w-32 bg-surface-subtle rounded" />
      <div className="h-3 w-48 bg-surface-subtle rounded" />
    </div>
  );
}
