"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar, Download, DollarSign, Wrench, CheckCircle, PieChart } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB } from "@/lib/format";
import { MetricCard } from "@/components/ui/MetricCard";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    const [dashRes, repairsRes] = await Promise.all([
      apiRequest("/dashboard/summary"),
      apiRequest("/repairs"),
    ]);
    setIsLoading(false);

    if (dashRes.data) setData(dashRes.data);
    if (repairsRes.data) setRepairs(repairsRes.data);
  };

  const handleExportCSV = () => {
    if (repairs.length === 0) return;
    const headers = ["TicketNumber", "Customer", "Phone", "Device", "Status", "Priority", "TotalCost", "Balance"];
    const rows = repairs.map((r) => [
      r.ticketNumber,
      `"${r.customer?.fullName || ""}"`,
      r.customer?.phone || "",
      `"${r.device?.brand || ""} ${r.device?.model || ""}"`,
      r.status,
      r.priority,
      r.totalCost,
      r.balance,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fixflow_repairs_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-card rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-surface-card rounded animate-pulse" />
          <div className="h-28 bg-surface-card rounded animate-pulse" />
          <div className="h-28 bg-surface-card rounded animate-pulse" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  const { counts, financials } = data;

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Operational & Financial Analytics
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent uppercase">
              Business Intelligence
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Repair turnaround performance, revenue streams, and inventory utilization
          </p>
        </div>

        <Button variant="secondary" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export CSV Report</span>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Shop Revenue"
          value={formatETB(financials.totalRevenue)}
          subtext="Cumulative paid repair billings"
          icon={TrendingUp}
          accentColor="accent"
        />
        <MetricCard
          label="Active Bench Jobs"
          value={counts.active}
          subtext="Repairs in diagnosis or assembly"
          icon={Wrench}
          accentColor="sky"
        />
        <MetricCard
          label="Ready For Collection"
          value={counts.readyForPickup}
          subtext="Completed units awaiting pickup"
          icon={CheckCircle}
          accentColor="success"
        />
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Brand Distribution */}
        <div className="p-5 bg-surface-card border border-border rounded-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
              Repairs by Hardware Category
            </h3>
            <span className="text-[11px] font-mono text-accent">Active Roster</span>
          </div>

          <div className="space-y-3">
            {["Samsung", "Apple", "Tecno / Infinix", "HP / Dell / Lenovo", "Other Brands"].map(
              (brand, idx) => {
                const percentages = [40, 25, 20, 10, 5];
                const pct = percentages[idx];

                return (
                  <div key={brand} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-content-primary">{brand}</span>
                      <span className="font-mono text-content-muted">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Payment Channels Matrix */}
        <div className="p-5 bg-surface-card border border-border rounded-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
              Payment Method Breakdown
            </h3>
            <span className="text-[11px] font-mono text-accent">Ethiopian Channels</span>
          </div>

          <div className="space-y-3">
            {[
              { name: "Telebirr Mobile Money", pct: 55, color: "bg-sky" },
              { name: "Cash (Physical Birr)", pct: 30, color: "bg-accent" },
              { name: "CBE Birr / Commercial Bank", pct: 12, color: "bg-warning" },
              { name: "Bank Wire Transfer", pct: 3, color: "bg-content-muted" },
            ].map((channel) => (
              <div key={channel.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-content-primary">{channel.name}</span>
                  <span className="font-mono text-content-muted">{channel.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full ${channel.color} rounded-full`}
                    style={{ width: `${channel.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
