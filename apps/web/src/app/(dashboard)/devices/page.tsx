"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Smartphone, Laptop, Tv, Tablet, Wrench, Shield, ArrowUpRight } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeviceType } from "@fixflow/contracts";

export default function DevicesPage() {
  const router = useRouter();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, [search]);

  const loadDevices = async () => {
    setIsLoading(true);
    const res = await apiRequest(`/repairs?q=${encodeURIComponent(search)}`);
    setIsLoading(false);
    if (res.data) {
      setRepairs(res.data);
    }
  };

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case DeviceType.LAPTOP:
        return <Laptop className="w-4 h-4 text-sky" />;
      case DeviceType.APPLIANCE:
        return <Tv className="w-4 h-4 text-warning" />;
      case DeviceType.TABLET:
        return <Tablet className="w-4 h-4 text-content-primary" />;
      default:
        return <Smartphone className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Device Registry
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-content-secondary">
              Hardware Directory
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Registered customer hardware, IMEI / serial numbers, brands, and repair logs
          </p>
        </div>

        <Link
          href="/repairs/new"
          className="inline-flex items-center justify-center space-x-2 h-10 px-4 bg-accent text-canvas font-semibold rounded-btn text-sm shadow-glow-accent hover:bg-accent-hover transition-all self-start sm:self-auto"
        >
          <span>Intake Device</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by IMEI, Serial #, Brand, or Model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-surface-card border border-border hover:border-border-strong rounded-btn text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
        />
      </div>

      {/* Devices List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : repairs.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No devices registered"
          description={
            search
              ? "No hardware matches your search terms."
              : "No devices logged yet. Devices are automatically added to the registry during intake."
          }
          actionLabel="Intake Device"
          onAction={() => router.push("/repairs/new")}
        />
      ) : (
        <div className="bg-surface-card border border-border rounded-card overflow-hidden shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-content-muted text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Device Model</th>
                  <th className="py-3 px-4">IMEI / Serial</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Latest Ticket</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-surface border border-border">
                          {getDeviceIcon(r.device?.deviceType)}
                        </div>
                        <div>
                          <span className="font-semibold text-content-primary block">
                            {r.device ? `${r.device.brand} ${r.device.model}` : "Unknown Device"}
                          </span>
                          <span className="text-[10px] font-mono text-content-muted uppercase">
                            {r.device?.deviceType || "Device"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-content-secondary">
                      {r.device?.serialNumber || r.device?.imei || "—"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-primary">
                      {r.customer?.fullName || "Walk-in"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-secondary">
                      {r.device?.color || "—"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-accent">
                      {r.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        href={`/repairs/${r.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-mono text-accent hover:underline"
                      >
                        <span>View Order</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
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
