"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Wrench,
  Clock,
  DollarSign,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { DetailsSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  RepairStatus,
  ALLOWED_TRANSITIONS,
  PaymentMethod,
} from "@fixflow/contracts";

export default function RepairDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "payments" | "parts" | "warranty">("overview");

  // Status transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Work note state
  const [noteBody, setNoteBody] = useState("");
  const [noteType, setNoteType] = useState<"internal" | "customer_visible">("internal");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Payment state
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<string>(PaymentMethod.CASH);
  const [payReference, setPayReference] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Parts consumption state
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [partQuantity, setPartQuantity] = useState("1");
  const [isConsumingPart, setIsConsumingPart] = useState(false);

  // Warranty state
  const [warrantyDays, setWarrantyDays] = useState("30");
  const [isIssuingWarranty, setIsIssuingWarranty] = useState(false);

  useEffect(() => {
    loadTicket();
    // Load inventory parts
    apiRequest("/inventory").then((res) => {
      if (res.data) setAvailableParts(res.data);
    });
  }, [ticketId]);

  const loadTicket = async () => {
    setIsLoading(true);
    const res = await apiRequest(`/repairs/${ticketId}`);
    setIsLoading(false);
    if (res.data) {
      setTicket(res.data);
    }
  };

  const handleStatusTransition = async (toStatus: RepairStatus) => {
    setIsTransitioning(true);
    setTransitionError(null);

    const res = await apiRequest(`/repairs/${ticket.id}/transitions`, {
      method: "POST",
      body: JSON.stringify({ toStatus }),
    });

    setIsTransitioning(false);

    if (res.error) {
      setTransitionError(res.error.message);
      return;
    }

    loadTicket();
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim()) return;

    setIsAddingNote(true);
    await apiRequest(`/repairs/${ticket.id}/notes`, {
      method: "POST",
      body: JSON.stringify({ noteType, body: noteBody }),
    });
    setIsAddingNote(false);
    setNoteBody("");
    loadTicket();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsRecordingPayment(true);
    setPaymentError(null);

    const idempotencyKey = `pay_${ticket.id}_${Date.now()}`;
    const res = await apiRequest(`/repairs/${ticket.id}/payments`, {
      method: "POST",
      body: JSON.stringify({
        amount,
        method: payMethod,
        reference: payReference || undefined,
        idempotencyKey,
      }),
    });

    setIsRecordingPayment(false);

    if (res.error) {
      setPaymentError(res.error.message);
      return;
    }

    setPayAmount("");
    setPayReference("");
    loadTicket();
  };

  const handleConsumePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;

    setIsConsumingPart(true);
    await apiRequest(`/inventory/repairs/${ticket.id}/consume`, {
      method: "POST",
      body: JSON.stringify({
        partId: selectedPartId,
        quantity: parseInt(partQuantity, 10) || 1,
      }),
    });
    setIsConsumingPart(false);
    setSelectedPartId("");
    setPartQuantity("1");
    loadTicket();
  };

  const handleIssueWarranty = async () => {
    setIsIssuingWarranty(true);
    await apiRequest("/warranties", {
      method: "POST",
      body: JSON.stringify({
        repairTicketId: ticket.id,
        durationDays: parseInt(warrantyDays, 10) || 30,
      }),
    });
    setIsIssuingWarranty(false);
    loadTicket();
  };

  if (isLoading || !ticket) {
    return <DetailsSkeleton />;
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[ticket.status as RepairStatus] || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/repairs"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-mono font-bold text-ink-950 tracking-tight">
                {ticket.ticketNumber}
              </h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Intake recorded {formatDateTime(ticket.receivedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/receipts/${ticket.id}`}
            target="_blank"
            className="h-10 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-btn text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Receipt</span>
          </Link>
        </div>
      </div>

      {transitionError && (
        <div className="p-3 bg-danger-50 border border-red-200 text-danger-700 rounded-btn text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{transitionError}</span>
        </div>
      )}

      {/* Status Lifecycle Transition Action Bar */}
      {allowedNextStatuses.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Current Status:</span> {ticket.status}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">Move to:</span>
            {allowedNextStatuses.map((st) => (
              <Button
                key={st}
                variant={st === RepairStatus.CANCELLED ? "destructive" : "primary"}
                size="sm"
                isLoading={isTransitioning}
                loadingText="Updating..."
                onClick={() => handleStatusTransition(st)}
              >
                {st.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto">
        {[
          { key: "overview", label: "Overview & Intake", icon: Wrench },
          { key: "notes", label: `Work Notes (${ticket.notes?.length || 0})`, icon: Clock },
          { key: "payments", label: `Payments & Balance`, icon: DollarSign },
          { key: "parts", label: `Parts Used (${ticket.partUsages?.length || 0})`, icon: Package },
          { key: "warranty", label: "Warranty", icon: ShieldCheck },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-brand-700 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Reported Issue & Condition */}
            <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reported Issue
              </h3>
              <p className="text-sm text-slate-900 bg-slate-50 p-3 rounded border border-slate-200">
                {ticket.reportedIssue}
              </p>

              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
                Physical Condition on Intake
              </h3>
              <p className="text-sm text-slate-700">
                {ticket.conditionOnIntake || "No visible defects noted"}
              </p>

              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
                Accessories Received
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {ticket.accessoriesReceived && ticket.accessoriesReceived.length > 0 ? (
                  ticket.accessoriesReceived.map((acc: string) => (
                    <span
                      key={acc}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-btn text-xs font-medium border border-slate-200"
                    >
                      {acc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Device only (no accessories)</span>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white border border-slate-200 rounded-card p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Status History
              </h3>
              <div className="divide-y divide-slate-100">
                {ticket.events?.map((ev: any) => (
                  <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">
                        {ev.toStatus.replace(/_/g, " ")}
                      </span>
                      {ev.reason && <span className="text-slate-500"> — {ev.reason}</span>}
                      <span className="block text-[11px] text-slate-400">
                        By {ev.actorDisplayName}
                      </span>
                    </div>
                    <span className="text-slate-400">{formatDateTime(ev.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Device Cards */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white border border-slate-200 rounded-card p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Customer</h3>
              <div>
                <p className="font-semibold text-slate-900">{ticket.customer?.fullName}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {formatEthiopianPhone(ticket.customer?.phone)}
                </p>
                {ticket.customer?.email && (
                  <p className="text-xs text-slate-500">{ticket.customer.email}</p>
                )}
              </div>
            </div>

            {/* Device Details */}
            <div className="bg-white border border-slate-200 rounded-card p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Device</h3>
              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  <span className="text-slate-500">Brand:</span>{" "}
                  <span className="font-semibold text-slate-900">{ticket.device?.brand}</span>
                </p>
                <p>
                  <span className="text-slate-500">Model:</span>{" "}
                  <span className="font-semibold text-slate-900">{ticket.device?.model}</span>
                </p>
                {ticket.device?.color && (
                  <p>
                    <span className="text-slate-500">Color:</span> {ticket.device.color}
                  </p>
                )}
                {ticket.device?.imei && (
                  <p>
                    <span className="text-slate-500">IMEI:</span> {ticket.device.imei}
                  </p>
                )}
              </div>
            </div>

            {/* Assignment & Costs */}
            <div className="bg-white border border-slate-200 rounded-card p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bench Assignment
              </h3>
              <p className="text-xs text-slate-800">
                {ticket.assignedTechnician
                  ? `Assigned to: ${ticket.assignedTechnician.displayName}`
                  : "Unassigned"}
              </p>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Total Cost:</span>
                <span className="font-bold text-slate-900">{formatETB(ticket.totalCost)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Paid so far:</span>
                <span className="font-bold text-teal-700">{formatETB(ticket.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Balance:</span>
                <span
                  className={`font-bold ${
                    ticket.balance > 0 ? "text-amber-700" : "text-teal-700"
                  }`}
                >
                  {formatETB(ticket.balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Work Notes */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          <form
            onSubmit={handleAddNote}
            className="bg-white border border-slate-200 rounded-card p-5 space-y-3 shadow-sm"
          >
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Work Note / Diagnosis
            </h3>
            <Textarea
              label="Note Body"
              placeholder="Record diagnostic findings, repair progress, or instructions..."
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={2}
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3 text-xs">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={noteType === "internal"}
                    onChange={() => setNoteType("internal")}
                  />
                  <span>Internal Staff Only</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={noteType === "customer_visible"}
                    onChange={() => setNoteType("customer_visible")}
                  />
                  <span>Customer Visible (on Public Tracking)</span>
                </label>
              </div>
              <Button type="submit" size="sm" isLoading={isAddingNote} loadingText="Saving...">
                Save Note
              </Button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-3">
            {ticket.notes?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No work notes yet.</p>
            ) : (
              ticket.notes?.map((n: any) => (
                <div
                  key={n.id}
                  className="bg-white border border-slate-200 rounded-card p-4 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{n.authorDisplayName}</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          n.noteType === "customer_visible"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {n.noteType === "customer_visible" ? "Customer Visible" : "Internal"}
                      </span>
                      <span className="text-slate-400">{formatDateTime(n.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-800">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Payments & Balance */}
      {activeTab === "payments" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Record payment form */}
          <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Record Payment
            </h3>

            {paymentError && (
              <div className="p-2.5 bg-danger-50 text-danger-700 rounded text-xs">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <Input
                label="Amount (ETB)"
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 500"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-btn text-sm"
                >
                  <option value={PaymentMethod.CASH}>Cash</option>
                  <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money (Telebirr / CBE)</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  <option value={PaymentMethod.CARD}>Card</option>
                </select>
              </div>

              <Input
                label="Transaction Reference # (Optional)"
                placeholder="e.g. Telebirr TX # or Slip #"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isRecordingPayment}
                loadingText="Recording..."
                className="w-full"
              >
                Record Payment
              </Button>
            </form>
          </div>

          {/* Ledger history */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-card p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment History (Append-Only Ledger)
              </h3>
              <div className="text-right">
                <span className="text-xs text-slate-500">Remaining Balance: </span>
                <span
                  className={`font-bold text-sm ${
                    ticket.balance > 0 ? "text-amber-700" : "text-teal-700"
                  }`}
                >
                  {formatETB(ticket.balance)}
                </span>
              </div>
            </div>

            {ticket.payments?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No payments recorded yet for this repair.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {ticket.payments?.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        {formatETB(p.amount)}
                      </span>
                      <span className="text-slate-500 capitalize">{p.method.replace(/_/g, " ")}</span>
                      {p.reference && (
                        <span className="text-slate-400"> (Ref: {p.reference})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.status === "recorded"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-danger-50 text-danger-700"
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(p.recordedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Parts Consumed */}
      {activeTab === "parts" && (
        <div className="space-y-6">
          <form
            onSubmit={handleConsumePart}
            className="bg-white border border-slate-200 rounded-card p-5 space-y-4 shadow-sm"
          >
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issue Part from Inventory
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Part from Inventory
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-300 rounded-btn text-sm"
                  required
                >
                  <option value="">Choose a part...</option>
                  {availableParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — In Stock: {p.currentQuantity} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Quantity"
                type="number"
                min="1"
                required
                value={partQuantity}
                onChange={(e) => setPartQuantity(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={isConsumingPart}
              loadingText="Deducting from inventory..."
            >
              Consume Part for Repair
            </Button>
          </form>

          {/* Consumed parts list */}
          <div className="bg-white border border-slate-200 rounded-card p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Parts Attached to this Ticket
            </h3>
            {ticket.partUsages?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No parts consumed yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {ticket.partUsages?.map((u: any) => (
                  <div key={u.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{u.partName}</span>
                      <span className="text-slate-400 block font-mono">{u.partSku}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-800">Qty: {u.quantity}</span>
                      <span className="block text-slate-500">{formatETB(u.unitCost)} each</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Warranty */}
      {activeTab === "warranty" && (
        <div className="bg-white border border-slate-200 rounded-card p-5 space-y-4 shadow-sm max-w-xl">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Warranty Certificate
          </h3>

          {ticket.warranty ? (
            <div className="space-y-2 text-xs text-slate-700 p-4 bg-teal-50/50 border border-teal-200 rounded-btn">
              <div className="flex items-center space-x-1.5 text-teal-700 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Active Warranty</span>
              </div>
              <p>
                <span className="text-slate-500">Valid From:</span>{" "}
                {formatDateTime(ticket.warranty.startsAt)}
              </p>
              <p>
                <span className="text-slate-500">Expires:</span>{" "}
                <span className="font-semibold text-slate-900">
                  {formatDateTime(ticket.warranty.endsAt)}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Coverage Terms:</span> {ticket.warranty.terms}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Issue a service warranty certificate for the work completed on this device.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duration (Days)"
                  type="number"
                  min="1"
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleIssueWarranty}
                isLoading={isIssuingWarranty}
                loadingText="Issuing Warranty..."
              >
                Issue Warranty Certificate
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
