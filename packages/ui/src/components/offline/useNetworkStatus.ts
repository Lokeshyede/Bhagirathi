import { useState, useEffect, useCallback, useRef } from "react";
import { isNetworkOnline } from "@bhagirathi/utils";

export type NetworkStatusType = "online" | "offline" | "degraded";

export interface NetworkStatus {
  status: NetworkStatusType;
  isOnline: boolean;
  isOffline: boolean;
  isDegraded: boolean;
  isBackOnline: boolean;
  checkConnection: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatusType>(() =>
    isNetworkOnline() ? "online" : "offline"
  );
  const [isBackOnline, setIsBackOnline] = useState<boolean>(false);
  const backOnlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (backOnlineTimerRef.current) {
      clearTimeout(backOnlineTimerRef.current);
      backOnlineTimerRef.current = null;
    }
  };

  const handleOnline = useCallback(() => {
    setStatus("online");
    setIsBackOnline(true);
    clearTimer();
    backOnlineTimerRef.current = setTimeout(() => {
      setIsBackOnline(false);
    }, 3500);
  }, []);

  const handleOffline = useCallback(() => {
    clearTimer();
    setIsBackOnline(false);
    setStatus("offline");
  }, []);

  const handleBackendUnreachable = useCallback(() => {
    // If the browser reports offline, keep status as offline;
    // if browser is technically connected to a network but backend failed, mark degraded
    if (isNetworkOnline()) {
      setStatus("degraded");
    } else {
      setStatus("offline");
    }
  }, []);

  const handleBackendHealthy = useCallback(() => {
    setStatus((prev) => {
      if (prev === "degraded") {
        setIsBackOnline(true);
        clearTimer();
        backOnlineTimerRef.current = setTimeout(() => {
          setIsBackOnline(false);
        }, 3500);
        return "online";
      }
      return prev === "offline" ? (isNetworkOnline() ? "online" : "offline") : "online";
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("bhagirathi-backend-unreachable", handleBackendUnreachable);
    window.addEventListener("bhagirathi-backend-healthy", handleBackendHealthy);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("bhagirathi-backend-unreachable", handleBackendUnreachable);
      window.removeEventListener("bhagirathi-backend-healthy", handleBackendHealthy);
      clearTimer();
    };
  }, [handleOnline, handleOffline, handleBackendUnreachable, handleBackendHealthy]);

  // On-demand non-spamming connection check
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
      return false;
    }

    try {
      // Lightweight cache-busted fetch to test real connectivity without spamming
      const response = await fetch(`/favicon.ico?_ping=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      if (response.ok || response.status === 304 || response.status === 200) {
        handleOnline();
        return true;
      }
    } catch {
      // Fallback
    }

    if (isNetworkOnline()) {
      handleOnline();
      return true;
    } else {
      handleOffline();
      return false;
    }
  }, [handleOnline, handleOffline]);

  const isOnline = status === "online";
  const isOffline = status === "offline";
  const isDegraded = status === "degraded";

  return {
    status,
    isOnline,
    isOffline,
    isDegraded,
    isBackOnline,
    checkConnection,
  };
}
