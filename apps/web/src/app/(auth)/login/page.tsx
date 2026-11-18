"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest, setAuthToken } from "@/lib/api";
import { ExternalLink } from "lucide-react";

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
      setError(res.error.message);
      return;
    }

    if (res.data?.token) {
      setAuthToken(res.data.token);
      localStorage.setItem("fixflow_user", JSON.stringify(res.data.user));
      localStorage.setItem("fixflow_shop", JSON.stringify(res.data.shop));
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-card p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-btn bg-brand-700 text-white font-bold flex items-center justify-center mx-auto text-xl mb-3">
            FF
          </div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Sign in to FixFlow</h1>
          <p className="text-sm text-slate-500 mt-1">
            Independent repair management platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger-50 border border-red-200 text-danger-700 rounded-btn text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number or Email"
            type="text"
            required
            placeholder="e.g. 0912345678 or owner@shop.et"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Signing in..."
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-600">
            Don't have a shop account?{" "}
            <Link href="/register" className="text-brand-700 font-semibold hover:underline">
              Register Shop
            </Link>
          </p>
          <div>
            <Link
              href="/track"
              className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <span>Customer looking for a repair status? Track here</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
