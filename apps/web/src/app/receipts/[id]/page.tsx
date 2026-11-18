"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle, FileText } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatETB, formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export default function ReceiptPrintPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const [receipt, setReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/repairs/${ticketId}/receipt`).then((res) => {
      setIsLoading(false);
      if (res.data) setReceipt(res.data);
    });
  }, [ticketId]);

  if (isLoading || !receipt) {
    return (
      <div className="min-h-screen bg-canvas text-content-primary flex items-center justify-center p-4">
        <p className="text-xs font-mono text-content-muted">Formatting receipt document...</p>
      </div>
    );
  }

  const { shop, customer, device, repair, financials, warranty } = receipt;

  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-8 flex flex-col items-center">
      {/* Top action bar (hidden during printing) */}
      <div className="no-print max-w-xl w-full flex items-center justify-between mb-6 pb-4 border-b border-border">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-2 text-xs font-mono text-content-secondary hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workbench</span>
        </button>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print 80mm Receipt</span>
          </Button>
        </div>
      </div>

      {/* Printable Receipt Paper Container (80mm Thermal Friendly) */}
      <div className="bg-white border border-slate-300 w-full max-w-[420px] p-6 sm:p-8 shadow-card-dark text-slate-900 font-sans text-xs space-y-4 rounded-card">
        {/* Shop Header */}
        <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
          <h1 className="text-base font-bold uppercase tracking-tight">{shop.name}</h1>
          <p className="text-slate-600 font-mono text-[11px]">
            {shop.phone ? formatEthiopianPhone(shop.phone) : ""}
            {shop.city ? ` • ${shop.city}` : ""}
          </p>
          {shop.address && <p className="text-slate-500 text-[10px]">{shop.address}</p>}
        </div>

        {/* Receipt & Ticket Identifiers */}
        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-300 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-mono">TICKET NUMBER</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              {repair.ticketNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] font-mono">DATE RECORDED</span>
            <span className="font-mono text-slate-700 text-[11px]">{formatDateTime(repair.receivedAt)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
            Customer
          </span>
          <p className="font-semibold text-sm text-slate-900">{customer.fullName}</p>
          <p className="text-slate-600 font-mono text-xs">{formatEthiopianPhone(customer.phone)}</p>
        </div>

        {/* Device Information */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
            Device Received
          </span>
          <p className="font-medium text-slate-900">
            {device.brand} {device.model}
          </p>
          <p className="text-slate-500 font-mono text-[11px]">IMEI/Serial: {device.serialOrImei}</p>
          <p className="text-slate-500 text-[11px]">Condition: {device.condition}</p>
          {device.accessories && device.accessories.length > 0 && (
            <p className="text-slate-500 text-[11px]">Accessories: {device.accessories.join(", ")}</p>
          )}
        </div>

        {/* Financial Summary */}
        <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
          <div className="flex justify-between font-mono">
            <span className="text-slate-500">Quoted Total:</span>
            <span className="font-bold">{formatETB(financials.totalCost)}</span>
          </div>
          <div className="flex justify-between font-mono text-teal-700">
            <span>Amount Paid:</span>
            <span className="font-bold">{formatETB(financials.totalPaid)}</span>
          </div>
          <div className="flex justify-between font-mono font-bold text-sm pt-1 border-t border-slate-200">
            <span>Balance Due:</span>
            <span className={financials.balance > 0 ? "text-amber-800" : "text-teal-700"}>
              {formatETB(financials.balance)}
            </span>
          </div>
        </div>

        {/* Warranty Certificate if attached */}
        {warranty && (
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
            <span className="font-bold text-slate-900 block font-mono">Service Warranty Active</span>
            <p className="font-mono">Expires on: {formatDateTime(warranty.endsAt)}</p>
          </div>
        )}

        {/* Customer Tracking Notice & Footer */}
        <div className="pt-3 border-t border-dashed border-slate-300 text-center space-y-1">
          <p className="font-semibold text-slate-800 text-[11px]">Track your repair online anytime:</p>
          <p className="font-mono font-bold text-xs text-slate-900">fixflow.et/track</p>
          <p className="text-[10px] text-slate-400 pt-1">
            Thank you for choosing {shop.name}!
          </p>
        </div>
      </div>
    </div>
  );
}
