import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload, FileText, Loader2, AlertCircle, CheckCircle2,
  Clock, XCircle, Trash2, Eye, Building2, Calendar
} from "lucide-react";
import { useBankStatements, useDeleteBankStatement, type BankStatement } from "../hooks/useBankStatement";
import { StatementUploadDialog } from "../components/StatementUploadDialog";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  UPLOADING: {
    label: "Uploading",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    classes: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40",
  },
  PROCESSING: {
    label: "Processing",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    classes: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    classes: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/40",
  },
  FAILED: {
    label: "Failed",
    icon: <XCircle className="h-3 w-3" />,
    classes: "text-danger bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <Clock className="h-3 w-3" />,
    classes: "text-muted bg-gray-100 dark:bg-gray-800 border-border dark:border-gray-700",
  },
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const StatementCard: React.FC<{
  statement: BankStatement;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}> = ({ statement, onView, onDelete, isDeleting }) => {
  const status = STATUS_CONFIG[statement.import_status] ?? STATUS_CONFIG.PROCESSING;
  const isProcessing = ["UPLOADING", "PROCESSING"].includes(statement.import_status);
  const ext = statement.file_type?.toUpperCase() ?? "FILE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* File type icon */}
        <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex flex-col items-center justify-center ${
          ext === "PDF" ? "bg-red-50 dark:bg-red-950/30" :
          ext === "CSV" ? "bg-green-50 dark:bg-green-950/30" :
          "bg-blue-50 dark:bg-blue-950/30"
        }`}>
          <FileText className={`h-5 w-5 ${
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-primaryText dark:text-gray-100 truncate max-w-xs">
                {statement.file_name ?? "statement"}
              </h3>
              <p className="text-xs text-muted font-semibold mt-0.5">
                {statement.bank_name ?? "Unknown Bank"} · {formatFileSize(statement.file_size)}
              </p>
            </div>
            {/* Status badge */}
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${status.classes}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Metrics row */}
          {statement.import_status === "COMPLETED" && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
              <div className="text-left">
                <p className="text-sm font-black text-primaryText dark:text-gray-100">
                  {statement.total_transactions.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Transactions</p>
              </div>
              <div className="h-8 w-px bg-border dark:bg-gray-800 hidden xs:block" />
              <div className="text-left">
                <p className="text-sm font-black text-green-700 dark:text-green-400">
                  {formatCurrency(statement.total_credits)}
                </p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Credits</p>
              </div>
              <div className="h-8 w-px bg-border dark:bg-gray-800 hidden xs:block" />
              <div className="text-left">
                <p className="text-sm font-black text-danger">
                  {formatCurrency(statement.total_debits)}
                </p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Debits</p>
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="mt-3 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-primary to-indigo-400 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" />
            </div>
          )}

          {/* Error */}
          {statement.import_status === "FAILED" && statement.parsing_error && (
            <div className="mt-2 flex items-start gap-1.5 text-danger">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <p className="text-[10px] font-semibold line-clamp-2">{statement.parsing_error}</p>
            </div>
          )}

          {/* Footer row */}
          <div className="flex flex-wrap gap-2 items-center justify-between mt-3 pt-3 border-t border-border/60 dark:border-gray-800/60">
            <div className="flex items-center gap-1.5 text-[10px] text-muted font-semibold">
              <Calendar className="h-3 w-3" />
              {formatDate(statement.created_at)}
              {statement.uploader_name && (
                <span className="ml-1">· {statement.uploader_name}</span>
              )}
            </div>

            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              {statement.import_status === "COMPLETED" && (
                <button
                  onClick={onView}
                  className="flex items-center gap-1 h-7 px-3 text-[10px] font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition cursor-pointer"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              )}
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 h-7 px-3 text-[10px] font-bold text-danger border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/20 transition cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BankStatementPage: React.FC = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useBankStatements(0, 50);
  const deleteMutation = useDeleteBankStatement();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bank statement? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadSuccess = (statementId: string) => {
    refetch();
    navigate(`/payments/bank-statements/${statementId}`);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-primaryText dark:text-gray-100 tracking-tight">
            Bank Statement Import
          </h1>
          <p className="text-xs text-muted font-medium mt-1">
            Upload CSV, Excel, or PDF bank statements to extract and preview transactions.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition shadow-sm cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Upload Statement
        </button>
      </div>

      {/* ── Stats Summary ───────────────────────────────────────── */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Uploaded", value: data.total },
            { label: "Completed", value: data.statements.filter(s => s.import_status === "COMPLETED").length },
            { label: "Processing", value: data.statements.filter(s => ["UPLOADING", "PROCESSING"].includes(s.import_status)).length },
            { label: "Failed", value: data.statements.filter(s => s.import_status === "FAILED").length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-primaryText dark:text-gray-100">{stat.value}</p>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wide mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Statements List ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle className="h-10 w-10 text-danger" />
          <p className="text-sm font-bold text-danger">Failed to load statements.</p>
          <button onClick={() => refetch()} className="text-xs font-bold text-primary hover:underline cursor-pointer">Retry</button>
        </div>
      ) : !data?.statements.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl">
          <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800">
            <Building2 className="h-10 w-10 text-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-primaryText dark:text-gray-200">No statements uploaded yet</p>
            <p className="text-xs text-muted mt-1 font-medium">Upload your first bank statement to get started.</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Statement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.statements.map((stmt) => (
            <StatementCard
              key={stmt.id}
              statement={stmt}
              onView={() => navigate(`/payments/bank-statements/${stmt.id}`)}
              onDelete={() => handleDelete(stmt.id)}
              isDeleting={deletingId === stmt.id}
            />
          ))}
        </div>
      )}

      {/* ── Upload Dialog ───────────────────────────────────────── */}
      <StatementUploadDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default BankStatementPage;
