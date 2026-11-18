"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-sm text-slate-500">Loading receipt...</p>
      </div>
    );
  }

  const { shop, customer, device, repair, financials, warranty } = receipt;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center">
      {/* Top action bar (hidden during printing) */}
      <div className="no-print max-w-xl w-full flex items-center justify-between mb-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Repair</span>
        </button>

        <Button variant="primary" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-1.5" />
          <span>Print Receipt</span>
        </Button>
      </div>

      {/* Printable Receipt Paper Container (80mm Thermal Friendly) */}
      <div className="bg-white border border-slate-300 w-full max-w-[420px] p-6 sm:p-8 shadow-sm text-slate-900 font-sans text-xs space-y-4">
        {/* Shop Header */}
        <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
          <h1 className="text-base font-bold uppercase tracking-tight">{shop.name}</h1>
          <p className="text-slate-600">
            {shop.phone ? formatEthiopianPhone(shop.phone) : ""}
            {shop.city ? ` • ${shop.city}` : ""}
          </p>
          {shop.address && <p className="text-slate-500">{shop.address}</p>}
        </div>

        {/* Receipt & Ticket Identifiers */}
        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-300 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">TICKET NUMBER</span>
            <span className="font-mono font-bold text-sm text-slate-900">
              {repair.ticketNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">DATE & TIME</span>
            <span className="font-medium text-slate-700">{formatDateTime(repair.receivedAt)}</span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Customer
          </span>
          <p className="font-semibold text-sm text-slate-900">{customer.fullName}</p>
          <p className="text-slate-600">{formatEthiopianPhone(customer.phone)}</p>
        </div>

        {/* Device Information */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Device Received
          </span>
          <p className="font-medium text-slate-900">
            {device.brand} {device.model}
          </p>
          <p className="text-slate-500">IMEI/Serial: {device.serialOrImei}</p>
          <p className="text-slate-500">Condition: {device.condition}</p>
          {device.accessories && device.accessories.length > 0 && (
            <p className="text-slate-500">Accessories: {device.accessories.join(", ")}</p>
          )}
        </div>

        {/* Problem Description */}
        <div className="space-y-0.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Reported Issue
          </span>
          <p className="text-slate-800 italic bg-slate-50 p-2 rounded border border-slate-100">
            {repair.reportedIssue}
          </p>
        </div>

        {/* Financial Summary */}
        <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5">
          <div className="flex justify-between font-semibold text-sm">
            <span>Total Cost</span>
            <span>{formatETB(financials.totalCost)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Total Paid</span>
            <span>{formatETB(financials.totalPaid)}</span>
          </div>

          <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-200">
            <span>Balance Due</span>
            <span className={financials.balance > 0 ? "text-amber-800" : "text-teal-800"}>
              {formatETB(financials.balance)}
            </span>
          </div>
        </div>

        {/* Warranty Section if Present */}
        {warranty && (
          <div className="pt-2 border-t border-slate-100 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Warranty Coverage
            </span>
            <p className="text-slate-700">Valid until: {formatDateTime(warranty.endsAt)}</p>
            <p className="text-[10px] text-slate-500">{warranty.terms}</p>
          </div>
        )}

        {/* Footer & Signature lines */}
        <div className="pt-6 border-t border-dashed border-slate-300 space-y-4 text-center">
          <div className="grid grid-cols-2 gap-4 pt-4 text-[10px] text-slate-400">
            <div className="border-t border-slate-300 pt-1">Customer Signature</div>
            <div className="border-t border-slate-300 pt-1">Shop Stamp / Signature</div>
          </div>

          <p className="text-[10px] text-slate-500">{shop.receiptFooter}</p>

          <p className="text-[9px] text-slate-400">
            Track progress online: www.fixflow.et/track • {repair.ticketNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
