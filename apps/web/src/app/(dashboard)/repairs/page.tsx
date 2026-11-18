"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Wrench,
  Smartphone,
  Laptop,
  Tv,
  Filter,
  ArrowUpDown,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { RepairStatus } from "@fixflow/contracts";

export default function RepairsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [repairs, setRepairs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRepairs();
  }, [statusFilter, searchQuery]);

  const loadRepairs = async () => {
    setIsLoading(true);
    let url = "/repairs?";
    if (statusFilter) url += `status=${statusFilter}&`;
    if (searchQuery) url += `q=${encodeURIComponent(searchQuery)}&`;

    const res = await apiRequest(url);
    setIsLoading(false);
    if (res.data) {
      setRepairs(res.data);
    }
  };

  const statusChips = [
    { label: "All Active", value: "" },
    { label: "Received", value: RepairStatus.RECEIVED },
    { label: "Diagnosing", value: RepairStatus.DIAGNOSING },
    { label: "Waiting Parts", value: RepairStatus.WAITING_FOR_PARTS },
    { label: "In Progress", value: RepairStatus.IN_PROGRESS },
    { label: "Ready for Pickup", value: RepairStatus.READY_FOR_PICKUP },
    { label: "Collected", value: RepairStatus.COLLECTED },
  ];

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case "laptop":
        return <Laptop className="w-4 h-4 text-sky" />;
      case "appliance":
        return <Tv className="w-4 h-4 text-warning" />;
      default:
        return <Smartphone className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Repair Tickets
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-content-secondary">
              {repairs.length} records
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Active workbench jobs, state transitions, and device diagnostics
          </p>
        </div>

        <Link
          href="/repairs/new"
          className="inline-flex items-center justify-center space-x-2 h-10 px-4 bg-accent text-canvas font-semibold rounded-btn text-sm shadow-glow-accent hover:bg-accent-hover transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Repair Intake</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ticket #, customer name, phone, device model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-surface-card border border-border hover:border-border-strong rounded-btn text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {statusChips.map((chip) => {
            const isSelected = statusFilter === chip.value;
            return (
              <button
                key={chip.label}
                onClick={() => setStatusFilter(chip.value)}
                className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-accent text-canvas font-semibold border-accent shadow-glow-accent"
                    : "bg-surface-card text-content-secondary border-border hover:border-border-strong hover:text-content-primary"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Repair List */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : repairs.length === 0 ? (
        <EmptyState
          title="No repair tickets found"
          description={
            searchQuery || statusFilter
              ? "No tickets match your active query. Try clearing filters or search terms."
              : "No repair tickets have been created yet. Launch your first customer device intake."
          }
          actionLabel={searchQuery || statusFilter ? "Reset Filters" : "Intake First Device"}
          onAction={() => {
            if (searchQuery || statusFilter) {
              setSearchQuery("");
              setStatusFilter("");
            } else {
              router.push("/repairs/new");
            }
          }}
        />
      ) : (
        <div className="bg-surface-card border border-border rounded-card overflow-hidden shadow-card-dark">
          {/* Desktop Precision Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-content-muted text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Device Spec</th>
                  <th className="py-3 px-4">Reported Problem</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {repairs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/repairs/${r.id}`)}
                    className="hover:bg-surface-hover/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-accent group-hover:underline block">
                        {r.ticketNumber}
                      </span>
                      <span className="text-[11px] font-mono text-content-muted">
                        {formatDateTime(r.receivedAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-content-primary block">
                        {r.customer?.fullName || "Walk-in Customer"}
                      </span>
                      <span className="text-xs font-mono text-content-muted">
                        {formatEthiopianPhone(r.customer?.phone)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(r.device?.deviceType)}
                        <div>
                          <span className="font-medium text-content-primary block">
                            {r.device ? `${r.device.brand} ${r.device.model}` : "Unknown Device"}
                          </span>
                          {r.device?.serialNumber && (
                            <span className="text-[10px] font-mono text-content-muted">
                              SN: {r.device.serialNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-content-secondary text-xs">
                      {r.reportedIssue}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <span
                        className={`font-mono font-semibold text-sm ${
                          r.balance > 0 ? "text-warning" : "text-success"
                        }`}
                      >
                        {formatETB(r.balance)}
                      </span>
                      <span className="text-[10px] font-mono text-content-muted block">
                        Total: {formatETB(r.totalCost)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (360px Friendly) */}
          <div className="md:hidden divide-y divide-border/60">
            {repairs.map((r) => (
              <Link
                key={r.id}
                href={`/repairs/${r.id}`}
                className="block p-4 hover:bg-surface-hover/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-accent">
                    {r.ticketNumber}
                  </span>
                  <StatusBadge status={r.status} />
                </div>

                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-content-primary">
                    {r.customer?.fullName || "Walk-in"}
                  </span>
                  <span className="font-mono text-content-muted">
                    {formatEthiopianPhone(r.customer?.phone)}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-content-secondary mb-2">
                  {getDeviceIcon(r.device?.deviceType)}
                  <span>{r.device ? `${r.device.brand} ${r.device.model}` : "Device"}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                  <span className="text-[10px] font-mono text-content-muted">
                    {formatDateTime(r.receivedAt)}
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      r.balance > 0 ? "text-warning" : "text-success"
                    }`}
                  >
                    Due: {formatETB(r.balance)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
