"use client";

import React, { useState, useEffect } from "react";
import { Settings, Store, Users, Bell, Shield, Check, Save } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [shopName, setShopName] = useState("Addis Precision Repair");
  const [shopPhone, setShopPhone] = useState("+251911223344");
  const [shopCity, setShopCity] = useState("Bole Sub-City, Addis Ababa, Ethiopia");
  const [tinNumber, setTinNumber] = useState("0012345678");
  const [smsSenderId, setSmsSenderId] = useState("FIXFLOW");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fixflow_shop");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.name) setShopName(s.name);
        if (s.phone) setShopPhone(s.phone);
        if (s.address) setShopCity(s.address);
      } catch {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      const updated = {
        name: shopName,
        phone: shopPhone,
        address: shopCity,
        tin: tinNumber,
      };
      localStorage.setItem("fixflow_shop", JSON.stringify(updated));
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Business & System Settings
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent uppercase">
              Configuration
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Shop profile metadata, printable receipt headers, and notification gateways
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-btn bg-success-muted text-success border border-success/30 text-xs font-mono">
            <Check className="w-3.5 h-3.5" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="p-5 sm:p-6 bg-surface-card border border-border rounded-card space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <Store className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-content-primary">
              Repair Shop Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shop Legal / Trade Name"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <Input
              label="Shop Support Phone"
              required
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
            />
          </div>

          <Input
            label="Workshop Address & Physical Location"
            required
            value={shopCity}
            onChange={(e) => setShopCity(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="TIN / Tax Registration Number (Optional)"
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
            />
            <Input
              label="Default Currency Code"
              disabled
              value="ETB (Ethiopian Birr)"
            />
          </div>
        </div>

        {/* SMS Notifications Gateway */}
        <div className="p-5 sm:p-6 bg-surface-card border border-border rounded-card space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <Bell className="w-4 h-4 text-sky" />
            <h3 className="text-sm font-semibold text-content-primary">
              Customer SMS Notification Gateway
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SMS Sender Header"
              value={smsSenderId}
              onChange={(e) => setSmsSenderId(e.target.value)}
              helperText="Displays as sender on Ethiopian carrier networks"
            />
            <Input
              label="SMS Provider Status"
              disabled
              value="Active (Ethiopia Telecom Adapter)"
            />
          </div>

          <div className="space-y-2 pt-2 text-xs text-content-secondary">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border text-accent" />
              <span>Send SMS when ticket is moved to &quot;Ready for Pickup&quot;</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border text-accent" />
              <span>Send SMS receipt when payment is recorded</span>
            </label>
          </div>
        </div>

        {/* Security & Access */}
        <div className="p-5 sm:p-6 bg-surface-card border border-border rounded-card space-y-3">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <Shield className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-content-primary">
              Multi-Tenant Data Isolation & Security
            </h3>
          </div>
          <p className="text-xs text-content-secondary leading-relaxed">
            All repair tickets, customer data, and financial transactions are cryptographically isolated per-tenant with PostgreSQL Row-Level Security (RLS). Cross-tenant queries are blocked at the database engine level.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-accent/30 text-accent font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              RLS Policy Active • Token-Derived Tenant Context
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button variant="primary" type="submit" isLoading={isSaving} loadingText="Saving Settings...">
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
