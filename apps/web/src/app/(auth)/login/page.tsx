"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest, setAuthToken } from "@/lib/api";
import { ExternalLink, Lock, User, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    setIsLoading(false);

    if (res.error) {
      if (res.error.code === "INVALID_CREDENTIALS") {
        setError(
          "Invalid phone/email or password. If you have not created your shop yet, click 'Register Repair Business' below, or use the demo credentials."
        );
      } else {
        setError(res.error.message);
      }
      return;
    }

    if (res.data?.token) {
      setAuthToken(res.data.token);
      localStorage.setItem("fixflow_user", JSON.stringify(res.data.user));
      localStorage.setItem("fixflow_shop", JSON.stringify(res.data.shop));
      router.push("/dashboard");
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier("owner@example.com");
    setPassword("Password123!");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-canvas bg-grid-pattern relative">
      <div className="w-full max-w-md bg-surface-card border border-border shadow-modal-dark rounded-xl p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-surface border border-accent/40 text-accent font-mono font-bold flex items-center justify-center mx-auto text-lg shadow-glow-accent">
            FF
          </div>
          <div>
            <h1 className="text-2xl font-bold text-content-primary tracking-tight">
              Sign In to FixFlow
            </h1>
            <p className="text-xs text-content-secondary mt-1">
              Precision Repair Operations Platform
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-error-muted border border-error/40 text-error rounded-card text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number or Email"
            type="text"
            required
            placeholder="e.g. 0911223344 or owner@shop.et"
            value={identifier}
            leftIcon={<User className="w-4 h-4" />}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            leftIcon={<Lock className="w-4 h-4" />}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Authenticating..."
              className="w-full"
            >
              Authenticate & Enter Bench
            </Button>
          </div>
        </form>

        {/* Demo Fast-fill button for testing */}
        <div className="p-3 bg-surface border border-border/80 rounded-btn flex items-center justify-between text-xs">
          <span className="text-content-secondary font-mono text-[11px]">Testing demo account?</span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-accent hover:underline font-mono text-[11px] font-semibold flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 mr-0.5" />
            <span>Fill Demo Credentials</span>
          </button>
        </div>

        <div className="pt-4 border-t border-border text-center space-y-2">
          <p className="text-xs text-content-secondary">
            New shop owner?{" "}
            <Link href="/register" className="text-accent font-semibold hover:underline">
              Register Repair Business
            </Link>
          </p>

          <Link
            href="/track"
            className="text-[11px] font-mono text-content-muted hover:text-content-primary inline-flex items-center space-x-1"
          >
            <span>Customer Looking for Device Status?</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
