"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest, setAuthToken } from "@/lib/api";
import { Store, User, Phone, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-canvas bg-grid-pattern relative">
      <div className="w-full max-w-lg bg-surface-card border border-border shadow-modal-dark rounded-xl p-6 sm:p-8 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-surface border border-accent/40 text-accent font-mono font-bold flex items-center justify-center mx-auto text-lg shadow-glow-accent">
            FF
          </div>
          <div>
            <h1 className="text-2xl font-bold text-content-primary tracking-tight">
              Register Repair Business
            </h1>
            <p className="text-xs text-content-secondary mt-1">
              Set up your shop workspace on FixFlow in under two minutes
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Owner / Lead Name"
              type="text"
              required
              placeholder="e.g. Abebe Kebede"
              value={formData.displayName}
              error={fieldErrors.displayName}
              leftIcon={<User className="w-4 h-4" />}
              onChange={(e) => handleChange("displayName", e.target.value)}
            />

            <Input
              label="Mobile Phone"
              type="tel"
              required
              placeholder="e.g. 0911223344"
              value={formData.phone}
              error={fieldErrors.phone}
              helperText="Ethiopian carrier number"
              leftIcon={<Phone className="w-4 h-4" />}
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
              leftIcon={<Mail className="w-4 h-4" />}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Input
              label="Account Password"
              type="password"
              required
              placeholder="Min. 8 characters"
              value={formData.password}
              error={fieldErrors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Shop / Business Name"
                type="text"
                required
                placeholder="e.g. Bole Precision Electronics"
                value={formData.shopName}
                error={fieldErrors.shopName}
                leftIcon={<Store className="w-4 h-4" />}
                onChange={(e) => handleChange("shopName", e.target.value)}
              />

              <Input
                label="City / Sub-City"
                type="text"
                placeholder="Addis Ababa"
                value={formData.shopCity}
                error={fieldErrors.shopCity}
                onChange={(e) => handleChange("shopCity", e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Initializing tenant & database..."
              className="w-full"
            >
              Launch Workshop Instance
            </Button>
          </div>
        </form>

        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-content-secondary">
            Already have an active shop?{" "}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
