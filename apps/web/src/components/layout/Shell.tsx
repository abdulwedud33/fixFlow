"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Search,
  ChevronDown,
  Smartphone,
  Cpu,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { clearAuthToken } from "@/lib/api";
import { CommandPalette } from "@/components/ui/CommandPalette";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shopName, setShopName] = useState("Addis Precision Repair");
  const [shopCity, setShopCity] = useState("Bole, Addis Ababa");
  const [userName, setUserName] = useState("Lead Technician");
  const [userRole, setUserRole] = useState("OWNER");

  useEffect(() => {
    const storedUser = localStorage.getItem("fixflow_user");
    const storedShop = localStorage.getItem("fixflow_shop");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.displayName) setUserName(u.displayName);
        if (u.role) setUserRole(u.role);
      } catch {}
    }
    if (storedShop) {
      try {
        const s = JSON.parse(storedShop);
        if (s.name) setShopName(s.name);
        if (s.address) setShopCity(s.address);
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
  };

  const navGroups = [
    {
      label: "Operations",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Repairs", href: "/repairs", icon: Wrench, badge: "Live" },
        { label: "New Intake", href: "/repairs/new", icon: Plus, isHighlight: true },
        { label: "Customers", href: "/customers", icon: Users },
        { label: "Devices", href: "/devices", icon: Smartphone },
      ],
    },
    {
      label: "Management",
      items: [
        { label: "Inventory", href: "/inventory", icon: Package },
        { label: "Technicians", href: "/technicians", icon: Cpu },
        { label: "Payments", href: "/payments", icon: CreditCard },
        { label: "Warranties", href: "/warranties", icon: ShieldCheck },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Reports", href: "/reports", icon: BarChart3 },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  // Derive breadcrumb from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumb = pathSegments.length > 0
    ? pathSegments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" / ")
    : "Overview";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-canvas text-content-primary">
      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-surface-sidebar transition-all duration-200 flex-shrink-0 z-30 h-screen sticky top-0 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand Header & Workspace Switcher */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-lg bg-surface-card border border-accent/40 flex items-center justify-center font-mono font-bold text-accent text-sm tracking-wider shadow-glow-accent">
                FF
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-content-primary tracking-tight">FixFlow</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-card border border-border text-accent font-medium">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-content-muted block truncate max-w-[140px]">
                  {shopName}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-surface-card border border-accent/40 flex items-center justify-center font-mono font-bold text-accent text-sm shadow-glow-accent">
              FF
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-content-muted hover:text-content-primary hover:bg-surface-card rounded transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Global Search / Command Bar Trigger */}
        {!sidebarCollapsed && (
          <div className="p-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full h-9 px-3 bg-surface-card border border-border hover:border-border-strong rounded-btn text-xs text-content-muted flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-content-muted group-hover:text-content-primary" />
                <span>Search or jump...</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border font-mono text-[10px] text-content-secondary">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-content-muted font-medium mb-1">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-btn text-sm font-medium transition-all group ${
                      sidebarCollapsed
                        ? "justify-center p-2.5"
                        : "justify-between px-3 py-2"
                    } ${
                      isActive
                        ? "bg-surface-card text-accent border border-accent/30 shadow-sm"
                        : "text-content-secondary hover:text-content-primary hover:bg-surface-hover/80"
                    } ${item.isHighlight && !isActive ? "text-accent/90" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-accent"
                            : item.isHighlight
                            ? "text-accent"
                            : "text-content-muted group-hover:text-content-primary"
                        }`}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-accent-muted text-accent border border-accent/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* External Public Tracking Link */}
          <div className="pt-2 border-t border-border">
            <Link
              href="/track"
              target="_blank"
              title={sidebarCollapsed ? "Public Tracking Portal" : undefined}
              className={`flex items-center rounded-btn text-xs text-content-muted hover:text-accent hover:bg-surface-hover transition-colors ${
                sidebarCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
              }`}
            >
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-3.5 h-3.5" />
                {!sidebarCollapsed && <span>Customer Tracking</span>}
              </div>
            </Link>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle/40">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-surface-card border border-border flex items-center justify-center font-mono text-xs text-content-primary font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-content-primary truncate">{userName}</p>
                  <p className="text-[10px] font-mono text-content-muted uppercase">{userRole}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-content-muted hover:text-error hover:bg-surface-card rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-full flex justify-center p-2 text-content-muted hover:text-error hover:bg-surface-card rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-border bg-surface-sidebar/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-content-secondary hover:text-content-primary"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-surface-card border border-accent/40 flex items-center justify-center font-mono text-xs font-bold text-accent">
                FF
              </div>
              <span className="font-bold text-sm tracking-tight">{shopName}</span>
            </div>
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-content-muted">
            <span className="hover:text-content-primary cursor-pointer">FixFlow</span>
            <span>/</span>
            <span className="text-content-primary font-medium">{breadcrumb}</span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Search on Desktop */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center space-x-2 h-8 px-2.5 rounded-btn bg-surface-card border border-border text-xs text-content-muted hover:border-border-strong hover:text-content-primary transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="px-1 py-0.2 rounded bg-surface-subtle border border-border font-mono text-[9px]">
                ⌘K
              </kbd>
            </button>

            {/* Quick New Intake Button */}
            <Link
              href="/repairs/new"
              className="h-8 px-3 rounded-btn bg-accent text-canvas font-semibold text-xs flex items-center space-x-1.5 shadow-glow-accent hover:bg-accent-hover transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Repair</span>
            </Link>

            {/* Operational Health Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-full bg-surface-card border border-border text-[11px] font-mono text-content-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-modal border-b border-border p-4 space-y-4 animate-in slide-in-from-top-2 duration-150 z-30">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-[10px] font-mono uppercase text-content-muted font-medium">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-content-secondary hover:text-content-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
              <span className="text-content-muted">{userName}</span>
              <button onClick={handleLogout} className="text-error font-medium">
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Primary Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-10">
          {children}
        </main>

        {/* Mobile Bottom Dock (360px optimized) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface-sidebar/95 backdrop-blur-md border-t border-border flex items-center justify-around z-20 px-2">
          {navGroups[0].items.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                  isActive ? "text-accent font-semibold" : "text-content-muted hover:text-content-secondary"
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
