import React from "react";
import { RepairStatus, RepairPriority } from "@fixflow/contracts";

interface BadgeProps {
  status?: string;
  priority?: string;
  children?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  let style = "bg-slate-100 text-slate-700 border-slate-300"; // default received
  let label = status;

  switch (status) {
    case RepairStatus.RECEIVED:
      style = "bg-slate-100 text-slate-700 border-slate-300";
      label = "Received";
      break;
    case RepairStatus.DIAGNOSING:
      style = "bg-blue-50 text-brand-700 border-blue-200";
      label = "Diagnosing";
      break;
    case RepairStatus.WAITING_FOR_APPROVAL:
      style = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Waiting Approval";
      break;
    case RepairStatus.WAITING_FOR_PARTS:
      style = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Waiting for Parts";
      break;
    case RepairStatus.IN_PROGRESS:
      style = "bg-blue-50 text-brand-700 border-blue-200";
      label = "In Progress";
      break;
    case RepairStatus.COMPLETED:
      style = "bg-teal-50 text-teal-700 border-teal-200";
      label = "Completed";
      break;
    case RepairStatus.READY_FOR_PICKUP:
      style = "bg-teal-50 text-teal-700 border-teal-300 font-semibold";
      label = "Ready for Pickup";
      break;
    case RepairStatus.COLLECTED:
      style = "bg-teal-50 text-teal-700 border-teal-200";
      label = "Collected";
      break;
    case RepairStatus.CANCELLED:
      style = "bg-danger-50 text-danger-700 border-red-200";
      label = "Cancelled";
      break;
    default:
      style = "bg-slate-100 text-slate-700 border-slate-200";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === RepairPriority.URGENT) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger-50 text-danger-700 border border-red-200">
        Urgent
      </span>
    );
  }
  return null;
}
