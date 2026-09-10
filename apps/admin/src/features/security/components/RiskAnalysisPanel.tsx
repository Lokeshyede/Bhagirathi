import React, { useState } from "react";
import { RiskMeter } from "./RiskMeter";
import { RiskBadge } from "./RiskBadge";
import { SecurityTimeline } from "./SecurityTimeline";
import { SecurityHoldBanner, FraudAlertBanner, DuplicateWarningBadge } from "./SecurityAlerts";
import { OverrideDialog, ReleaseHoldDialog } from "./SecurityDialogs";
import { usePaymentSecurityDetail, useManualOverride, useReleaseHold, useReanalyzePayment } from "../hooks/useSecurityHooks";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

interface RiskAnalysisPanelProps {
  paymentId: string;
}

export const RiskAnalysisPanel: React.FC<RiskAnalysisPanelProps> = ({ paymentId }) => {
  const { data, isLoading, refetch } = usePaymentSecurityDetail(paymentId);
  const override = useManualOverride();
  const releaseHold = useReleaseHold();
  const reanalyze = useReanalyzePayment();

  const [showOverride, setShowOverride] = useState(false);
  const [showRelease, setShowRelease] = useState(false);
  const [showHash, setShowHash] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 animate-pulse space-y-4">
        <div className="h-4 w-32 bg-white/5 rounded" />
        <div className="h-24 w-24 bg-white/5 rounded-full mx-auto" />
        <div className="h-3 w-48 bg-white/5 rounded" />
        <div className="h-3 w-36 bg-white/5 rounded" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center text-slate-500 text-sm">
        No security data available for this payment.
      </div>
    );
  }

  const { payment, risk, reconciliation, security_events } = data;
  const hasDupUTR = security_events.some((e) => e.event_type === "DUPLICATE_UTR");
  const hasDupScreenshot = security_events.some((e) => e.event_type === "SCREENSHOT_REUSE");
  const dupType = hasDupUTR && hasDupScreenshot ? "both" : hasDupUTR ? "utr" : hasDupScreenshot ? "screenshot" : null;

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur overflow-hidden">
        {/* Risk header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-slate-400 font-medium">Fraud Investigation</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {payment.payment_reference ?? payment.id.slice(0, 16)}
              </p>
            </div>
            <button
              onClick={() => reanalyze.mutate(paymentId)}
              disabled={reanalyze.isPending}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Re-run security analysis"
            >
              <RefreshCw className={`h-4 w-4 ${reanalyze.isPending ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Risk meter */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mt-4 text-center sm:text-left">
            <RiskMeter score={risk.risk_score} size={100} />
            <div className="space-y-2 flex flex-col items-center sm:items-start">
              <div>
                <p className="text-xs text-slate-500">Risk Level</p>
                <RiskBadge level={risk.risk_level} score={risk.risk_score} size="lg" showScore />
              </div>
              {dupType && <DuplicateWarningBadge type={dupType} />}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Security Hold */}
          {risk.security_hold && (
            <SecurityHoldBanner
              paymentReference={payment.payment_reference}
              riskScore={risk.risk_score}
              riskLevel={risk.risk_level}
              securityNotes={risk.security_notes}
              manualOverrideReason={risk.manual_override_reason}
              onReleaseHold={() => setShowRelease(true)}
            />
          )}

          {/* Fraud flags */}
          {(reconciliation?.fraud_flags?.length || security_events.some((e) =>
            ["DUPLICATE_UTR", "SCREENSHOT_REUSE", "RULE_TRIGGERED", "FRAUD_DETECTED"].includes(e.event_type)
          )) && (
            <FraudAlertBanner
              flags={reconciliation?.fraud_flags ?? []}
              triggeredRules={security_events
                .filter((e) => ["DUPLICATE_UTR", "SCREENSHOT_REUSE", "RULE_TRIGGERED"].includes(e.event_type))
                .map((e) => ({ type: e.event_type, detail: e.description ?? "" }))}
            />
          )}

          {/* Triggered Rules */}
          {security_events.filter((e) => e.event_type === "RULE_TRIGGERED" || e.event_type === "DUPLICATE_UTR" || e.event_type === "SCREENSHOT_REUSE").length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Triggered Rules</p>
              <div className="space-y-1.5">
                {security_events
                  .filter((e) => ["RULE_TRIGGERED", "DUPLICATE_UTR", "SCREENSHOT_REUSE", "RATE_LIMIT_HIT"].includes(e.event_type))
                  .map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-amber-400">✓</span>
                      <span className="font-medium">{(e.event_type ?? "EVENT").replace(/_/g, " ")}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Screenshot hash */}
          {payment.screenshot_hash && (
            <div className="rounded-lg bg-white/3 border border-white/8 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-slate-400">Screenshot Hash</p>
                <button
                  onClick={() => setShowHash(!showHash)}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showHash ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {showHash ? (
                <p className="text-[10px] font-mono text-slate-500 break-all">{payment.screenshot_hash}</p>
              ) : (
                <p className="text-xs text-slate-500">SHA-256 • Click eye to reveal</p>
              )}
            </div>
          )}

          {/* AI Summary */}
          {reconciliation?.ai_summary && (
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-3">
              <p className="text-xs font-medium text-blue-400 mb-1">AI Summary</p>
              <p className="text-xs text-slate-400 leading-relaxed">{reconciliation.ai_summary}</p>
            </div>
          )}

          {/* Manual override action */}
          {!risk.security_hold && !risk.manual_override_reason && (
            <button
              onClick={() => setShowOverride(true)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 transition-colors cursor-pointer"
            >
              Override Security Warning
            </button>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-3">Security Timeline</p>
            <SecurityTimeline events={security_events} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <OverrideDialog
        isOpen={showOverride}
        onClose={() => setShowOverride(false)}
        paymentReference={payment.payment_reference}
        riskLevel={risk.risk_level}
        loading={override.isPending}
        onSubmit={(form) => {
          override.mutate(
            { payment_id: paymentId, reason: form.reason, remarks: form.remarks, confirm: true },
            { onSuccess: () => { setShowOverride(false); refetch(); } }
          );
        }}
      />

      <ReleaseHoldDialog
        isOpen={showRelease}
        onClose={() => setShowRelease(false)}
        paymentReference={payment.payment_reference}
        riskScore={risk.risk_score}
        loading={releaseHold.isPending}
        onSubmit={(form) => {
          releaseHold.mutate(
            { payment_id: paymentId, override_reason: form.override_reason, confirm: true },
            { onSuccess: () => { setShowRelease(false); refetch(); } }
          );
        }}
      />
    </>
  );
};
