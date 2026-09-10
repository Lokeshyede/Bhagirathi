import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Brain, CheckCircle2, IndianRupee,
  Hash, ScanLine, Clock, FileText, AlertCircle,
} from "lucide-react";
import { useReconciliationDetail } from "../hooks/useReconciliation";
import { AISummaryPanel } from "../components/AISummaryPanel";
import { RuleBreakdownTable } from "../components/RuleBreakdownTable";
import { FraudAlertBadge } from "../components/FraudAlertBadge";
import type { MatchTimelineEvent } from "../hooks/useReconciliation";

// ─── Timeline Component ────────────────────────────────────────────────────────

function MatchTimeline({ events }: { events: MatchTimelineEvent[] }) {
  return (
    <div className="relative pl-4">
      {events.map((event, idx) => (
        <div key={idx} className="relative flex gap-4 pb-5 last:pb-0">
          {/* Connector line */}
          {idx < events.length - 1 && (
            <div className="absolute left-0 top-5 bottom-0 w-px bg-gray-200 dark:bg-gray-700" style={{ left: 11 }} />
          )}
          {/* Dot */}
          <div
            className={`relative z-10 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs
              ${event.status === "completed"
                ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/40"
                : event.status === "failed"
                ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/40"
                : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
              }`}
          >
            {event.status === "completed" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
            ) : event.status === "failed" ? (
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-gray-400" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.description}</p>
            {event.timestamp && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {new Date(event.timestamp).toLocaleString("en-IN", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Detail Field ─────────────────────────────────────────────────────────────

function DetailField({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm text-gray-900 dark:text-gray-100 ${mono ? "font-mono" : "font-medium"}`}>
        {value ?? <span className="text-gray-400">—</span>}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReconciliationDetailPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useReconciliationDetail(paymentId ?? null);

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <div className="h-10 w-48 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Reconciliation Data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
          This payment has not been reconciled yet. Run AI reconciliation from the dashboard first.
        </p>
        <button
          onClick={() => navigate("/payments/reconciliation")}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Reconciliation Dashboard
        </button>
      </div>
    );
  }

  const { payment, bank_transaction, rule_breakdown, match_timeline, ocr_result, fraud_flags } = data;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate("/payments/reconciliation")}
          className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
            <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Match Explanation</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {payment.tenant_name} · {payment.billing_month}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Fraud/Duplicate Alert */}
      {(data.is_fraud_flagged || data.is_duplicate) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FraudAlertBadge
            is_fraud_flagged={data.is_fraud_flagged}
            fraud_flags={fraud_flags}
            is_duplicate={data.is_duplicate}
            variant="card"
          />
        </motion.div>
      )}

      {/* AI Summary Panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <AISummaryPanel
          confidence_score={data.confidence_score}
          confidence_label={data.confidence_label}
          recommendation={data.recommendation}
          ai_summary={data.ai_summary}
          matched_rules={data.matched_rules}
          failed_rules={data.failed_rules}
          partial_rules={data.partial_rules}
        />
      </motion.div>

      {/* Two-column layout: Payment Info + Bank Info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Payment Details */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Submitted Payment</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Tenant" value={payment.tenant_name} />
            <DetailField label="Room" value={payment.room_number} />
            <DetailField label="Billing Month" value={payment.billing_month} />
            <DetailField label="Amount" value={`₹${(payment.submitted_amount ?? 0).toLocaleString("en-IN")}`} />
            <DetailField label="UTR" value={payment.submitted_utr} mono />
            <DetailField label="Payment Date" value={payment.payment_date} />
            <DetailField label="Reference" value={payment.payment_reference} mono />
            <DetailField label="Status" value={
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {payment.status}
              </span>
            } />
          </div>
        </div>

        {/* Matched Bank Transaction */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Matched Bank Transaction</h3>
          </div>
          {bank_transaction ? (
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Date" value={bank_transaction.transaction_date} />
              <DetailField label="Amount" value={`₹${(bank_transaction.amount ?? 0).toLocaleString("en-IN")}`} />
              <DetailField label="UTR" value={bank_transaction.utr} mono />
              <DetailField label="Sender Name" value={bank_transaction.sender_name} />
              <DetailField
                label="Account"
                value={bank_transaction.account_number_masked ?? "—"}
                mono
              />
              <DetailField label="Reference" value={bank_transaction.reference_number} mono />
              <div className="col-span-2">
                <DetailField label="Narration" value={bank_transaction.narration} />
              </div>
              <div className="col-span-2">
                <DetailField label="Statement File" value={bank_transaction.statement_file_name} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No matching bank transaction found.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Consider uploading or importing the bank statement.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Rule Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-4 w-4 text-violet-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Rule-by-Rule Score Breakdown</h3>
        </div>
        <RuleBreakdownTable rules={rule_breakdown} totalScore={data.confidence_score} />
      </motion.div>

      {/* OCR Result + Match Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* OCR Result */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">OCR Extraction Result</h3>
          </div>
          {ocr_result ? (
            <div className="space-y-3">
              {!ocr_result.ocr_available && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  PaddleOCR not available. Install paddlepaddle + paddleocr for screenshot analysis.
                </div>
              )}
              {ocr_result.ocr_available && ocr_result.low_confidence && (
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 px-3 py-2 text-xs text-orange-700 dark:text-orange-400">
                  OCR confidence is low — extracted data may be inaccurate.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-500">UTR</span><p className="font-mono font-medium">{ocr_result.utr ?? "—"}</p></div>
                <div><span className="text-gray-500">Amount</span><p className="font-mono font-medium">{ocr_result.amount ? `₹${ocr_result.amount.toLocaleString("en-IN")}` : "—"}</p></div>
                <div><span className="text-gray-500">Date</span><p className="font-medium">{ocr_result.date ?? "—"}</p></div>
                <div><span className="text-gray-500">Sender</span><p className="font-medium">{ocr_result.sender_name ?? "—"}</p></div>
                <div><span className="text-gray-500">Receiver UPI</span><p className="font-mono font-medium text-xs break-all">{ocr_result.receiver_upi ?? "—"}</p></div>
                <div><span className="text-gray-500">Confidence</span><p className="font-medium">{ocr_result.confidence != null ? `${(ocr_result.confidence * 100).toFixed(0)}%` : "—"}</p></div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <ScanLine className="h-7 w-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">No OCR data available.</p>
            </div>
          )}
        </div>

        {/* Match Timeline */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Match Timeline</h3>
          </div>
          {match_timeline && match_timeline.length > 0 ? (
            <MatchTimeline events={match_timeline} />
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">No timeline data.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReconciliationDetailPage;
