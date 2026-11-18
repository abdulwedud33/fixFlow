"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Smartphone,
  Laptop,
  Tv,
  Tablet,
  User,
  Phone,
  Tag,
  Calendar,
  DollarSign,
  AlertCircle,
  Cpu,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { DeviceType, RepairPriority } from "@fixflow/contracts";

export default function NewRepairPage() {
  const router = useRouter();

  const [team, setTeam] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    deviceType: DeviceType.PHONE as string,
    brand: "",
    model: "",
    color: "",
    imeiOrSerial: "",
    reportedIssue: "",
    conditionOnIntake: "",
    accessories: [] as string[],
    priority: RepairPriority.NORMAL as string,
    estimatedCost: "",
    expectedCompletionDate: "",
    technicianId: "",
    sendCustomerSms: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load active staff members for assignment dropdown
    apiRequest("/shops/team").then((res) => {
      if (res.data) setTeam(res.data);
    });
  }, []);

  const commonAccessories = ["Charger", "USB Cable", "Phone Case", "SIM Card", "SD Card", "Box"];

  const toggleAccessory = (acc: string) => {
    setFormData((prev) => {
      const exists = prev.accessories.includes(acc);
      return {
        ...prev,
        accessories: exists
          ? prev.accessories.filter((a) => a !== acc)
          : [...prev.accessories, acc],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    const payload = {
      customer: {
        fullName: formData.customerName,
        phone: formData.customerPhone,
      },
      device: {
        deviceType: formData.deviceType,
        brand: formData.brand,
        model: formData.model,
        color: formData.color || undefined,
        imei: formData.imeiOrSerial || undefined,
        serialNumber: formData.imeiOrSerial || undefined,
      },
      reportedIssue: formData.reportedIssue,
      conditionOnIntake: formData.conditionOnIntake || undefined,
      accessoriesReceived: formData.accessories,
      priority: formData.priority,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      expectedCompletionAt: formData.expectedCompletionDate
        ? new Date(formData.expectedCompletionDate).toISOString()
        : undefined,
      assignedTechnicianUserId: formData.technicianId || undefined,
      sendCustomerSms: formData.sendCustomerSms,
    };

    const res = await apiRequest("/repairs", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (res.error) {
      setError(res.error.message);
      if (res.error.fieldErrors) {
        setFieldErrors(res.error.fieldErrors);
      }
      return;
    }

    if (res.data?.id) {
      router.push(`/repairs/${res.data.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-border">
        <Link
          href="/repairs"
          className="p-2 text-content-muted hover:text-content-primary hover:bg-surface-card rounded-btn transition-colors border border-border"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              New Device Intake
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-accent uppercase">
              Guided Wizard
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-0.5">
            Log customer details, inspect physical hardware, and generate tracking receipt
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-error-muted border border-error/40 text-error rounded-card text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer Details */}
        <div className="bg-surface-card border border-border rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-accent font-semibold">01</span>
              <h2 className="text-sm font-semibold text-content-primary tracking-wide">
                Customer Information
              </h2>
            </div>
            <span className="text-[11px] font-mono text-content-muted">Identity & Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name"
              required
              placeholder="e.g. Almaz Bekele"
              value={formData.customerName}
              error={fieldErrors["customer.fullName"]}
              leftIcon={<User className="w-4 h-4" />}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />

            <Input
              label="Mobile Phone"
              required
              type="tel"
              placeholder="e.g. 0911223344"
              value={formData.customerPhone}
              error={fieldErrors["customer.phone"]}
              helperText="Ethiopian mobile (SMS tracking & receipts)"
              leftIcon={<Phone className="w-4 h-4" />}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Device Details */}
        <div className="bg-surface-card border border-border rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-accent font-semibold">02</span>
              <h2 className="text-sm font-semibold text-content-primary tracking-wide">
                Hardware Specifications
              </h2>
            </div>
            <span className="text-[11px] font-mono text-content-muted">Device Registry</span>
          </div>

          {/* Device Type Selector */}
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-2">
              Device Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { type: DeviceType.PHONE, label: "Smartphone", icon: Smartphone },
                { type: DeviceType.LAPTOP, label: "Laptop", icon: Laptop },
                { type: DeviceType.TABLET, label: "Tablet", icon: Tablet },
                { type: DeviceType.APPLIANCE, label: "Appliance", icon: Tv },
              ].map((item) => {
                const isSelected = formData.deviceType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, deviceType: item.type })}
                    className={`flex flex-col items-center justify-center p-3 rounded-btn border text-xs font-medium transition-all ${isSelected
                      ? "bg-surface-card border-accent text-accent shadow-glow-accent"
                      : "bg-surface border-border text-content-secondary hover:border-border-strong hover:text-content-primary"
                      }`}
                  >
                    <Icon className="w-4 h-4 mb-1.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand / Manufacturer"
              required
              placeholder="e.g. Samsung, Apple, Tecno, HP"
              value={formData.brand}
              error={fieldErrors["device.brand"]}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />

            <Input
              label="Model"
              required
              placeholder="e.g. Galaxy A54, iPhone 13, Pavilion 15"
              value={formData.model}
              error={fieldErrors["device.model"]}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Color (Optional)"
              placeholder="e.g. Phantom Black, Silver"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />

            <Input
              label="IMEI or Serial Number (Optional)"
              placeholder="e.g. 356789123456789"
              value={formData.imeiOrSerial}
              onChange={(e) => setFormData({ ...formData, imeiOrSerial: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Problem & Intake Checklist */}
        <div className="bg-surface-card border border-border rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-accent font-semibold">03</span>
              <h2 className="text-sm font-semibold text-content-primary tracking-wide">
                Diagnostics & Physical Condition
              </h2>
            </div>
            <span className="text-[11px] font-mono text-content-muted">Intake Verification</span>
          </div>

          <Textarea
            label="Reported Fault / Customer Issue Description"
            required
            rows={3}
            placeholder="Describe the fault reported by customer (e.g. Broken OLED display, battery drains quickly, no sound from ear speaker)"
            value={formData.reportedIssue}
            error={fieldErrors.reportedIssue}
            onChange={(e) => setFormData({ ...formData, reportedIssue: e.target.value })}
          />

          <Input
            label="Physical Condition on Intake"
            placeholder="e.g. Scratched back panel, camera lens intact, no liquid ingress detected"
            value={formData.conditionOnIntake}
            onChange={(e) => setFormData({ ...formData, conditionOnIntake: e.target.value })}
          />

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-2">
              Accessories Left with Repair Shop
            </label>
            <div className="flex flex-wrap gap-2">
              {commonAccessories.map((acc) => {
                const isChecked = formData.accessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-btn text-xs font-medium border transition-all ${isChecked
                      ? "bg-accent-muted text-accent border-accent/40 font-semibold"
                      : "bg-surface border-border text-content-muted hover:border-border-strong hover:text-content-primary"
                      }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{acc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Estimates & Assignment */}
        <div className="bg-surface-card border border-border rounded-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-accent font-semibold">04</span>
              <h2 className="text-sm font-semibold text-content-primary tracking-wide">
                Initial Quotation & Bench Assignment
              </h2>
            </div>
            <span className="text-[11px] font-mono text-content-muted">Workbench Setup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimated Cost (ETB)"
              type="number"
              min="0"
              step="50"
              placeholder="e.g. 1500"
              value={formData.estimatedCost}
              leftIcon={<DollarSign className="w-4 h-4" />}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            />

            <Input
              label="Expected Completion Date"
              type="date"
              value={formData.expectedCompletionDate}
              leftIcon={<Calendar className="w-4 h-4" />}
              onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Assign Lead Technician
              </label>
              <select
                value={formData.technicianId}
                onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                className="w-full h-10 px-3 bg-surface-card border border-border hover:border-border-strong focus:border-accent rounded-btn text-sm text-content-primary focus:outline-none transition-colors"
              >
                <option value="">Unassigned (Assign later)</option>
                {team.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-10 px-3 bg-surface-card border border-border hover:border-border-strong focus:border-accent rounded-btn text-sm text-content-primary focus:outline-none transition-colors"
              >
                <option value={RepairPriority.NORMAL}>Normal Turnaround</option>
                <option value={RepairPriority.URGENT}>Urgent (Expedited Queue)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40">
            <label className="flex items-center space-x-2.5 text-xs text-content-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendCustomerSms}
                onChange={(e) => setFormData({ ...formData, sendCustomerSms: e.target.checked })}
                className="rounded border-border text-accent focus:ring-accent bg-surface-card"
              />
              <span>Send instant confirmation SMS with live tracking link to customer</span>
            </label>
          </div>
        </div>

        {/* Stable Form Submission Controls */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link href="/repairs">
            <Button variant="secondary" type="button">
              Discard
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Generating Ticket & Audit Trail..."
          >
            Create Repair Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
