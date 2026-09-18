import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@bhagirathi/api-client";

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export interface PushNotificationOptions {
  autoSubscribe?: boolean;
  /** Pass the authenticated user's ID to scope sync state per-user.
   *  This prevents a previous user's sync record from blocking a new user
   *  after logout/login on the same browser tab without a full page reload.
   */
  userId?: string | null;
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

// ── User-scoped session deduplication ─────────────────────────────────────────
//
// Previously these were bare module-level variables:
//   let _globalLastSyncedEndpoint: string | null = null;
//   let _globalIsSyncing = false;
//
// This caused a state-leak bug: when an Admin logged out and a Tenant logged in
// on the same browser tab (without a full page reload), the Admin's synced
// endpoint blocked the Tenant's subscription from being registered with the
// correct backend user_id.
//
// Fix: key all deduplication by userId so each authenticated identity maintains
// its own independent sync state. Module-level Maps persist for the JS module
// lifetime (entire tab session), which is correct — we want to avoid redundant
// network calls within the same user's session, but not across user sessions.
// ──────────────────────────────────────────────────────────────────────────────

/** Map<userId, lastSyncedEndpoint> — tracks which endpoint was last confirmed
 *  synced to the backend for each user. Cleared on unsubscribe. */
const _syncedEndpointByUser = new Map<string, string>();

/** Set<userId> — guards against concurrent sync calls for the same user. */
const _syncingUsers = new Set<string>();

export function usePushNotification(options?: PushNotificationOptions): PushNotificationState {
  const autoSubscribe = options?.autoSubscribe ?? true;
  const userId = options?.userId ?? null;

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
      // Record the synced endpoint scoped to this user
      if (userId) {
        _syncedEndpointByUser.set(userId, sub.endpoint);
      }
      return true;
    } catch (err: any) {
      // Handle specific HTTP errors gracefully — no infinite retry
      const httpStatus = err?.response?.status;
      if (httpStatus === 401 || httpStatus === 403) {
        console.warn("[Push] Subscription sync unauthorized (session may have expired).");
      } else if (httpStatus === 409) {
        console.warn("[Push] Subscription already exists for this endpoint (idempotent).");
        if (userId) _syncedEndpointByUser.set(userId, sub.endpoint);
      } else {
        console.warn("[Push] Failed to synchronize subscription with backend:", err);
      }
      return false;
    }
  }, [userId]);

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

  // Core automatic subscription & sync handler.
  //
  // IMPORTANT — Permission handling:
  //
  //   GRANTED  → silently restore/verify the existing PushSubscription and
  //              sync it to the backend. No user prompt.
  //
  //   DEFAULT  → do NOT call Notification.requestPermission() here.
  //              Modern browsers require a direct user gesture (click/tap) to
  //              trigger the permission popup. Calling requestPermission() from
  //              useEffect is silently rejected on many mobile browsers and
  //              causes deprecation warnings on desktop Chrome.
  //              The explicit subscribe() method is called from user-initiated
  //              events (e.g. a settings toggle) and correctly calls
  //              requestPermission() there.
  //
  //   DENIED   → do nothing. Never prompt again.
  //
  const handleAutoSubscription = useCallback(async (currentPerm: NotificationPermission) => {
    // Guard against concurrent calls for the same user
    const syncKey = userId ?? "__anon__";
    if (_syncingUsers.has(syncKey)) return;
    _syncingUsers.add(syncKey);
    setIsLoading(true);

    try {
      const reg = await getReadyRegistration();
      if (!reg) return;

      if (currentPerm === "granted") {
        const sub = await reg.pushManager.getSubscription();

        if (sub) {
          // Subscription already exists — sync to backend only if not already
          // synced for this specific user+endpoint pair this session.
          const alreadySynced = userId && _syncedEndpointByUser.get(userId) === sub.endpoint;
          if (!alreadySynced) {
            await sendSubscriptionToBackend(sub);
          }
          setIsSubscribed(true);
        } else {
          // Permission is granted but browser subscription is missing
          // (e.g. subscription expired or cleared). Silently recreate it.
          const newSub = await createPushSubscription(reg);
          if (newSub) {
            await sendSubscriptionToBackend(newSub);
            setIsSubscribed(true);
          }
        }
      }
      // "default" — wait for explicit user interaction, do NOT prompt here.
      // "denied"  — do nothing.
    } catch (err: any) {
      console.warn("[Push] Error during automatic push lifecycle:", err);
    } finally {
      setIsLoading(false);
      _syncingUsers.delete(syncKey);
    }
  }, [createPushSubscription, getReadyRegistration, sendSubscriptionToBackend, userId]);

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

  // Explicit subscribe — MUST be called from a direct user interaction (click/tap).
  // This is the only safe place to call Notification.requestPermission().
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

  // Explicit unsubscribe — clears user-scoped sync state so the next login
  // on this device correctly re-syncs the subscription.
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
          // Clear user-scoped sync state so next login re-syncs correctly
          if (userId) {
            _syncedEndpointByUser.delete(userId);
          }
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
  }, [getReadyRegistration, isSupported, userId]);

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
