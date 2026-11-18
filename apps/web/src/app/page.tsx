"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-btn bg-brand-700 text-white font-bold flex items-center justify-center mx-auto text-lg">
          FF
        </div>
        <p className="text-sm font-medium text-slate-500">Loading FixFlow...</p>
      </div>
    </div>
  );
}
