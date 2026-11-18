"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, User, Phone, Mail, FileText } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatDateTime, formatEthiopianPhone } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-950 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered repair clients, phone numbers, and device history
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Customer</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-btn text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-700"
        />
      </div>

      {/* Customers List */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={
            search
              ? "No customers match your search criteria."
              : "No customers have been registered yet. Create one or take in a repair!"
          }
          actionLabel="Register Customer"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-card overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center space-x-2">
                    <User className="w-4 h-4 text-brand-700" />
                    <span>{c.fullName}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatEthiopianPhone(c.phone)}</span>
                    </span>
                    {c.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </span>
                    )}
                  </div>
                  {c.notes && <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded">{c.notes}</p>}
                </div>

                <div className="text-right text-xs text-slate-400">
                  <span>Registered {formatDateTime(c.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card border border-slate-200 p-6 max-w-md w-full shadow-lg space-y-4">
            <h2 className="text-base font-bold text-ink-950">Add New Customer</h2>

            {error && (
              <div className="p-2.5 bg-danger-50 text-danger-700 rounded text-xs">{error}</div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Dawit Haile"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />

              <Input
                label="Ethiopian Mobile Phone"
                type="tel"
                required
                placeholder="e.g. 0912345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="customer@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <div className="flex justify-end space-x-2 pt-3">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>
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
