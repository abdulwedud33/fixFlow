"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Shield,
  Smartphone,
  CreditCard,
  Package,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";
import { getAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-content-primary bg-grid-pattern flex flex-col justify-between selection:bg-accent selection:text-canvas">
      {/* Top Navbar */}
      <header className="h-16 border-b border-border bg-surface-sidebar/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surface-card border border-accent/40 flex items-center justify-center font-mono font-bold text-accent text-sm shadow-glow-accent">
              FF
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-content-primary">
                FixFlow
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent uppercase">
                v2.4-PROD
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-3">
            <Link
              href="/track"
              className="text-xs font-mono text-content-secondary hover:text-content-primary hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-btn hover:bg-surface-card transition-colors"
            >
              <span>Track Device</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  <span>Open Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    <span>Register Shop</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex-1 flex flex-col items-center text-center">
        {/* Market Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-card border border-accent/30 text-accent text-xs font-mono mb-8 shadow-glow-accent animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>ENGINEERED ETHIOPIA-FIRST • ADDIS ABABA BENCHMARKS</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-content-primary max-w-4xl leading-[1.1] mb-6">
          Precision Repair Operations for Modern Workshops
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-lg text-content-secondary max-w-2xl leading-relaxed mb-10">
          Eliminate lost tickets, misplaced parts, and untracked Telebirr payments.
          FixFlow provides full-lifecycle hardware intake, technician assignment, and customer tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-16">
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <span>{isLoggedIn ? "Go to Dashboard" : "Enter Workbench"}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>

          <Link href="/track" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Smartphone className="w-4 h-4 mr-1.5 text-accent" />
              <span>Public Tracking Portal</span>
            </Button>
          </Link>
        </div>

        {/* Industrial Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left pt-12 border-t border-border/80">
          <div className="p-6 bg-surface-card border border-border rounded-card space-y-3 hover:border-accent/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-surface border border-accent/30 text-accent flex items-center justify-center shadow-glow-accent group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-content-primary text-base">
              Finite State Machine Transitions
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Strict lifecycle control from Intake to Diagnostics, Parts Waiting, and Pickup. Immutable actor attribution logs on every status shift.
            </p>
          </div>

          <div className="p-6 bg-surface-card border border-border rounded-card space-y-3 hover:border-sky/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-surface border border-sky/30 text-sky flex items-center justify-center shadow-glow-sky group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-content-primary text-base">
              Append-Only Birr Ledger
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Reconcile Telebirr, CBE Birr, Cash, and Bank Transfers without floating-point errors. Instant 80mm thermal receipt printing.
            </p>
          </div>

          <div className="p-6 bg-surface-card border border-border rounded-card space-y-3 hover:border-warning/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-surface border border-warning/30 text-warning flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-content-primary text-base">
              PostgreSQL Row-Level Security
            </h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Zero tenant cross-contamination. Shop datasets are isolated at the database engine layer with JWT-derived context enforcement.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-sidebar/60 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted font-mono gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>FixFlow Operational Engine • Ethiopia</span>
          </div>
          <div>
            <span>© 2026 FixFlow. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
