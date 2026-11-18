"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Wrench,
  Users,
  Package,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Settings,
  Plus,
  ExternalLink,
  Command,
  ArrowRight,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // toggled by parent
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "new-repair",
      title: "New Repair Ticket",
      category: "Action",
      icon: Plus,
      color: "text-accent",
      href: "/repairs/new",
      keywords: "create add intake repair ticket",
    },
    {
      id: "view-repairs",
      title: "View All Repairs",
      category: "Navigation",
      icon: Wrench,
      color: "text-sky",
      href: "/repairs",
      keywords: "tickets repairs list active",
    },
    {
      id: "view-customers",
      title: "Customer Directory",
      category: "Navigation",
      icon: Users,
      color: "text-content-primary",
      href: "/customers",
      keywords: "clients customers people phone contact",
    },
    {
      id: "view-inventory",
      title: "Inventory & Stock Levels",
      category: "Navigation",
      icon: Package,
      color: "text-warning",
      href: "/inventory",
      keywords: "parts inventory stock sku screens batteries",
    },
    {
      id: "view-technicians",
      title: "Technicians & Workload",
      category: "Navigation",
      icon: Users,
      color: "text-content-primary",
      href: "/technicians",
      keywords: "staff technicians engineers assignments",
    },
    {
      id: "view-payments",
      title: "Payments & Cash Ledger",
      category: "Navigation",
      icon: CreditCard,
      color: "text-success",
      href: "/payments",
      keywords: "payments telebirr cbe cash receipts billing",
    },
    {
      id: "view-warranties",
      title: "Warranties & Guarantees",
      category: "Navigation",
      icon: ShieldCheck,
      color: "text-sky",
      href: "/warranties",
      keywords: "warranty claim guarantees active",
    },
    {
      id: "view-reports",
      title: "Analytics & Reports",
      category: "Navigation",
      icon: BarChart3,
      color: "text-content-primary",
      href: "/reports",
      keywords: "metrics charts analytics revenue performance",
    },
    {
      id: "view-tracking",
      title: "Open Public Tracking Portal",
      category: "Portal",
      icon: ExternalLink,
      color: "text-accent",
      href: "/track",
      keywords: "track tracking public status live verify",
    },
    {
      id: "view-settings",
      title: "Shop & Business Settings",
      category: "Settings",
      icon: Settings,
      color: "text-content-muted",
      href: "/settings",
      keywords: "settings configuration business profile sms",
    },
  ];

  const filtered = actions.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-canvas/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl bg-surface-modal border border-border shadow-modal-dark rounded-xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 h-14 border-b border-border bg-surface/50">
          <Search className="w-5 h-5 text-content-muted mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            autoFocus
            className="flex-1 bg-transparent border-none text-content-primary placeholder:text-content-muted text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-content-muted">
              No matching commands or destinations found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm hover:bg-surface-hover transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md bg-surface-card border border-border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium text-content-primary block text-sm">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-content-muted block">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity text-content-muted text-xs">
                    <span>Jump</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-surface-sidebar border-t border-border flex items-center justify-between text-[11px] text-content-muted">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border font-mono text-[10px]">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border text-[10px]">
              ESC
            </kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
