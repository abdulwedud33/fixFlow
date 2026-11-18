"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Smartphone, Laptop, Tv, Tablet } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
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
      <div className="flex items-center space-x-3">
        <Link
          href="/repairs"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">New Repair Intake</h1>
          <p className="text-xs text-slate-500">
            Log customer details, device hardware info, and intake checklist
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-red-200 text-danger-700 rounded-btn text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer Details */}
        <div className="bg-white border border-slate-200 rounded-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider text-slate-700">
            1. Customer Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name"
              required
              placeholder="e.g. Almaz Bekele"
              value={formData.customerName}
              error={fieldErrors["customer.fullName"]}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />

            <Input
              label="Mobile Phone"
              required
              type="tel"
              placeholder="e.g. 0911223344"
              value={formData.customerPhone}
              error={fieldErrors["customer.phone"]}
              helperText="For SMS status updates & receipt"
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Device Details */}
        <div className="bg-white border border-slate-200 rounded-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider text-slate-700">
            2. Device Details
          </h2>

          {/* Device Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Device Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { type: DeviceType.PHONE, label: "Phone", icon: Smartphone },
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
                    className={`flex flex-col items-center justify-center p-2.5 rounded-btn border text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-brand-50 border-brand-700 text-brand-700 font-semibold"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
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
        <div className="bg-white border border-slate-200 rounded-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider text-slate-700">
            3. Intake Inspection & Issues
          </h2>

          <Textarea
            label="Reported Problem / Issue Description"
            required
            rows={3}
            placeholder="Describe what the customer reported (e.g. Screen cracked, device does not charge, power button stuck)"
            value={formData.reportedIssue}
            error={fieldErrors.reportedIssue}
            onChange={(e) => setFormData({ ...formData, reportedIssue: e.target.value })}
          />

          <Input
            label="Physical Condition on Intake"
            placeholder="e.g. Minor scratches on back, glass cracked at top right, water damage indicator pink"
            value={formData.conditionOnIntake}
            onChange={(e) => setFormData({ ...formData, conditionOnIntake: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Accessories Left With Device
            </label>
            <div className="flex flex-wrap gap-2">
              {commonAccessories.map((acc) => {
                const isChecked = formData.accessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isChecked
                        ? "bg-brand-700 text-white border-brand-700"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                    <span>{acc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Estimates & Assignment */}
        <div className="bg-white border border-slate-200 rounded-card p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider text-slate-700">
            4. Estimates & Technician Assignment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Cost Estimate (ETB)"
              type="number"
              min="0"
              step="50"
              placeholder="e.g. 1500"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            />

            <Input
              label="Expected Completion Date"
              type="date"
              value={formData.expectedCompletionDate}
              onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign Technician
              </label>
              <select
                value={formData.technicianId}
                onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-btn text-sm text-slate-900 focus:outline-none focus:border-brand-700"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-btn text-sm text-slate-900 focus:outline-none focus:border-brand-700"
              >
                <option value={RepairPriority.NORMAL}>Normal Priority</option>
                <option value={RepairPriority.URGENT}>Urgent (Expedited)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendCustomerSms}
                onChange={(e) => setFormData({ ...formData, sendCustomerSms: e.target.checked })}
                className="rounded border-slate-300 text-brand-700 focus:ring-brand-700"
              />
              <span>Send intake confirmation SMS with tracking link to customer</span>
            </label>
          </div>
        </div>

        {/* Stable Form Submission Bar */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Link href="/repairs">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Creating Ticket & Generating Receipt..."
          >
            Create Repair Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
