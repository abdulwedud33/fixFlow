"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  Users,
  Package,
  Search,
  Plus,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { clearAuthToken } from "@/lib/api";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopName, setShopName] = useState("FixFlow");
  const [userName, setUserName] = useState("Staff");

  useEffect(() => {
    const storedUser = localStorage.getItem("fixflow_user");
    const storedShop = localStorage.getItem("fixflow_shop");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.displayName) setUserName(u.displayName);
      } catch {}
    }
    if (storedShop) {
      try {
        const s = JSON.parse(storedShop);
        if (s.name) setShopName(s.name);
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Repairs", href: "/repairs", icon: Wrench },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Inventory", href: "/inventory", icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-ink-950 text-white flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-ink-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-btn bg-brand-700 flex items-center justify-center font-bold text-white tracking-wide">
              FF
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block leading-none">FixFlow</span>
              <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
                {shopName}
              </span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="p-4">
          <Link
            href="/repairs/new"
            className="w-full h-11 flex items-center justify-center space-x-2 bg-brand-700 hover:bg-brand-600 text-white font-medium rounded-btn text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Repair</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-700 text-white"
                    : "text-slate-300 hover:bg-ink-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-ink-800">
            <Link
              href="/track"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-btn text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>Public Tracking Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-ink-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[11px] text-slate-400">Ethiopian Shop</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-ink-800 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-ink-950 text-white flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-btn bg-brand-700 flex items-center justify-center font-bold text-white text-xs">
              FF
            </div>
            <span className="font-bold text-sm truncate max-w-[180px]">{shopName}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/repairs/new"
              className="h-8 px-2.5 bg-brand-700 text-white rounded text-xs font-medium flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-ink-950 text-white p-4 space-y-2 border-b border-ink-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-200"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-ink-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">{userName}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-danger-700 font-semibold"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (360px friendly) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium ${
                  isActive ? "text-brand-700 font-semibold" : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
