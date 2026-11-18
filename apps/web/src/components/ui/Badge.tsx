import React from "react";
import { RepairStatus, RepairPriority } from "@fixflow/contracts";

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  let bg = "bg-surface-card";
  let text = "text-content-secondary";
  let border = "border-border";
  let dot = "bg-content-muted";
  let label = status;

  switch (status) {
    case RepairStatus.RECEIVED:
      bg = "bg-surface-card";
      text = "text-content-secondary";
      border = "border-border";
      dot = "bg-content-muted";
      label = "Received";
      break;
    case RepairStatus.DIAGNOSING:
      bg = "bg-sky-muted";
      text = "text-sky";
      border = "border-sky-border";
      dot = "bg-sky animate-pulse";
      label = "Diagnosing";
      break;
    case RepairStatus.WAITING_FOR_APPROVAL:
      bg = "bg-warning-muted";
      text = "text-warning";
      border = "border-warning-border";
      dot = "bg-warning";
      label = "Waiting Approval";
      break;
    case RepairStatus.WAITING_FOR_PARTS:
      bg = "bg-warning-muted";
      text = "text-warning";
      border = "border-warning-border";
      dot = "bg-warning";
      label = "Waiting for Parts";
      break;
    case RepairStatus.IN_PROGRESS:
      bg = "bg-accent-muted";
      text = "text-accent";
      border = "border-accent-border";
      dot = "bg-accent animate-pulse";
      label = "In Progress";
      break;
    case RepairStatus.COMPLETED:
      bg = "bg-success-muted";
      text = "text-success";
      border = "border-success-border";
      dot = "bg-success";
      label = "Completed";
      break;
    case RepairStatus.READY_FOR_PICKUP:
      bg = "bg-success-muted";
      text = "text-success font-semibold";
      border = "border-success";
      dot = "bg-success ring-2 ring-success/30";
      label = "Ready for Pickup";
      break;
    case RepairStatus.COLLECTED:
      bg = "bg-surface-card";
      text = "text-content-secondary";
      border = "border-border";
      dot = "bg-success";
      label = "Collected";
      break;
    case RepairStatus.CANCELLED:
      bg = "bg-error-muted";
      text = "text-error";
      border = "border-error-border";
      dot = "bg-error";
      label = "Cancelled";
      break;
    default:
      label = status.replace(/_/g, " ");
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider border ${bg} ${text} ${border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === RepairPriority.URGENT) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold bg-error-muted text-error border border-error/30">
        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
        Urgent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase font-normal bg-surface-card text-content-secondary border border-border">
      Normal
    </span>
  );
}
