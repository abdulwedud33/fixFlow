"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { getAuthToken } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-10 h-10 rounded-lg bg-surface-card border border-accent/40 text-accent font-mono font-bold flex items-center justify-center text-sm shadow-glow-accent animate-pulse">
          FF
        </div>
      </div>
    );
  }

  return <Shell>{children}</Shell>;
}
