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
  ArrowUpRight,
  ShieldAlert,
  Smartphone,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime } from "@/lib/format";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    loadDashboard();
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
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
            <div className="h-7 w-48 bg-surface-card rounded animate-pulse" />
            <div className="h-4 w-64 bg-surface-subtle rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      {/* Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Mission Control
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent">
              LIVE
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1 flex items-center space-x-2">
            <span>{currentTime || "Today"}</span>
            <span className="text-content-muted">•</span>
            <span>Ethiopia (EAT)</span>
            <span className="text-content-muted">•</span>
            <span className="text-accent">Addis Precision Workshop</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/repairs/new"
            className="inline-flex items-center justify-center space-x-2 h-10 px-4 bg-accent text-canvas font-semibold rounded-btn text-sm shadow-glow-accent hover:bg-accent-hover active:bg-accent-active transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Intake New Device</span>
          </Link>
        </div>
      </div>

      {/* Critical Alert Banner (Overdue Items) */}
      {counts.overdue > 0 && (
        <div className="p-4 bg-error-muted border border-error/40 rounded-card flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-error/20 text-error">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-error">
                {counts.overdue} Repair {counts.overdue === 1 ? "Ticket is" : "Tickets are"} Overdue
              </p>
              <p className="text-xs text-content-secondary">
                Technicians must review overdue diagnosis or promise dates to maintain customer SLA.
              </p>
            </div>
          </div>
          <Link
            href="/repairs"
            className="text-xs font-mono font-semibold text-error hover:underline flex items-center space-x-1"
          >
            <span>Review Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/repairs" className="block">
          <MetricCard
            label="Active On Bench"
            value={counts.active}
            subtext="Currently diagnosing or repairing"
            icon={Wrench}
            accentColor="accent"
          />
        </Link>

        <Link href="/repairs?status=WAITING_FOR_PARTS" className="block">
          <MetricCard
            label="Waiting for Parts"
            value={counts.waitingForParts}
            subtext="Blocked awaiting spare parts"
            icon={Clock}
            accentColor="warning"
          />
        </Link>

        <Link href="/repairs?status=READY_FOR_PICKUP" className="block">
          <MetricCard
            label="Ready for Pickup"
            value={counts.readyForPickup}
            subtext="Completed, awaiting customer"
            icon={CheckCircle2}
            accentColor="success"
          />
        </Link>

        <Link href="/repairs" className="block">
          <MetricCard
            label="Overdue SLA"
            value={counts.overdue}
            subtext="Past promised deadline"
            icon={AlertTriangle}
            accentColor={counts.overdue > 0 ? "error" : "sky"}
          />
        </Link>
      </div>

      {/* Financial Health Matrix */}
      <div className="p-5 sm:p-6 bg-surface-card border border-border rounded-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-accent-muted text-accent border border-accent/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-content-primary tracking-wide">
              Financial Overview & Collections
            </h2>
          </div>
          <span className="text-[11px] font-mono text-content-muted">
            Append-Only Verified Ledger
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border pt-2">
          <div className="sm:pr-6">
            <span className="text-xs font-mono uppercase tracking-wider text-content-muted">
              Collected Today
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-accent mt-1.5 tracking-tight">
              {formatETB(financials.todayCollections)}
            </p>
            <p className="text-[11px] text-content-secondary mt-1">
              Cash, Telebirr, CBE Birr & Transfers
            </p>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-6">
            <span className="text-xs font-mono uppercase tracking-wider text-content-muted">
              Outstanding Receivables
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-warning mt-1.5 tracking-tight">
              {formatETB(financials.outstandingBalance)}
            </p>
            <p className="text-[11px] text-content-secondary mt-1">
              Balance due upon device handover
            </p>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-6">
            <span className="text-xs font-mono uppercase tracking-wider text-content-muted">
              Total Recorded Revenue
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-content-primary mt-1.5 tracking-tight">
              {formatETB(financials.totalRevenue)}
            </p>
            <p className="text-[11px] text-content-secondary mt-1">
              All settled repair jobs & spare parts
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Technician Workload & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Workload Distribution */}
        <div className="bg-surface-card border border-border rounded-card overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface/50">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-sky" />
              <h2 className="text-sm font-semibold text-content-primary">
                Technician Workload Roster
              </h2>
            </div>
            <Link
              href="/technicians"
              className="text-xs text-accent font-medium hover:underline flex items-center space-x-1"
            >
              <span>Manage Team</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {technicianWorkload.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-muted">
                No active technicians assigned yet.
              </div>
            ) : (
              <div className="space-y-4">
                {technicianWorkload.map((tech: any) => {
                  const maxCapacity = 8;
                  const percent = Math.min(Math.round((tech.activeTicketsCount / maxCapacity) * 100), 100);

                  return (
                    <div key={tech.userId} className="p-3 rounded-lg bg-surface border border-border/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-surface-card border border-border flex items-center justify-center font-mono font-semibold text-[10px] text-content-primary">
                            {tech.displayName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="font-semibold text-content-primary">{tech.displayName}</span>
                            <span className="text-[10px] font-mono text-content-muted ml-2 uppercase">
                              {tech.role}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-content-primary font-medium">
                          {tech.activeTicketsCount} / {maxCapacity} jobs
                        </span>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${percent > 80
                            ? "bg-error"
                            : percent > 50
                              ? "bg-warning"
                              : "bg-accent"
                            }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Repair Audit Stream */}
        <div className="bg-surface-card border border-border rounded-card overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface/50">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-content-primary">
                Live Workshop Audit Feed
              </h2>
            </div>
            <Link
              href="/repairs"
              className="text-xs text-accent font-medium hover:underline flex items-center space-x-1"
            >
              <span>View All Repairs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-muted">
                No recent workshop activity recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((event: any) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-surface border border-border/70 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/repairs/${event.repairTicketId || event.ticketNumber}`}
                          className="font-mono font-bold text-accent hover:underline"
                        >
                          {event.ticketNumber}
                        </Link>
                        <StatusBadge status={event.toStatus} />
                      </div>
                      <p className="text-content-secondary">
                        <span className="font-semibold text-content-primary">
                          {event.actorName}
                        </span>
                        : {event.reason || `Transitioned status to ${event.toStatus}`}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-content-muted whitespace-nowrap">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
