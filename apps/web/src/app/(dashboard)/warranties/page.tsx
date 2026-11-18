"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Clock, ArrowUpRight, Search } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WarrantiesPage() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    setIsLoading(true);
    const res = await apiRequest("/repairs");
    setIsLoading(false);
    if (res.data) {
      setRepairs(res.data);
    }
  };

  const repairsWithWarranty = repairs.filter((r) => r.warranty);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Service Warranties & Guarantees
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent">
              {repairsWithWarranty.length} active certificates
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Track repair service guarantees, expiration dates, and customer warranty claims
          </p>
        </div>
      </div>

      {/* Warranties Table */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : repairsWithWarranty.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No warranty certificates issued"
          description="Service warranties can be issued for any completed repair from the repair details workbench."
          actionLabel="View Repairs"
          onAction={() => (window.location.href = "/repairs")}
        />
      ) : (
        <div className="bg-surface-card border border-border rounded-card overflow-hidden shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-content-muted text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Hardware</th>
                  <th className="py-3 px-4">Issued On</th>
                  <th className="py-3 px-4">Expires On</th>
                  <th className="py-3 px-4">Coverage Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {repairsWithWarranty.map((r) => {
                  const endsAt = new Date(r.warranty.endsAt);
                  const isExpired = endsAt < new Date();

                  return (
                    <tr key={r.id} className="hover:bg-surface-hover/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-accent">
                        {r.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-primary">
                        {r.customer?.fullName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-secondary">
                        {r.device ? `${r.device.brand} ${r.device.model}` : "Device"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-content-muted">
                        {formatDateTime(r.warranty.startsAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-content-primary">
                        {formatDateTime(r.warranty.endsAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                            isExpired
                              ? "bg-error-muted text-error border-error/30"
                              : "bg-success-muted text-success border-success/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isExpired ? "bg-error" : "bg-success"
                            }`}
                          />
                          <span>{isExpired ? "Expired" : "Active Coverage"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link
                          href={`/repairs/${r.id}`}
                          className="inline-flex items-center space-x-1 font-mono text-xs text-accent hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
