import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@bhagirathi/api-client";

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export interface PushNotificationOptions {
  autoSubscribe?: boolean;
}

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

// In-memory session tracking to avoid redundant network calls
let _globalLastSyncedEndpoint: string | null = null;
let _globalIsSyncing = false;

export function usePushNotification(options?: PushNotificationOptions): PushNotificationState {
  const autoSubscribe = options?.autoSubscribe ?? true;
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const syncAttemptedRef = useRef<boolean>(false);

  // Helper to ensure service worker is active
  const getReadyRegistration = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }
      return await navigator.serviceWorker.ready;
    } catch (err) {
      console.warn("[Push] Failed to resolve service worker:", err);
      return null;
    }
  }, []);

  // Post subscription payload to backend
  const sendSubscriptionToBackend = useCallback(async (sub: PushSubscription): Promise<boolean> => {
    try {
      const subJson = sub.toJSON();
      await apiClient.post("/api/v1/notifications/push/subscribe", {
        endpoint: sub.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh || "",
          auth: subJson.keys?.auth || "",
        },
        user_agent: navigator.userAgent,
      });
      _globalLastSyncedEndpoint = sub.endpoint;
      return true;
    } catch (err) {
      console.warn("[Push] Failed to synchronize subscription with backend:", err);
      return false;
    }
  }, []);

  // Create a new PushSubscription via PushManager
  const createPushSubscription = useCallback(async (reg: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
    try {
      let pubKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY;
      if (!pubKey) {
        const keyRes = await apiClient.get("/api/v1/notifications/push/public-key");
        pubKey = keyRes.data?.public_key;
      }
      if (!pubKey) {
        console.warn("[Push] VAPID public key not available.");
        return null;
      }
      const convertedKey = urlBase64ToUint8Array(pubKey);
      return await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    } catch (err: any) {
      console.warn("[Push] PushManager subscribe failed:", err);
      return null;
    }
  }, []);

  // Core automatic subscription & sync handler
  const handleAutoSubscription = useCallback(async (currentPerm: NotificationPermission) => {
    if (_globalIsSyncing) return;
    _globalIsSyncing = true;
    setIsLoading(true);

    try {
      const reg = await getReadyRegistration();
      if (!reg) {
        setIsLoading(false);
        _globalIsSyncing = false;
        return;
      }

      const sub = await reg.pushManager.getSubscription();

      if (currentPerm === "granted") {
        if (sub) {
          // Subscription already exists on browser - reuse and sync with backend once per session
          if (_globalLastSyncedEndpoint !== sub.endpoint) {
            await sendSubscriptionToBackend(sub);
          }
          setIsSubscribed(true);
        } else {
          // Permission is granted but subscription is missing - automatically create & sync
          const newSub = await createPushSubscription(reg);
          if (newSub) {
            await sendSubscriptionToBackend(newSub);
            setIsSubscribed(true);
          }
        }
      } else if (currentPerm === "default") {
        // First visit / permission unprompted: safely prompt at appropriate safe point once per session
        const hasPrompted = typeof sessionStorage !== "undefined" && sessionStorage.getItem("bhagirathi_push_prompted");
        if (!hasPrompted) {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("bhagirathi_push_prompted", "true");
          }
          const requestedPerm = await Notification.requestPermission();
          setPermission(requestedPerm as PushPermissionState);

          if (requestedPerm === "granted") {
            const newSub = await createPushSubscription(reg);
            if (newSub) {
              await sendSubscriptionToBackend(newSub);
              setIsSubscribed(true);
            }
          }
        }
      }
      // If "denied": do nothing, never prompt again, maintain state.
    } catch (err: any) {
      console.warn("[Push] Error during automatic push lifecycle:", err);
    } finally {
      setIsLoading(false);
      _globalIsSyncing = false;
    }
  }, [createPushSubscription, getReadyRegistration, sendSubscriptionToBackend]);

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

    const currentPerm = Notification.permission;
    setPermission(currentPerm as PushPermissionState);

    try {
      const reg = await getReadyRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));
      }
    } catch (err: any) {
      console.warn("[Push] Error checking subscription status:", err);
    }

    if (autoSubscribe && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      await handleAutoSubscription(currentPerm);
    }
  }, [autoSubscribe, getReadyRegistration, handleAutoSubscription]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Explicit subscribe method (retained for backward compatibility)
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications are not supported by this browser.");
      return false;
    }
    setIsLoading(true);
    setError(null);

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermissionState);

      if (perm !== "granted") {
        setIsLoading(false);
        return false;
      }

      const reg = await getReadyRegistration();
      if (!reg) throw new Error("Service worker registration not available.");

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await createPushSubscription(reg);
      }
      if (!sub) throw new Error("Could not create PushSubscription.");

      await sendSubscriptionToBackend(sub);
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
  }, [createPushSubscription, getReadyRegistration, isSupported, sendSubscriptionToBackend]);

  // Explicit unsubscribe method (retained for backward compatibility)
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    setError(null);

    try {
      const reg = await getReadyRegistration();
      if (reg) {
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
          _globalLastSyncedEndpoint = null;
        }
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
  }, [getReadyRegistration, isSupported]);

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
