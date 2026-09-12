import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@bhagirathi/api-client";

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export interface PushNotificationState {
  isSupported: boolean;
  permission: PushPermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification(): PushNotificationState {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (typeof window === "undefined") return;

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (!supported) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermissionState);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));
    } catch (err: any) {
      console.warn("[Push] Error checking subscription:", err);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported by this browser.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Request user permission (prompt occurs ONLY on explicit user trigger)
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionState);

      if (perm !== "granted") {
        setIsLoading(false);
        return false;
      }

      // 2. Ensure Service Worker is active
      const reg = await navigator.serviceWorker.ready;

      // 3. Resolve VAPID Public Key (env var fallback to backend endpoint)
      let pubKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY;
      if (!pubKey) {
        const keyRes = await apiClient.get("/api/v1/notifications/push/public-key");
        pubKey = keyRes.data?.public_key;
      }

      if (!pubKey) {
        throw new Error("VAPID public key is not configured on the server.");
      }

      // 4. Subscribe via PushManager
      const convertedKey = urlBase64ToUint8Array(pubKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });

      // 5. Send subscription details to backend
      const subJson = sub.toJSON();
      await apiClient.post("/api/v1/notifications/push/subscribe", {
        endpoint: sub.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh || "",
          auth: subJson.keys?.auth || "",
        },
        user_agent: navigator.userAgent,
      });

      setIsSubscribed(true);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to enable notifications.";
      setError(msg);
      console.error("[Push] Subscription failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        try {
          await apiClient.post("/api/v1/notifications/push/unsubscribe", {
            endpoint: sub.endpoint,
          });
        } catch (apiErr) {
          console.warn("[Push] Backend unregister notice failed:", apiErr);
        }
        await sub.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to disable notifications.";
      setError(msg);
      console.error("[Push] Unsubscribe failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    refreshStatus: checkStatus,
  };
}
