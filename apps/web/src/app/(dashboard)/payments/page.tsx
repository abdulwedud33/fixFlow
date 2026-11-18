"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, DollarSign, ArrowUpRight, TrendingUp, CheckCircle, ShieldCheck, Printer } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";

export default function PaymentsPage() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setIsLoading(true);
    const [repairsRes, dashRes] = await Promise.all([
      apiRequest("/repairs"),
      apiRequest("/dashboard/summary"),
    ]);
    setIsLoading(false);

    if (repairsRes.data) setRepairs(repairsRes.data);
    if (dashRes.data?.financials) setFinancials(dashRes.data.financials);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Payments & Financial Ledger
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent uppercase">
              Append-Only
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Cash, Telebirr, CBE Birr transactions, customer receipts, and daily reconciliations
          </p>
        </div>
      </div>

      {/* Financial Matrix Cards */}
      {financials && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Collected Today"
            value={formatETB(financials.todayCollections)}
            subtext="Cash & Mobile Money"
            icon={TrendingUp}
            accentColor="accent"
          />
          <MetricCard
            label="Outstanding Balance"
            value={formatETB(financials.outstandingBalance)}
            subtext="Due upon device collection"
            icon={CreditCard}
            accentColor="warning"
          />
          <MetricCard
            label="Total Settled Revenue"
            value={formatETB(financials.totalRevenue)}
            subtext="Lifetime shop revenue"
            icon={DollarSign}
            accentColor="sky"
          />
        </div>
      )}

      {/* Ledger Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : repairs.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="Payments recorded during repair ticket intake or device handover will be permanently tracked here."
        />
      ) : (
        <div className="bg-surface-card border border-border rounded-card overflow-hidden shadow-card-dark">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
              Recent Work Order Billings & Balances
            </h3>
            <span className="text-[11px] font-mono text-content-secondary">
              Immutable Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-content-muted text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Total Quoted</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href={`/repairs/${r.id}`}
                        className="font-mono font-bold text-accent hover:underline"
                      >
                        {r.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-primary">
                      {r.customer?.fullName || "Walk-in"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-secondary">
                      {r.device ? `${r.device.brand} ${r.device.model}` : "Device"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-content-primary">
                      {formatETB(r.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-accent">
                      {formatETB(r.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                      <span
                        className={`font-semibold ${
                          r.balance > 0 ? "text-warning" : "text-success"
                        }`}
                      >
                        {formatETB(r.balance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        href={`/receipts/${r.id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 text-xs font-mono text-content-secondary hover:text-accent"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
