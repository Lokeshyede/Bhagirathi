import React from "react";
import { Bell, BellOff, BellRing, CheckCircle2, AlertTriangle, Loader2, Info } from "lucide-react";
import { usePushNotification } from "../hooks/usePushNotification";

export const PushNotificationCard: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotification();

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-400 text-xs">
        <Info className="h-4 w-4 shrink-0 text-gray-400" />
        <span>Web Push notifications are not supported in this browser environment.</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">Push Notifications Blocked</p>
            <p className="text-amber-700 dark:text-amber-300 mt-0.5">
              Notifications are blocked in your browser settings. To receive instant alerts, click the lock icon in your browser address bar and allow notifications for this site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span>Web Push Notifications Active</span>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              You will receive instant alerts on this device even when the browser tab is closed.
            </p>
          </div>
        </div>
        <button
          onClick={unsubscribe}
          disabled={isLoading}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium transition cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <BellOff className="h-3.5 w-3.5" />
          )}
          <span>Disable</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
          <BellRing className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            Enable Push Notifications
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Stay informed with real-time updates for payments, readings, and maintenance alerts.
          </p>
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>
      </div>
      <button
        onClick={subscribe}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Bell className="h-3.5 w-3.5" />
        )}
        <span>Enable Notifications</span>
      </button>
    </div>
  );
};
