"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserCheck, Users, Wrench, Shield, CheckCircle2, ArrowUpRight, Cpu } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function TechniciansPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [teamRes, dashRes] = await Promise.all([
      apiRequest("/shops/team"),
      apiRequest("/dashboard/summary"),
    ]);
    setIsLoading(false);

    if (teamRes.data) setTeam(teamRes.data);
    if (dashRes.data?.technicianWorkload) setWorkload(dashRes.data.technicianWorkload);
  };

  const getWorkloadCount = (userId: string) => {
    const item = workload.find((w) => w.userId === userId);
    return item ? item.activeTicketsCount : 0;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Technician Bench & Staff
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-content-secondary">
              {team.length} technicians
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Staff roster, active job assignments, bench capacity, and workload balance
          </p>
        </div>
      </div>

      {/* Technicians Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : team.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No technicians registered"
          description="Your workshop team roster is empty. Team members can be configured in settings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((m) => {
            const activeJobs = getWorkloadCount(m.userId);
            const maxJobs = 8;
            const percent = Math.min(Math.round((activeJobs / maxJobs) * 100), 100);

            return (
              <div
                key={m.id || m.userId}
                className="p-5 bg-surface-card border border-border rounded-card space-y-4 hover:border-border-strong transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-accent/30 flex items-center justify-center font-mono font-bold text-accent text-sm shadow-glow-accent">
                      {m.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-content-primary text-sm">{m.displayName}</h3>
                      <span className="text-[11px] font-mono text-content-muted uppercase">
                        {m.role}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      m.status === "active"
                        ? "bg-success-muted text-success border border-success/30"
                        : "bg-surface text-content-muted"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-content-muted">Active Bench Load:</span>
                    <span className="font-bold text-content-primary">
                      {activeJobs} / {maxJobs} jobs
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent > 80
                          ? "bg-error"
                          : percent > 50
                          ? "bg-warning"
                          : "bg-accent"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-content-muted font-mono text-[11px]">
                    Status: {activeJobs > 6 ? "High Load" : "Ready for Intake"}
                  </span>
                  <Link
                    href={`/repairs`}
                    className="inline-flex items-center space-x-1 font-mono text-xs text-accent hover:underline"
                  >
                    <span>View Assigned</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
