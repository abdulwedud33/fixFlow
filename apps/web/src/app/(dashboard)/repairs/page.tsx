"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Plus, Wrench, Smartphone, Laptop, Tv, HardDrive } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { RepairStatus } from "@fixflow/contracts";

export default function RepairsListPage() {
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
        return <Laptop className="w-4 h-4 text-slate-500" />;
      case "appliance":
        return <Tv className="w-4 h-4 text-slate-500" />;
      default:
        return <Smartphone className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Repair Tickets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage devices, technician assignments, and progress
          </p>
        </div>
        <Link
          href="/repairs/new"
          className="inline-flex items-center justify-center space-x-2 h-11 px-4 bg-brand-700 hover:bg-brand-600 text-white rounded-btn text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Repair</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket #, customer name, phone, device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-btn text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700"
          />
        </div>

        {/* Status Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {statusChips.map((chip) => {
            const isSelected = statusFilter === chip.value;
            return (
              <button
                key={chip.label}
                onClick={() => setStatusFilter(chip.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  isSelected
                    ? "bg-brand-700 text-white border-brand-700 shadow-sm"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
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
              ? "No tickets match your active filters. Try resetting the search or status."
              : "No repair tickets have been created yet. Start by taking in your first customer device!"
          }
          actionLabel={searchQuery || statusFilter ? "Clear Filters" : "Create First Ticket"}
          onAction={() => {
            if (searchQuery || statusFilter) {
              setSearchQuery("");
              setStatusFilter("");
            } else {
              window.location.href = "/repairs/new";
            }
          }}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-card overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Device</th>
                  <th className="py-3.5 px-4">Reported Issue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repairs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => (window.location.href = `/repairs/${r.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-brand-700 block">
                        {r.ticketNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(r.receivedAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900 block">
                        {r.customer?.fullName || "Walk-in Customer"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatEthiopianPhone(r.customer?.phone)}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(r.device?.deviceType)}
                        <span className="font-medium text-slate-800">
                          {r.device ? `${r.device.brand} ${r.device.model}` : "Unknown Device"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-slate-600">
                      {r.reportedIssue}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <span
                        className={`font-semibold ${
                          r.balance > 0 ? "text-amber-700" : "text-teal-700"
                        }`}
                      >
                        {formatETB(r.balance)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Cost: {formatETB(r.totalCost)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (360px Friendly) */}
          <div className="md:hidden divide-y divide-slate-100">
            {repairs.map((r) => (
              <Link
                key={r.id}
                href={`/repairs/${r.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-sm text-brand-700">
                    {r.ticketNumber}
                  </span>
                  <StatusBadge status={r.status} />
                </div>

                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-900">
                    {r.customer?.fullName || "Walk-in"}
                  </span>
                  <span className="text-slate-500">
                    {formatEthiopianPhone(r.customer?.phone)}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-600 mb-2">
                  {getDeviceIcon(r.device?.deviceType)}
                  <span>{r.device ? `${r.device.brand} ${r.device.model}` : "Device"}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(r.receivedAt)}
                  </span>
                  <span
                    className={`font-semibold ${
                      r.balance > 0 ? "text-amber-700" : "text-teal-700"
                    }`}
                  >
                    Balance: {formatETB(r.balance)}
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
