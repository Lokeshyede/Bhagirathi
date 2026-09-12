import React from "react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "./useNetworkStatus";
import { cn } from "../../design-system/utils";

export interface OfflineNoticeProps {
  message?: string;
  className?: string;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({
  message = "Internet connection required for this action.",
  className,
}) => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium",
        "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200",
        "border border-rose-200 dark:border-rose-900/50",
        "select-none transition-all",
        className
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
      <span>{message}</span>
    </div>
  );
};

export default OfflineNotice;
