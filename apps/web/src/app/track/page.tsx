"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Wrench, CheckCircle2, Clock, MapPin, Phone, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { PublicRepairStatus } from "@fixflow/contracts";

export default function PublicTrackingPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicRepairStatus | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    const res = await apiRequest("/tracking", {
      method: "POST",
      body: JSON.stringify({
        ticketNumber: ticketNumber.trim(),
        phoneLast4: phoneLast4.trim(),
      }),
    });

    setIsLoading(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (res.data) {
      setResult(res.data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-btn bg-brand-700 text-white font-bold flex items-center justify-center text-sm">
            FF
          </div>
          <span className="font-bold text-ink-950 text-base">FixFlow Tracking</span>
        </div>
        <Link href="/login" className="text-xs text-brand-700 font-semibold hover:underline">
          Shop Staff Sign In
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-xl w-full mx-auto bg-white border border-slate-200 rounded-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Track Your Repair</h1>
          <p className="text-xs text-slate-500">
            Check live repair progress, diagnostic updates, and collection readiness
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger-50 border border-red-200 text-danger-700 rounded-btn text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Form */}
        <form onSubmit={handleTrack} className="space-y-4">
          <Input
            label="Repair Tracking Number"
            required
            placeholder="e.g. FF-2611-0001"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
          />

          <Input
            label="Last 4 Digits of Mobile Phone"
            required
            type="text"
            maxLength={4}
            placeholder="e.g. 3344"
            helperText="The phone number you provided during intake"
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Looking up status..."
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            <span>Check Status</span>
          </Button>
        </form>

        {/* Tracking Result View */}
        {result && (
          <div className="pt-6 border-t border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                  Tracking Number
                </span>
                <span className="text-lg font-mono font-bold text-brand-700">
                  {result.ticketNumber}
                </span>
              </div>
              <StatusBadge status={result.status} />
            </div>

            {/* Status Announcement Banner */}
            {result.status === "READY_FOR_PICKUP" && (
              <div className="p-4 bg-teal-50 border border-teal-300 rounded-btn text-xs text-teal-800 space-y-1">
                <p className="font-bold flex items-center space-x-1.5 text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Your Device is Ready for Collection!</span>
                </p>
                <p>
                  Please visit the repair shop with your tracking receipt or phone to collect your
                  device.
                </p>
              </div>
            )}

            {/* Device & Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-btn border border-slate-200">
              <div>
                <span className="text-slate-400 block mb-0.5">Device</span>
                <span className="font-semibold text-slate-900 block">{result.deviceSummary}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Date Received</span>
                <span className="font-medium text-slate-800 block">
                  {formatDateTime(result.receivedAt)}
                </span>
              </div>
              {result.expectedCompletionAt && (
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Estimated Completion</span>
                  <span className="font-medium text-slate-800 block">
                    {formatDateTime(result.expectedCompletionAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Public Progress Updates */}
            {result.publicNotes && result.publicNotes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Progress Updates
                </span>
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-btn p-3">
                  {result.publicNotes.map((n, i) => (
                    <div key={i} className="py-2 first:pt-0 last:pb-0 text-xs">
                      <p className="text-slate-800">{n.body}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repair Shop Contact Info */}
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">{result.shopName}</span>
              <p className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{result.shopPhone}</span>
              </p>
              {result.shopAddress && (
                <p className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{result.shopAddress}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pt-6">
        Protected by FixFlow Security • Ethiopia
      </footer>
    </div>
  );
}
