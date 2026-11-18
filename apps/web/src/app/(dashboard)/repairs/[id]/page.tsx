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
  User,
  Smartphone,
  Calendar,
  Layers,
  FileText,
  CreditCard,
  ChevronRight,
  Send,
  Eye,
  Lock,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
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
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-surface-card rounded animate-pulse" />
          <div className="h-8 w-24 bg-surface-card rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-4">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[ticket.status as RepairStatus] || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Work Order Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/repairs"
            className="p-2 text-content-muted hover:text-content-primary hover:bg-surface-card rounded-btn transition-colors border border-border"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-accent tracking-tight">
                {ticket.ticketNumber}
              </h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <p className="text-xs font-mono text-content-muted mt-0.5">
              Received {formatDateTime(ticket.receivedAt)} • {ticket.customer?.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/receipts/${ticket.id}`}
            target="_blank"
            className="h-9 px-3.5 bg-surface-card border border-border hover:border-border-strong text-content-primary rounded-btn text-xs font-medium inline-flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-accent" />
            <span>Print Receipt</span>
          </Link>
        </div>
      </div>

      {transitionError && (
        <div className="p-3 bg-error-muted border border-error/40 text-error rounded-card text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{transitionError}</span>
        </div>
      )}

      {/* Finite State Machine Status Transition Controller */}
      {allowedNextStatuses.length > 0 && (
        <div className="bg-surface-card border border-border rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card-dark">
          <div className="text-xs">
            <span className="text-content-muted font-mono uppercase tracking-wider text-[11px] block">
              Workbench Lifecycle
            </span>
            <span className="font-semibold text-content-primary">
              Current: {ticket.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-content-muted font-mono">Transition to:</span>
            {allowedNextStatuses.map((st) => (
              <Button
                key={st}
                variant={st === RepairStatus.CANCELLED ? "destructive" : "primary"}
                size="xs"
                isLoading={isTransitioning}
                loadingText="Updating state..."
                onClick={() => handleStatusTransition(st)}
              >
                {st.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-border overflow-x-auto">
        {[
          { key: "overview", label: "Overview & Diagnostics", icon: Wrench },
          { key: "notes", label: `Work Notes (${ticket.notes?.length || 0})`, icon: Clock },
          { key: "payments", label: `Payments (${formatETB(ticket.totalPaid)})`, icon: DollarSign },
          { key: "parts", label: `Parts Consumed (${ticket.partUsages?.length || 0})`, icon: Package },
          { key: "warranty", label: "Warranty Certificate", icon: ShieldCheck },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-accent text-accent font-semibold"
                  : "border-transparent text-content-secondary hover:text-content-primary"
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
            <div className="bg-surface-card border border-border rounded-card p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
                Customer Problem Description
              </h3>
              <p className="text-sm text-content-primary bg-surface p-3.5 rounded-btn border border-border/70 leading-relaxed">
                {ticket.reportedIssue}
              </p>

              <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium pt-2">
                Physical Condition on Intake
              </h3>
              <p className="text-sm text-content-secondary">
                {ticket.conditionOnIntake || "No visible physical defects noted at intake"}
              </p>

              <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium pt-2">
                Accessories Received
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {ticket.accessoriesReceived && ticket.accessoriesReceived.length > 0 ? (
                  ticket.accessoriesReceived.map((acc: string) => (
                    <span
                      key={acc}
                      className="px-2.5 py-1 bg-surface border border-border text-content-primary rounded-btn text-xs font-mono"
                    >
                      {acc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-content-muted font-mono">
                    Device only (no accessories left)
                  </span>
                )}
              </div>
            </div>

            {/* Audit History Timeline */}
            <div className="bg-surface-card border border-border rounded-card p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
                State Transition Audit Trail
              </h3>
              <div className="divide-y divide-border/60">
                {ticket.events?.map((ev: any) => (
                  <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-content-primary">
                        {ev.toStatus.replace(/_/g, " ")}
                      </span>
                      {ev.reason && <span className="text-content-secondary"> — {ev.reason}</span>}
                      <span className="block text-[11px] font-mono text-content-muted">
                        Recorded by {ev.actorDisplayName}
                      </span>
                    </div>
                    <span className="font-mono text-content-muted text-[11px]">
                      {formatDateTime(ev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customer & Device Cards */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-surface-card border border-border rounded-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-content-muted">
                <User className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-medium">Customer</h3>
              </div>
              <div>
                <p className="font-semibold text-content-primary text-sm">{ticket.customer?.fullName}</p>
                <p className="text-xs font-mono text-accent mt-0.5">
                  {formatEthiopianPhone(ticket.customer?.phone)}
                </p>
                {ticket.customer?.email && (
                  <p className="text-xs text-content-muted mt-0.5">{ticket.customer.email}</p>
                )}
              </div>
            </div>

            {/* Device Hardware Details */}
            <div className="bg-surface-card border border-border rounded-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-content-muted">
                <Smartphone className="w-4 h-4 text-sky" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-medium">Hardware Spec</h3>
              </div>
              <div className="text-xs space-y-2 text-content-secondary">
                <div className="flex justify-between">
                  <span className="text-content-muted">Brand:</span>
                  <span className="font-medium text-content-primary">{ticket.device?.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Model:</span>
                  <span className="font-medium text-content-primary">{ticket.device?.model}</span>
                </div>
                {ticket.device?.color && (
                  <div className="flex justify-between">
                    <span className="text-content-muted">Color:</span>
                    <span className="text-content-primary">{ticket.device.color}</span>
                  </div>
                )}
                {ticket.device?.imei && (
                  <div className="flex justify-between">
                    <span className="text-content-muted">IMEI / SN:</span>
                    <span className="font-mono text-content-primary">{ticket.device.imei}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Reconciliation Summary */}
            <div className="bg-surface-card border border-border rounded-card p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
                Financial Status
              </h3>
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-muted">Quoted Cost:</span>
                  <span className="font-mono font-medium text-content-primary">
                    {formatETB(ticket.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Paid So Far:</span>
                  <span className="font-mono font-medium text-accent">
                    {formatETB(ticket.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-medium text-content-primary">Remaining Due:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      ticket.balance > 0 ? "text-warning" : "text-success"
                    }`}
                  >
                    {formatETB(ticket.balance)}
                  </span>
                </div>
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
            className="bg-surface-card border border-border rounded-card p-5 space-y-3"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
              Record Bench Work Note or Diagnosis
            </h3>
            <Textarea
              placeholder="Record diagnostic findings, testing steps, or instructions..."
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={2}
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-4 text-xs">
                <label className="flex items-center space-x-1.5 cursor-pointer text-content-secondary">
                  <input
                    type="radio"
                    checked={noteType === "internal"}
                    onChange={() => setNoteType("internal")}
                    className="text-accent"
                  />
                  <span>Internal Staff Only</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-content-secondary">
                  <input
                    type="radio"
                    checked={noteType === "customer_visible"}
                    onChange={() => setNoteType("customer_visible")}
                    className="text-accent"
                  />
                  <span>Customer Visible (on Public Tracking)</span>
                </label>
              </div>
              <Button type="submit" size="xs" isLoading={isAddingNote} loadingText="Saving...">
                Save Note
              </Button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-3">
            {ticket.notes?.length === 0 ? (
              <p className="text-xs font-mono text-content-muted text-center py-8">
                No diagnostic notes recorded yet.
              </p>
            ) : (
              ticket.notes?.map((n: any) => (
                <div
                  key={n.id}
                  className="bg-surface-card border border-border rounded-card p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-content-primary">
                      {n.authorDisplayName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          n.noteType === "customer_visible"
                            ? "bg-accent-muted text-accent border border-accent/20"
                            : "bg-surface border border-border text-content-muted"
                        }`}
                      >
                        {n.noteType === "customer_visible" ? "Customer Visible" : "Internal"}
                      </span>
                      <span className="text-[11px] font-mono text-content-muted">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-content-secondary leading-relaxed">{n.body}</p>
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
          <div className="bg-surface-card border border-border rounded-card p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
              Record Customer Payment
            </h3>

            {paymentError && (
              <div className="p-2.5 bg-error-muted border border-error/30 text-error rounded text-xs">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <Input
                label="Payment Amount (ETB)"
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 500"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-card border border-border hover:border-border-strong rounded-btn text-sm text-content-primary focus:outline-none focus:border-accent"
                >
                  <option value={PaymentMethod.CASH}>Cash (Physical Birr)</option>
                  <option value={PaymentMethod.MOBILE_MONEY}>Telebirr / CBE Birr</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  <option value={PaymentMethod.CARD}>Debit / Credit Card</option>
                </select>
              </div>

              <Input
                label="Transaction Reference # (Optional)"
                placeholder="e.g. Telebirr TX ID, CBE Slip #"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isRecordingPayment}
                loadingText="Recording to ledger..."
                className="w-full"
              >
                Record Payment
              </Button>
            </form>
          </div>

          {/* Ledger history */}
          <div className="md:col-span-2 bg-surface-card border border-border rounded-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
                Append-Only Financial Ledger
              </h3>
              <div className="text-right">
                <span className="text-xs text-content-muted font-mono">Remaining: </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    ticket.balance > 0 ? "text-warning" : "text-success"
                  }`}
                >
                  {formatETB(ticket.balance)}
                </span>
              </div>
            </div>

            {ticket.payments?.length === 0 ? (
              <p className="text-xs font-mono text-content-muted text-center py-8">
                No payment entries recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {ticket.payments?.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-sm text-accent block">
                        {formatETB(p.amount)}
                      </span>
                      <span className="text-content-secondary capitalize">
                        {p.method.replace(/_/g, " ")}
                      </span>
                      {p.reference && (
                        <span className="text-content-muted font-mono"> (Ref: {p.reference})</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-accent-muted text-accent border border-accent/20">
                        {p.status}
                      </span>
                      <span className="block text-[11px] font-mono text-content-muted mt-0.5">
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
            className="bg-surface-card border border-border rounded-card p-5 space-y-4"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
              Consume Spare Part from Inventory
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Select Stock Item
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-card border border-border hover:border-border-strong rounded-btn text-sm text-content-primary focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Choose item from warehouse...</option>
                  {availableParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — In Stock: {p.currentQuantity} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Quantity Needed"
                type="number"
                min="1"
                required
                value={partQuantity}
                onChange={(e) => setPartQuantity(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="xs"
              isLoading={isConsumingPart}
              loadingText="Deducting from inventory..."
            >
              Issue Part to Ticket
            </Button>
          </form>

          {/* Consumed parts list */}
          <div className="bg-surface-card border border-border rounded-card p-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium mb-3">
              Parts Attached to this Work Order
            </h3>
            {ticket.partUsages?.length === 0 ? (
              <p className="text-xs font-mono text-content-muted text-center py-6">
                No spare parts consumed yet.
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {ticket.partUsages?.map((u: any) => (
                  <div key={u.id} className="py-2.5 flex justify-between text-xs">
                    <div>
                      <span className="font-semibold text-content-primary">{u.partName}</span>
                      <span className="text-content-muted block font-mono text-[11px]">{u.partSku}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-content-primary">Qty: {u.quantity}</span>
                      <span className="block font-mono text-content-muted text-[11px]">
                        {formatETB(u.unitCost)} each
                      </span>
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
        <div className="bg-surface-card border border-border rounded-card p-5 space-y-4 max-w-xl">
          <h3 className="text-xs font-mono uppercase tracking-wider text-content-muted font-medium">
            Service Warranty Certificate
          </h3>

          {ticket.warranty ? (
            <div className="space-y-2.5 text-xs text-content-secondary p-4 bg-surface border border-accent/30 rounded-card">
              <div className="flex items-center space-x-2 text-accent font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Active Warranty Protection</span>
              </div>
              <p>
                <span className="text-content-muted">Valid From:</span>{" "}
                <span className="font-mono text-content-primary">
                  {formatDateTime(ticket.warranty.startsAt)}
                </span>
              </p>
              <p>
                <span className="text-content-muted">Expiration Date:</span>{" "}
                <span className="font-mono font-semibold text-content-primary">
                  {formatDateTime(ticket.warranty.endsAt)}
                </span>
              </p>
              <p className="pt-2 border-t border-border text-[11px] text-content-muted">
                Terms: {ticket.warranty.terms}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-content-secondary">
                Issue a service warranty certificate for the labor and replacement components fitted to this device.
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
