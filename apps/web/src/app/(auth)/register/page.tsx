"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest, setAuthToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    email: "",
    password: "",
    shopName: "",
    shopCity: "Addis Ababa",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const res = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setIsLoading(false);

    if (res.error) {
      setError(res.error.message);
      if (res.error.fieldErrors) {
        setFieldErrors(res.error.fieldErrors);
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-card p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-btn bg-brand-700 text-white font-bold flex items-center justify-center mx-auto text-xl mb-3">
            FF
          </div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Set up your Repair Shop</h1>
          <p className="text-sm text-slate-500 mt-1">
            Get started with FixFlow in under two minutes
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger-50 border border-red-200 text-danger-700 rounded-btn text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Full Name"
              type="text"
              required
              placeholder="e.g. Abebe Kebede"
              value={formData.displayName}
              error={fieldErrors.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
            />

            <Input
              label="Mobile Phone"
              type="tel"
              required
              placeholder="e.g. 0912345678"
              value={formData.phone}
              error={fieldErrors.phone}
              helperText="Ethiopian number (09... or +251...)"
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="owner@shop.et"
              value={formData.email}
              error={fieldErrors.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Input
              label="Create Password"
              type="password"
              required
              placeholder="At least 8 characters"
              value={formData.password}
              error={fieldErrors.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop / Business Name"
                type="text"
                required
                placeholder="e.g. Abebe Mobile & Electronics"
                value={formData.shopName}
                error={fieldErrors.shopName}
                onChange={(e) => handleChange("shopName", e.target.value)}
              />

              <Input
                label="City / Location"
                type="text"
                placeholder="Addis Ababa"
                value={formData.shopCity}
                error={fieldErrors.shopCity}
                onChange={(e) => handleChange("shopCity", e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Creating shop..."
              className="w-full"
            >
              Create Shop & Continue
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="text-brand-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
