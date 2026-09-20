import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, Play, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Copy, ShieldAlert, FileBarChart2, TrendingUp, Clock,
  Download, ChevronRight, Banknote,
} from "lucide-react";
import {
  useReconciliationReport,
  useRunReconciliation,
  type ReconciliationReport,
} from "../hooks/useReconciliation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

function SummaryCard({ title, value, icon, color, subtitle, onClick }: SummaryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{subtitle}</p>}
        </div>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      {onClick && (
        <ChevronRight className="absolute right-4 bottom-4 h-4 w-4 text-gray-400" />
      )}
    </motion.div>
  );
}

// ─── Confidence Bar Chart ─────────────────────────────────────────────────────

function ConfidenceChart({ data }: { data: ReconciliationReport["confidence_distribution"] }) {
  const total = data.very_high + data.high + data.low + data.unprocessed;
  const bars = [
    { label: "95–100%", value: data.very_high, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400", emoji: "🟢" },
    { label: "75–94%", value: data.high, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", emoji: "🟡" },
    { label: "<75%", value: data.low, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400", emoji: "🔴" },
    { label: "Unprocessed", value: data.unprocessed, color: "bg-gray-300 dark:bg-gray-600", textColor: "text-gray-500 dark:text-gray-400", emoji: "⚪" },
  ];

  return (
    <div className="space-y-3">
      {bars.map((bar) => {
        const pct = total > 0 ? Math.round((bar.value / total) * 100) : 0;
        return (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="text-xs w-4">{bar.emoji}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-24 shrink-0">{bar.label}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className={`h-full rounded-full ${bar.color}`}
              />
            </div>
            <span className={`text-xs font-semibold w-12 text-right ${bar.textColor}`}>
              {bar.value} <span className="text-gray-400 font-normal">({pct}%)</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReconciliationDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: report, isLoading, refetch, isFetching } = useReconciliationReport();
  const runReconciliation = useRunReconciliation();

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const result = await runReconciliation.mutateAsync({});
      setRunResult({ message: result.message, type: "success" });
      // Poll the report after a few seconds
      setTimeout(() => refetch(), 4000);
      setTimeout(() => refetch(), 10000);
    } catch (err: any) {
      setRunResult({
        message: err?.response?.data?.detail ?? "Failed to start reconciliation.",
        type: "error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Submitted Payments", report.total_submitted_payments],
      ["Total Bank Transactions", report.total_bank_transactions],
      ["Reconciled Count", report.reconciled_count],
      ["Matched", report.matched_count],
      ["Unmatched", report.unmatched_count],
      ["Duplicates", report.duplicate_count],
      ["Fraud Flagged", report.fraud_flagged_count],
      ["Manual Review Required", report.manual_review_count],
      ["Ready to Verify", report.ready_to_verify_count],
      ["Needs Review", report.needs_review_count],
      ["Confidence ≥95% (Very High)", report.confidence_distribution.very_high],
      ["Confidence 75–94% (High)", report.confidence_distribution.high],
      ["Confidence <75% (Low)", report.confidence_distribution.low],
      ["Unprocessed", report.confidence_distribution.unprocessed],
      ["Last Reconciled At", report.last_reconciled_at ?? "Never"],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Reconciliation</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Smart payment matching · Explainable AI · Confidence scoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={!report}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-60"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run AI Reconciliation
          </motion.button>
        </div>
      </motion.div>

      {/* Run result banner */}
      {runResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            runResult.type === "success"
              ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900"
              : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900"
          }`}
        >
          {runResult.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {runResult.message}
          {runResult.type === "success" && (
            <span className="ml-1 text-xs opacity-70">Results will update in a few moments…</span>
          )}
        </motion.div>
      )}

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <SummaryCard
            title="Submitted Payments"
            value={report?.total_submitted_payments ?? 0}
            icon={<Banknote className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            color="bg-indigo-50 dark:bg-indigo-950/40"
          />
          <SummaryCard
            title="Bank Transactions"
            value={report?.total_bank_transactions ?? 0}
            icon={<FileBarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            color="bg-blue-50 dark:bg-blue-950/40"
          />
          <SummaryCard
            title="Ready to Verify"
            value={report?.ready_to_verify_count ?? 0}
            icon={<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />}
            color="bg-green-50 dark:bg-green-950/40"
            subtitle="≥95% confidence"
          />
          <SummaryCard
            title="Needs Review"
            value={report?.needs_review_count ?? 0}
            icon={<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            color="bg-amber-50 dark:bg-amber-950/40"
            subtitle="75–94% confidence"
          />
          <SummaryCard
            title="Manual Review Queue"
            value={report?.manual_review_count ?? 0}
            icon={<Clock className="h-5 w-5 text-red-600 dark:text-red-400" />}
            color="bg-red-50 dark:bg-red-950/40"
            subtitle="<75% confidence"
            onClick={() => navigate("/payments/manual-review")}
          />
          <SummaryCard
            title="Duplicates"
            value={report?.duplicate_count ?? 0}
            icon={<Copy className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
            color="bg-orange-50 dark:bg-orange-950/40"
          />
          <SummaryCard
            title="Fraud Alerts"
            value={report?.fraud_flagged_count ?? 0}
            icon={<ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />}
            color="bg-red-50 dark:bg-red-950/40"
          />
          <SummaryCard
            title="Unmatched"
            value={report?.unmatched_count ?? 0}
            icon={<XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
            color="bg-gray-50 dark:bg-gray-800"
          />
        </motion.div>
      )}

      {/* Confidence Distribution + Stats */}
      {!isLoading && report && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Confidence Distribution Chart */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Confidence Distribution</h3>
            </div>
            <ConfidenceChart data={report.confidence_distribution} />
          </div>

          {/* Reconciliation Stats */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-4 w-4 text-violet-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Reconciliation Summary</h3>
            </div>
            <div className="space-y-3">
              <StatRow label="Total Reconciled" value={`${report.reconciled_count} / ${report.total_submitted_payments}`} color="text-indigo-600 dark:text-indigo-400" />
              <StatRow label="Matched to Bank" value={report.matched_count} color="text-green-600 dark:text-green-400" />
              <StatRow label="Unmatched" value={report.unmatched_count} color="text-gray-600 dark:text-gray-400" />
              <StatRow label="Duplicates Detected" value={report.duplicate_count} color="text-orange-600 dark:text-orange-400" />
              <StatRow label="Fraud Flagged" value={report.fraud_flagged_count} color="text-red-600 dark:text-red-400" />
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                <StatRow
                  label="Last Reconciled"
                  value={formatDate(report.last_reconciled_at)}
                  color="text-gray-500 dark:text-gray-400"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && report?.reconciled_count === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="h-16 w-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reconciliation data yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Click <strong>Run AI Reconciliation</strong> to match submitted payments against imported bank statement transactions.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Play className="h-4 w-4" />
            Run AI Reconciliation
          </motion.button>
        </motion.div>
      )}

      {/* Navigate to Manual Review */}
      {!isLoading && (report?.manual_review_count ?? 0) > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => navigate("/payments/manual-review")}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-red-500" />
            <div className="text-left">
              <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                {report?.manual_review_count} payment(s) in Manual Review Queue
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                These payments have AI confidence below 75% and require human review.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-red-400" />
        </motion.button>
      )}
    </div>
  );
};

function StatRow({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

export default ReconciliationDashboardPage;
