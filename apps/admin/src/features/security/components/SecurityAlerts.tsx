import React from "react";
import { AlertTriangle, Lock, ShieldOff } from "lucide-react";

interface SecurityHoldBannerProps {
  paymentReference?: string | null;
  riskScore?: number | null;
  riskLevel?: string | null;
  securityNotes?: string | null;
  manualOverrideReason?: string | null;
  onReleaseHold?: () => void;
  onAddNotes?: () => void;
}

export const SecurityHoldBanner: React.FC<SecurityHoldBannerProps> = ({
  paymentReference,
  riskScore,
  riskLevel,
  securityNotes,
  manualOverrideReason,
  onReleaseHold,
  onAddNotes,
}) => {
  const released = !!manualOverrideReason;

  if (released) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4 flex items-start gap-3">
        <ShieldOff className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-400">Security Hold Released</p>
          <p className="text-xs text-emerald-400/70 mt-0.5">Override reason: {manualOverrideReason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Lock className="h-5 w-5 text-red-400 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-400">🔒 Security Hold Active</p>
          {paymentReference && (
            <p className="text-xs text-red-400/60">
              {paymentReference} · Risk {riskScore}/100 ({riskLevel})
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {securityNotes && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
          <p className="text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {securityNotes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {onReleaseHold && (
          <button
            onClick={onReleaseHold}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors cursor-pointer"
          >
            Release Hold
          </button>
        )}
        {onAddNotes && (
          <button
            onClick={onAddNotes}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            Add Investigation Notes
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Fraud Alert Banner ────────────────────────────────────────────────────────

interface FraudAlertBannerProps {
  flags: string[];
  triggeredRules?: Array<{ type: string; detail: string }>;
  onDismiss?: () => void;
}

export const FraudAlertBanner: React.FC<FraudAlertBannerProps> = ({
  flags,
  triggeredRules = [],
  onDismiss,
}) => {
  if (!flags.length && !triggeredRules.length) return null;

  return (
    <div className="rounded-xl border border-orange-500/40 bg-orange-500/8 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
          <p className="text-sm font-semibold text-orange-400">
            Fraud Flags Detected ({flags.length + triggeredRules.length})
          </p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-orange-400/50 hover:text-orange-400 text-xs cursor-pointer">✕</button>
        )}
      </div>

      <ul className="mt-3 space-y-1.5">
        {flags.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-orange-300/80">
            <span className="text-orange-500 shrink-0 mt-0.5">⚠</span>
            {f}
          </li>
        ))}
        {triggeredRules.map((r, i) => (
          <li key={`rule-${i}`} className="flex items-start gap-2 text-xs text-orange-300/80">
            <span className="text-orange-500 shrink-0 mt-0.5">⚑</span>
            <span><strong>{r.type}:</strong> {r.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Duplicate Warning Badge ───────────────────────────────────────────────────

interface DuplicateWarningBadgeProps {
  type: "utr" | "screenshot" | "both";
}

export const DuplicateWarningBadge: React.FC<DuplicateWarningBadgeProps> = ({ type }) => {
  const labels = {
    utr: "Duplicate UTR",
    screenshot: "Duplicate Screenshot",
    both: "Duplicate UTR + Screenshot",
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-400">
      ⚠ {labels[type]}
    </span>
  );
};
