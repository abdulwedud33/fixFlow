"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Wrench, CheckCircle2, Clock, MapPin, Phone, AlertCircle, Shield, Smartphone, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { formatDateTime, formatEthiopianPhone } from "@/lib/format";
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

  const stages = [
    { key: "RECEIVED", label: "Received" },
    { key: "DIAGNOSING", label: "Diagnosis" },
    { key: "IN_PROGRESS", label: "Repairing" },
    { key: "READY_FOR_PICKUP", label: "Ready" },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case "RECEIVED": return 0;
      case "DIAGNOSING": return 1;
      case "WAITING_FOR_APPROVAL":
      case "WAITING_FOR_PARTS":
      case "IN_PROGRESS": return 2;
      case "READY_FOR_PICKUP":
      case "COLLECTED": return 3;
      default: return 0;
    }
  };

  const currentStageIndex = result ? getStageIndex(result.status) : 0;

  return (
    <div className="min-h-screen bg-canvas text-content-primary flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-card border border-accent/40 flex items-center justify-center font-mono font-bold text-accent text-sm shadow-glow-accent">
            FF
          </div>
          <span className="font-bold text-content-primary text-base tracking-tight">FixFlow Portal</span>
        </div>
        <Link
          href="/login"
          className="text-xs font-mono text-accent hover:underline flex items-center space-x-1"
        >
          <span>Staff Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Glass Card */}
      <main className="max-w-xl w-full mx-auto bg-surface-card border border-border shadow-modal-dark rounded-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-surface border border-accent/25 text-accent text-[11px] font-mono mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Secure Customer Lookup</span>
          </div>
          <h1 className="text-2xl font-bold text-content-primary tracking-tight">
            Live Repair Tracker
          </h1>
          <p className="text-xs text-content-secondary">
            Enter your work order tracking code and phone digits to view live status
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-error-muted border border-error/40 text-error rounded-card text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Form */}
        <form onSubmit={handleTrack} className="space-y-4">
          <Input
            label="Ticket Number"
            required
            placeholder="e.g. FF-2611-0001"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
          />

          <Input
            label="Last 4 Digits of Your Phone"
            required
            type="text"
            maxLength={4}
            placeholder="e.g. 3344"
            helperText="The mobile number provided during device drop-off"
            value={phoneLast4}
            onChange={(e) => setPhoneLast4(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Verifying with shop database..."
            className="w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            <span>Track Repair Progress</span>
          </Button>
        </form>

        {/* Tracking Result View */}
        {result && (
          <div className="pt-6 border-t border-border space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider block">
                  Tracking Code
                </span>
                <span className="text-lg font-mono font-bold text-accent">
                  {result.ticketNumber}
                </span>
              </div>
              <StatusBadge status={result.status} />
            </div>

            {/* Visual Progress Stepper */}
            <div className="p-4 bg-surface rounded-card border border-border/80 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted block">
                Repair Milestone Progress
              </span>
              <div className="grid grid-cols-4 gap-2">
                {stages.map((stage, idx) => {
                  const isPassed = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="space-y-1.5 text-center">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isPassed ? "bg-accent shadow-glow-accent" : "bg-surface-card"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono block ${
                          isCurrent
                            ? "text-accent font-bold"
                            : isPassed
                            ? "text-content-primary"
                            : "text-content-muted"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ready for Pickup Alert */}
            {result.status === "READY_FOR_PICKUP" && (
              <div className="p-4 bg-success-muted border border-success/40 rounded-card text-xs text-success space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Your Device is Ready for Collection!</span>
                </p>
                <p className="text-[11px] text-content-secondary">
                  Please visit the repair shop with your phone or ticket number to collect your hardware.
                </p>
              </div>
            )}

            {/* Hardware & Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-surface p-4 rounded-card border border-border">
              <div>
                <span className="text-content-muted block text-[11px] mb-0.5">Device Hardware</span>
                <span className="font-semibold text-content-primary block font-mono">
                  {result.deviceSummary}
                </span>
              </div>
              <div>
                <span className="text-content-muted block text-[11px] mb-0.5">Intake Date</span>
                <span className="font-mono text-content-secondary block">
                  {formatDateTime(result.receivedAt)}
                </span>
              </div>
              {result.expectedCompletionAt && (
                <div className="col-span-2 pt-2 border-t border-border">
                  <span className="text-content-muted block text-[11px] mb-0.5">Estimated Completion</span>
                  <span className="font-mono font-medium text-accent block">
                    {formatDateTime(result.expectedCompletionAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Public Technician Notes */}
            {result.publicNotes && result.publicNotes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-content-muted block">
                  Technician Updates
                </span>
                <div className="divide-y divide-border/60 bg-surface border border-border rounded-card p-3">
                  {result.publicNotes.map((n, i) => (
                    <div key={i} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                      <p className="text-content-primary leading-relaxed">{n.body}</p>
                      <span className="text-[10px] font-mono text-content-muted block mt-1">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shop Contact Card */}
            <div className="pt-4 border-t border-border text-xs text-content-secondary space-y-1.5">
              <span className="font-bold text-content-primary block">{result.shopName}</span>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono text-content-primary">{result.shopPhone}</span>
              </p>
              {result.shopAddress && (
                <p className="flex items-center space-x-2 text-content-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{result.shopAddress}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-content-muted pt-6">
        FixFlow Precision Operations • Multi-Tenant Protected
      </footer>
    </div>
  );
}
