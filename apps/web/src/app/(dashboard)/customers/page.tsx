"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, User, Phone, Mail, FileText, X, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    setIsLoading(true);
    const res = await apiRequest(`/customers?q=${encodeURIComponent(search)}`);
    setIsLoading(false);
    if (res.data) {
      setCustomers(res.data);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    const res = await apiRequest("/customers", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setIsCreating(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    setShowModal(false);
    setFormData({ fullName: "", phone: "", email: "", notes: "" });
    loadCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
              Customer Directory
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-card border border-border text-content-secondary">
              {customers.length} clients
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Registered repair clients, phone records, and device ownership histories
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          <span>New Customer</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by customer name or mobile number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-surface-card border border-border hover:border-border-strong rounded-btn text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
        />
      </div>

      {/* Customers List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={User}
          title="No customers registered"
          description={
            search
              ? "No customers match your search query."
              : "No customer records have been created yet. Add a customer or intake a new device!"
          }
          actionLabel="Register Customer"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="bg-surface-card border border-border rounded-card overflow-hidden shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-border text-content-muted text-[11px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-hover/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center font-mono text-xs font-semibold text-accent">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-content-primary">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-accent">
                      {formatEthiopianPhone(c.phone)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-content-secondary">
                      {c.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-content-muted max-w-xs truncate">
                      {c.notes || "—"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-[11px] text-content-muted">
                      {formatDateTime(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-md bg-surface-modal border border-border shadow-modal-dark rounded-xl p-6 z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-content-primary tracking-tight">
                Add Customer Profile
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-error-muted border border-error/30 text-error rounded text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Solomon Hailu"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Mobile Phone"
                required
                type="tel"
                placeholder="e.g. 0911223344"
                value={formData.phone}
                helperText="Must be a valid Ethiopian phone number"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="e.g. solomon@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Textarea
                label="Notes / Preferences (Optional)"
                placeholder="Customer VIP notes, company details, or address..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isCreating} loadingText="Saving...">
                  Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
