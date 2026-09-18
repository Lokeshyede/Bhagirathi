import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { ApiErrorResponse } from "@bhagirathi/types";

// Dynamic API Base Resolution compatible with Vite and tests
const getApiBaseUrl = (): string => {
  const env = (import.meta as any).env;

  const proc = (globalThis as any).process;
  const envUrl =
    env?.VITE_API_BASE_URL ||
    env?.VITE_API_URL ||
    proc?.env?.VITE_API_BASE_URL ||
    proc?.env?.VITE_API_URL;

  if (envUrl) {
    const cleaned = String(envUrl).replace(/\/+$/, "").trim();
    // If cleaned is non-empty (e.g. "https://..." or "http://..."), use it.
    // If it was "/" alone, do not treat as a valid remote backend URL.
    if (cleaned !== "") {
      return cleaned;
    }
  }

  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
  }

  // Safe fallback for Node/testing environments
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  throw new Error(
    "API base URL is not configured. Set VITE_API_URL to your backend URL (e.g. https://bhagirathibackend-production.up.railway.app)."
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// Portal-Specific Storage Key Configuration
//
// Each portal has its own isolated localStorage namespace:
//   Admin Portal       → admin_auth_token / admin_refresh_token / admin_auth_user
//   Tenant Portal      → tenant_auth_token / tenant_refresh_token / tenant_auth_user
//   Maintenance Portal → maintenance_auth_token / maintenance_refresh_token / maintenance_auth_user
//
// The portal identity is set EXPLICITLY via initApiClient() called from each
// portal's main.tsx at startup — before any React renders, before any API calls.
//
// This replaces the previous port-based detection (5173/5174/5175) which was
// unsafe: if a port was occupied and Vite bumped to another, the wrong portal
// key namespace was used, causing an infinite 401 → Session Expired loop.
// ─────────────────────────────────────────────────────────────────────────────

const PORTAL_KEYS = {
  admin: {
    token: "admin_auth_token",
    refresh: "admin_refresh_token",
    user: "admin_auth_user",
  },
  tenant: {
    token: "tenant_auth_token",
    refresh: "tenant_refresh_token",
    user: "tenant_auth_user",
  },
  maintenance: {
    token: "maintenance_auth_token",
    refresh: "maintenance_refresh_token",
    user: "maintenance_auth_user",
  },
} as const;

type PortalName = keyof typeof PORTAL_KEYS;
type PortalKeys = { token: string; refresh: string; user: string };

// Module-level portal name — set once at app startup via initApiClient().
// Defaults to "admin" as a safe fallback (matching previous behaviour for
// code paths that do not call initApiClient, e.g., unit tests).
let _currentPortal: PortalName = "admin";

/**
 * Initialize the API client with the correct portal identity.
 * Must be called ONCE at application startup (in main.tsx) before any
 * React renders or API requests are made.
 *
 * Example:
 *   // apps/admin/src/main.tsx
 *   initApiClient("admin");
 *
 *   // apps/tenant/src/main.tsx
 *   initApiClient("tenant");
 *
 *   // apps/maintenance/src/main.tsx
 *   initApiClient("maintenance");
 */
export function initApiClient(portal: PortalName): void {
  _currentPortal = portal;
}

/**
 * Returns the storage key set for the currently active portal.
 * Always returns the keys set by the most recent initApiClient() call.
 * Never guesses from port numbers or token presence.
 */
function getPortalKeys(): PortalKeys {
  return PORTAL_KEYS[_currentPortal];
}

// Axios Instance Setup
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export class OfflineMutationError extends Error {
  readonly isOffline = true;
  constructor(message = "Internet connection required for this action.") {
    super(message);
    this.name = "OfflineMutationError";
  }
}

// Request interceptor — enforces offline mutation safety and injects portal-specific Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Enforce strict offline mutation blocking (Phase 3 Requirement)
    // Never allow POST, PUT, PATCH, DELETE business mutations when offline.
    const method = (config.method || "get").toLowerCase();
    const isMutation = ["post", "put", "patch", "delete"].includes(method);

    if (isMutation && typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineError: any = new OfflineMutationError(
        "Internet connection required for this action."
      );
      offlineError.response = {
        status: 0,
        statusText: "Offline",
        data: {
          detail: "Internet connection required for this action.",
        },
        headers: {},
        config,
      };
      return Promise.reject(offlineError);
    }

    const keys = getPortalKeys();
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(keys.token)
        : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for concurrent refresh queuing (prevents multiple refresh calls)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor — handles 401 Unauthorized responses:
 *  1. Attempts silent token refresh using the portal-specific refresh token
 *  2. Retries the original request with the new access token
 *  3. If refresh fails → clears portal-specific storage → dispatches "bhagirathi-unauthorized"
 *     (App.tsx listens for this event and shows the "Session Expired" modal)
 *
 * All localStorage operations use portal-specific keys via getPortalKeys() —
 * never generic keys, never port-guessed keys.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Signal healthy backend connectivity when requests succeed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("bhagirathi-backend-healthy"));
    }
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config;

    // Detect network / offline failures and notify network status listeners
    if (
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      (typeof navigator !== "undefined" && !navigator.onLine)
    ) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bhagirathi-backend-unreachable"));
      }

      if (!error.response) {
        const method = (originalRequest?.method || "").toLowerCase();
        const isMutation = ["post", "put", "patch", "delete"].includes(method);
        error.response = {
          status: 0,
          statusText: "Network Error",
          data: {
            detail: isMutation
              ? "Internet connection required for this action."
              : "Unable to connect to server. Please check your internet connection.",
          },
          headers: {},
          config: originalRequest || ({} as any),
        };
      }
    }

    if (error.response?.status === 401 && originalRequest) {
      // If this request was already a retry attempt and it failed again with 401,
      // invalidate session state immediately to prevent infinite loops
      if ((originalRequest as any)._retry) {
        const keys = getPortalKeys();
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.refresh);
        localStorage.removeItem(keys.user);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("bhagirathi-unauthorized"));
        }
        return Promise.reject(error);
      }

      // Prevent infinite loop on auth endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }

      // Resolve keys for the current portal
      const keys = getPortalKeys();
      const refreshToken = localStorage.getItem(keys.refresh);

      if (!refreshToken) {
        // No refresh token → clear portal-specific state and signal session end
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.refresh);
        localStorage.removeItem(keys.user);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("bhagirathi-unauthorized"));
        }
        return Promise.reject(error);
      }

      // Queue concurrent requests while refresh is in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            // Mark the original request as retried to enforce single retry constraint
            (originalRequest as any)._retry = true;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${getApiBaseUrl()}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, refresh_token } = response.data;

        // Store new tokens under the SAME portal-specific keys
        localStorage.setItem(keys.token, access_token);
        localStorage.setItem(keys.refresh, refresh_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed → clear portal-specific storage and signal session end
        const keys = getPortalKeys();
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.refresh);
        localStorage.removeItem(keys.user);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("bhagirathi-unauthorized"));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Shared React Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Generic query keys builder
export const queryKeys = {
  auth: ["auth"] as const,
  profile: ["profile"] as const,
  health: ["health"] as const,
};
