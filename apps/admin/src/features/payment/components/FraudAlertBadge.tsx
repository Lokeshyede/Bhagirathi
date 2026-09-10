import React from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";

interface FraudAlertBadgeProps {
  is_fraud_flagged: boolean;
  fraud_flags: string[];
  is_duplicate?: boolean;
  variant?: "inline" | "card";
}

export const FraudAlertBadge: React.FC<FraudAlertBadgeProps> = ({
  is_fraud_flagged,
  fraud_flags,
  is_duplicate = false,
  variant = "inline",
}) => {
  if (!is_fraud_flagged && !is_duplicate) return null;

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
        <ShieldAlert className="h-3.5 w-3.5" />
        {is_duplicate ? "Duplicate" : "Fraud Alert"}
      </span>
    );
  }

  return (
    <div className="rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800">
        <div className="h-7 w-7 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
          <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
            {is_duplicate ? "⚠️ Duplicate Payment Detected" : "🚨 Fraud Indicators Detected"}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            This payment has been flagged for review. Do NOT verify without investigation.
          </p>
        </div>
      </div>

      {fraud_flags && fraud_flags.length > 0 && (
        <div className="px-4 py-3 space-y-1.5">
          {fraud_flags.map((flag, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300 leading-snug">{flag}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
