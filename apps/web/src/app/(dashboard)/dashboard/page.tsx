"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  UserCheck,
  Plus,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime } from "@/lib/format";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    const res = await apiRequest("/dashboard/summary");
    setIsLoading(false);
    if (res.data) {
      setData(res.data);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Shop Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Real-time operational overview</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const { counts, financials, recentActivity, technicianWorkload } = data;

  return (
    <div className="space-y-8">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Operational Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active repair queue, workload distribution, and collections
          </p>
        </div>
        <Link
          href="/repairs/new"
          className="inline-flex items-center justify-center space-x-2 h-11 px-4 bg-brand-700 hover:bg-brand-600 text-white rounded-btn text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Repair Intake</span>
        </Link>
      </div>

      {/* Operational Attention Queues */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue */}
        <Link
          href="/repairs"
          className={`p-5 rounded-card border transition-all ${
            counts.overdue > 0
              ? "bg-danger-50/50 border-red-200 hover:border-danger-700"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue Repairs</span>
            <AlertTriangle
              className={`w-4 h-4 ${counts.overdue > 0 ? "text-danger-700" : "text-slate-400"}`}
            />
          </div>
          <p
            className={`text-2xl sm:text-3xl font-bold mt-2 ${
              counts.overdue > 0 ? "text-danger-700" : "text-ink-950"
            }`}
          >
            {counts.overdue}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires immediate attention</span>
        </Link>

        {/* Ready for Pickup */}
        <Link
          href="/repairs?status=READY_FOR_PICKUP"
          className="p-5 rounded-card bg-white border border-slate-200 hover:border-brand-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ready for Pickup</span>
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-ink-950 mt-2">
            {counts.readyForPickup}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting customer collection</span>
        </Link>

        {/* Waiting for Parts */}
        <Link
          href="/repairs?status=WAITING_FOR_PARTS"
          className="p-5 rounded-card bg-white border border-slate-200 hover:border-brand-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Waiting for Parts</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-ink-950 mt-2">
            {counts.waitingForParts}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Blocked on inventory</span>
        </Link>

        {/* In Progress */}
        <Link
          href="/repairs"
          className="p-5 rounded-card bg-white border border-slate-200 hover:border-brand-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Workload</span>
            <Wrench className="w-4 h-4 text-brand-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-ink-950 mt-2">{counts.active}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Jobs currently on bench</span>
        </Link>
      </div>

      {/* Financial Health Summary */}
      <div className="bg-white border border-slate-200 rounded-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-brand-700" />
          <span>Financial Snapshot</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-medium text-slate-500">Collected Today</span>
            <p className="text-2xl font-bold text-teal-700 mt-1">
              {formatETB(financials.todayCollections)}
            </p>
            <span className="text-[11px] text-slate-400">Cash, Mobile Money & Transfers</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500">Total Unpaid Balance</span>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {formatETB(financials.outstandingBalance)}
            </p>
            <span className="text-[11px] text-slate-400">Due upon device collection</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500">Total Recorded Revenue</span>
            <p className="text-2xl font-bold text-ink-950 mt-1">
              {formatETB(financials.totalRevenue)}
            </p>
            <span className="text-[11px] text-slate-400">All recorded payments</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Technician Workload & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Workload */}
        <div className="bg-white border border-slate-200 rounded-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Technician Workload</span>
            </h2>
          </div>

          {technicianWorkload.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No staff members invited yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {technicianWorkload.map((tech: any) => (
                <div key={tech.userId} className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{tech.displayName}</p>
                    <p className="text-xs text-slate-500 capitalize">{tech.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-blue-200">
                      {tech.activeTicketsCount} active jobs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Repair Activity */}
        <div className="bg-white border border-slate-200 rounded-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Recent Activity</span>
            </h2>
            <Link href="/repairs" className="text-xs text-brand-700 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No repair activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((event: any) => (
                <div key={event.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {event.ticketNumber}
                    </span>
                    <StatusBadge status={event.toStatus} />
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{event.actorName}</span>:{" "}
                    {event.reason || `Status updated to ${event.toStatus}`}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatDateTime(event.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
