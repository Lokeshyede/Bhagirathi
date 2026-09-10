import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, FileText, Building2, Calendar, User2,
  Loader2, AlertCircle, CheckCircle2, XCircle, RefreshCw
} from "lucide-react";
import { useBankStatement } from "../hooks/useBankStatement";
import { StatementSummaryCards } from "../components/StatementSummaryCards";
import { TransactionsTable } from "../components/TransactionsTable";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  UPLOADING: {
    label: "Uploading",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    classes: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40",
  },
  PROCESSING: {
    label: "Parsing & Extracting",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    classes: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
  },
  COMPLETED: {
    label: "Import Complete",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    classes: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/40",
  },
  FAILED: {
    label: "Parsing Failed",
    icon: <XCircle className="h-3.5 w-3.5" />,
    classes: "text-danger bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const StatementPreviewPage: React.FC = () => {
  const { statementId } = useParams<{ statementId: string }>();
  const navigate = useNavigate();

  const { data: preview, isLoading, isError, refetch } = useBankStatement(statementId ?? null);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-28 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-danger" />
        <p className="text-sm font-bold text-danger">Statement not found or failed to load.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="text-xs font-bold text-muted hover:text-primaryText cursor-pointer">
            ← Go back
          </button>
          <button onClick={() => refetch()} className="flex items-center gap-1 text-xs font-bold text-primary cursor-pointer">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { statement } = preview;
  const statusCfg = STATUS_CONFIG[statement.import_status] ?? STATUS_CONFIG.PROCESSING;
  const isProcessing = ["UPLOADING", "PROCESSING"].includes(statement.import_status);
  const ext = statement.file_type?.toUpperCase() ?? "FILE";

  return (
    <div className="space-y-6">
      {/* ── Back navigation ──────────────────────────────────────── */}
      <button
        onClick={() => navigate("/payments/bank-statements")}
        className="flex items-center gap-2 text-xs font-bold text-muted hover:text-primaryText dark:hover:text-gray-200 transition cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Bank Statements
      </button>

      {/* ── Statement header card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* File icon */}
          <div className={`h-14 w-14 flex-shrink-0 rounded-xl flex flex-col items-center justify-center ${
            ext === "PDF" ? "bg-red-50 dark:bg-red-950/30" :
            ext === "CSV" ? "bg-green-50 dark:bg-green-950/30" :
            "bg-blue-50 dark:bg-blue-950/30"
          }`}>
            <FileText className={`h-6 w-6 ${
              ext === "PDF" ? "text-red-500" :
              ext === "CSV" ? "text-green-600" :
              "text-blue-600"
            }`} />
            <span className={`text-[9px] font-black mt-0.5 ${
              ext === "PDF" ? "text-red-400" :
              ext === "CSV" ? "text-green-500" :
              "text-blue-500"
            }`}>{ext}</span>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-lg font-black text-primaryText dark:text-gray-100 tracking-tight">
                {statement.file_name ?? "Bank Statement"}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusCfg.classes}`}>
                {statusCfg.icon}
                {statusCfg.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-5 text-xs font-semibold text-muted">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {statement.bank_name ?? "Unknown Bank"}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {formatFileSize(statement.file_size)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(statement.created_at)}
              </span>
              {statement.uploader_name && (
                <span className="flex items-center gap-1.5">
                  <User2 className="h-3.5 w-3.5" />
                  {statement.uploader_name}
                </span>
              )}
            </div>

            {/* Processing bar */}
            {isProcessing && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Parsing and extracting transactions in the background...
                </p>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Error message */}
            {statement.import_status === "FAILED" && statement.parsing_error && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg">
                <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-danger">Parsing Error</p>
                  <p className="text-xs font-medium text-danger/80 mt-0.5">{statement.parsing_error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Only show metrics + table if COMPLETED ───────────────── */}
      {statement.import_status === "COMPLETED" && (
        <>
          {/* Summary cards */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatementSummaryCards preview={preview} />
          </motion.div>

          {/* Transactions table */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-primaryText dark:text-gray-100 uppercase tracking-wide">
                Extracted Transactions
              </h2>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primaryText dark:hover:text-gray-200 transition cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
            <TransactionsTable statementId={statement.id} />
          </motion.div>
        </>
      )}

      {/* ── Still processing placeholder ─────────────────────────── */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-black text-primaryText dark:text-gray-200">Extracting transactions...</p>
            <p className="text-xs text-muted mt-1 font-medium">
              This page will auto-refresh when processing completes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementPreviewPage;
