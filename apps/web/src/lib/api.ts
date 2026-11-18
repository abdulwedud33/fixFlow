const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
    requestId?: string;
  };
  meta?: Record<string, any>;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fixflow_token");
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fixflow_token", token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fixflow_token");
    localStorage.removeItem("fixflow_user");
    localStorage.removeItem("fixflow_shop");
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        clearAuthToken();
        window.location.href = "/login";
      }
      return {
        error: data.error || {
          code: "REQUEST_FAILED",
          message: data.message || "Request failed",
        },
      };
    }

    return data;
  } catch (err: any) {
    return {
      error: {
        code: "NETWORK_ERROR",
        message: "Unable to connect to the server. Please check your internet connection.",
      },
    };
  }
}
