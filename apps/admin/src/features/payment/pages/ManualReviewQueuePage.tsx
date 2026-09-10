import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, ArrowLeft, Eye, Brain,
  AlertCircle, RefreshCw, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useManualReviewQueue } from "../hooks/useReconciliation";
import { FraudAlertBadge } from "../components/FraudAlertBadge";
import { ConfidenceMeter } from "../components/ConfidenceMeter";

const LIMIT = 20;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const ManualReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const skip = page * LIMIT;

  const { data, isLoading, isFetching, refetch } = useManualReviewQueue(skip, LIMIT);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/payments/reconciliation")}
            className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manual Review Queue</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Payments with AI confidence below 75% · Requires human review
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <span className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm font-semibold border border-red-200 dark:border-red-900">
              {data.total} payment{data.total !== 1 ? "s" : ""} pending
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900"
      >
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          These payments could not be automatically matched with high confidence.
          Review each payment against the bank statement before taking action.
          <strong className="ml-1">Do NOT verify without manual investigation.</strong>
        </p>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!data || data.total === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Manual Review Queue is Empty
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            All reconciled payments have sufficient AI confidence scores. No manual review required.
          </p>
        </motion.div>
      )}

      {/* Queue Items */}
      {!isLoading && data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((item, idx) => (
            <motion.div
              key={item.log_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`rounded-2xl border bg-white dark:bg-gray-900 overflow-hidden transition-all hover:shadow-md
                ${item.is_fraud_flagged
                  ? "border-red-300 dark:border-red-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            >
              <div className="p-4 flex flex-wrap items-start gap-4">
                {/* Confidence Meter */}
                <div className="flex-shrink-0">
                  <ConfidenceMeter
                    score={item.confidence_score}
                    label={item.confidence_label}
                    size="sm"
                  />
                </div>

                {/* Payment Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {item.tenant_name}
                    </h3>
                    {item.is_fraud_flagged && (
                      <FraudAlertBadge
                        is_fraud_flagged={item.is_fraud_flagged}
                        fraud_flags={[]}
                        variant="inline"
                      />
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                      <XCircle className="h-3 w-3 mr-1" />
                      {item.recommendation}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Room {item.room_number}</span>
                    <span>·</span>
                    <span>{item.billing_month}</span>
                    <span>·</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      ₹{(item.submitted_amount ?? 0).toLocaleString("en-IN")}
                    </span>
                    {item.submitted_utr && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{item.submitted_utr}</span>
                      </>
                    )}
                  </div>

                  {/* AI Summary */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug line-clamp-2 mt-1">
                    {item.ai_summary}
                  </p>

                  {/* Failed rules pills */}
                  {item.failed_rules.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.failed_rules.slice(0, 4).map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 rounded text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
                        >
                          ✗ {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(item.reconciled_at)}
                  </span>
                  <button
                    onClick={() => navigate(`/payments/reconciliation/${item.payment_id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900 hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View XAI Detail
                  </button>
                  <button
                    onClick={() => navigate(`/payments/${item.payment_id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    View Payment
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ManualReviewQueuePage;
