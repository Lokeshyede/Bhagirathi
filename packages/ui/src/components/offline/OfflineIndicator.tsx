import React, { useState } from "react";
import { WifiOff, Wifi, AlertCircle, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "./useNetworkStatus";
import { cn } from "../../design-system/utils";

export interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showWhenOnline = false,
}) => {
  const { status, isOnline, isBackOnline, checkConnection } = useNetworkStatus();
  const [isChecking, setIsChecking] = useState(false);

  // If online and not in the brief "back online" state, and showWhenOnline is false, do not render
  if (isOnline && !isBackOnline && !showWhenOnline) {
    return null;
  }

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      await checkConnection();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-3 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none select-none",
        className
      )}
    >
      {isBackOnline && (
        <div
          className={cn(
            "pointer-events-auto shadow-md backdrop-blur-md rounded-full px-4 py-1.5",
            "flex items-center gap-2 text-xs font-semibold tracking-wide",
            "bg-emerald-50 dark:bg-emerald-950/85 text-emerald-800 dark:text-emerald-200",
            "border border-emerald-500/30 animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Wifi className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Back online</span>
        </div>
      )}

      {!isOnline && status === "offline" && (
        <div
          className={cn(
            "pointer-events-auto shadow-lg backdrop-blur-md rounded-full px-4 py-1.5",
            "flex items-center gap-2.5 text-xs font-semibold tracking-wide",
            "bg-rose-50 dark:bg-rose-950/85 text-rose-900 dark:text-rose-100",
            "border border-rose-500/35 animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <WifiOff className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>You're offline</span>
          <span className="hidden sm:inline text-rose-700/80 dark:text-rose-300/80 text-[11px] font-normal border-l border-rose-500/25 pl-2">
            Live data and submissions unavailable
          </span>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isChecking}
            className="ml-1 text-[11px] font-medium underline text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white cursor-pointer disabled:opacity-50"
            title="Check connection"
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 animate-spin inline" />
            ) : (
              "Retry"
            )}
          </button>
        </div>
      )}

      {!isOnline && status === "degraded" && (
        <div
          className={cn(
            "pointer-events-auto shadow-lg backdrop-blur-md rounded-full px-4 py-1.5",
            "flex items-center gap-2.5 text-xs font-semibold tracking-wide",
            "bg-amber-50 dark:bg-amber-950/85 text-amber-900 dark:text-amber-100",
            "border border-amber-500/35 animate-in fade-in slide-in-from-top-2 duration-200"
          )}
        >
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Server connection interrupted</span>
          <span className="hidden sm:inline text-amber-700/80 dark:text-amber-300/80 text-[11px] font-normal border-l border-amber-500/25 pl-2">
            Backend unreachable
          </span>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isChecking}
            className="ml-1 text-[11px] font-medium underline text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white cursor-pointer disabled:opacity-50"
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 animate-spin inline" />
            ) : (
              "Retry"
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default OfflineIndicator;
