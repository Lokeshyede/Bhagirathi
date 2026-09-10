import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertCircle, ScanLine, Brain } from "lucide-react";
import { useComparisonPanel } from "../hooks/useVerification";
import { ConfidenceMeter } from "./ConfidenceMeter";
import type { ComparisonField } from "../hooks/useVerification";

interface ComparisonPanelProps {
  paymentId: string | null;
  onClose: () => void;
}

function MatchBadge({ status }: { status: ComparisonField["match_status"] }) {
  switch (status) {
    case "MATCHED":
      return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
    case "PARTIAL":
      return <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    case "MISMATCH":
      return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
    default:
      return <span className="h-4 w-4 rounded-full border-2 border-gray-400 flex-shrink-0 inline-block" />;
  }
}

function ComparisonRow({ field }: { field: ComparisonField }) {
  const rowBg =
    field.match_status === "MISMATCH"
      ? "bg-red-50/60 dark:bg-red-950/20"
      : field.match_status === "PARTIAL"
      ? "bg-amber-50/60 dark:bg-amber-950/20"
      : "";

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-3 py-2 rounded-lg ${rowBg}`}>
      {/* Tenant value */}
      <div className="text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{field.label}</p>
        <p className={`text-sm font-medium ${field.match_status === "MISMATCH" ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-100"}`}>
          {field.tenant_value ?? <span className="text-gray-400 italic">—</span>}
        </p>
      </div>

      {/* Match icon */}
      <div className="flex justify-center">
        <MatchBadge status={field.match_status} />
      </div>

      {/* Bank value */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">&nbsp;</p>
        <p className={`text-sm font-medium ${field.match_status === "MISMATCH" ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-100"}`}>
          {field.bank_value ?? <span className="text-gray-400 italic">—</span>}
        </p>
      </div>
    </div>
  );
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ paymentId, onClose }) => {
  const { data, isLoading } = useComparisonPanel(paymentId);

  return (
    <AnimatePresence>
      {paymentId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50/60 to-violet-50/60 dark:from-indigo-950/20 dark:to-violet-950/20 flex-shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-base">Payment Comparison</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tenant Submission vs Bank Statement</p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex flex-col gap-3 p-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  ))}
                </div>
              )}

              {data && (
                <div className="p-5 space-y-5">
                  {/* Confidence + Summary */}
                  {data.confidence_score !== null && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900">
                      <ConfidenceMeter
                        score={data.confidence_score ?? 0}
                        label={data.confidence_label ?? ""}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold uppercase tracking-wider mb-1">
                          AI Recommendation
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {data.recommendation}
                        </p>
                        {data.ai_summary && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-snug line-clamp-2">
                            {data.ai_summary}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 px-3">
                    <p className="text-xs font-semibold text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tenant Submission
                    </p>
                    <div />
                    <p className="text-xs font-semibold text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bank Statement
                    </p>
                  </div>

                  {/* Comparison rows */}
                  <div className="space-y-1">
                    {data.comparison_fields.map((field, i) => (
                      <ComparisonRow key={i} field={field} />
                    ))}
                  </div>

                  {/* Payment screenshot */}
                  {data.payment.proof_image_url && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Screenshot</p>
                      <img
                        src={data.payment.proof_image_url}
                        alt="Payment proof"
                        className="rounded-xl border border-gray-200 dark:border-gray-700 max-h-60 w-full object-contain bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  )}

                  {/* OCR Result */}
                  {data.ocr_result && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                      <div className="flex items-center gap-2 mb-3">
                        <ScanLine className="h-4 w-4 text-purple-500" />
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">OCR Extracted Data</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          ["UTR", data.ocr_result.utr],
                          ["Amount", data.ocr_result.amount ? `₹${Number(data.ocr_result.amount).toLocaleString("en-IN")}` : null],
                          ["Date", data.ocr_result.date],
                          ["Sender", data.ocr_result.sender_name],
                        ].map(([label, val]) => (
                          <div key={label as string}>
                            <span className="text-gray-500">{label}: </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{val ?? "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fraud/Duplicate alerts */}
                  {(data.is_fraud_flagged || data.is_duplicate) && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                        {data.is_duplicate ? "⚠️ Duplicate Payment Detected" : "🚨 Fraud Indicators"}
                      </p>
                      {data.fraud_flags.map((f, i) => (
                        <p key={i} className="text-xs text-red-600 dark:text-red-400">• {f}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isLoading && !data && (
                <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                  <Brain className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No comparison data available. Run AI reconciliation first.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
