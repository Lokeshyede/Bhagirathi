import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, Eye, Brain, CheckCircle2, XCircle,
  RotateCcw, Copy, GitCompare,
} from "lucide-react";
import { useHostels, useBuildings } from "../../hostel/hooks/api/useHostel";
import {
  useVerificationQueue,
  useVerifySelected,
  useBulkReject,
  useMoveToManualReview,
  useUndoVerification,
} from "../hooks/useVerification";
import { BulkActionToolbar } from "../components/BulkActionToolbar";
import { ComparisonPanel } from "../components/ComparisonPanel";
import { RejectDialog } from "../components/RejectDialog";
import { UndoVerificationDialog } from "../components/UndoVerificationDialog";
import { FraudAlertBadge } from "../components/FraudAlertBadge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ConfidenceBadge({ score }: { score: number | null; label?: string | null }) {
  if (score === null || score === undefined)
    return <span className="text-xs text-gray-400">—</span>;

  const color =
    score >= 95
      ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900"
      : score >= 75
      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";

  const emoji = score >= 95 ? "🟢" : score >= 75 ? "🟡" : "🔴";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {emoji} {score.toFixed(0)}%
    </span>
  );
}

function RecommendationBadge({ rec }: { rec: string | null }) {
  if (!rec) return <span className="text-xs text-gray-400">—</span>;

  const configs: Record<string, string> = {
    "Ready to Verify": "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
    "Needs Review": "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    "Manual Verification Required": "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
    "Possible Fraud": "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800",
    "Duplicate": "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900",
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${configs[rec] ?? "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"}`}>
      {rec}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Verified": "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
    "Rejected": "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
    "Under Review": "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    "Submitted": "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900",
    "Manual Review": "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    "Clarification Requested": "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-gray-50 dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700"}`}>
      {status}
    </span>
  );
}

// ─── Toast-style result message ───────────────────────────────────────────────

function ResultBanner({ result, onDismiss }: { result: { message: string; type: "success" | "error" }; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
        result.type === "success"
          ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900"
          : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
      }`}
    >
      <div className="flex items-center gap-2">
        {result.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        {result.message}
      </div>
      <button onClick={onDismiss} className="text-current opacity-60 hover:opacity-100">✕</button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VerificationQueuePage: React.FC<{ initialStatus?: string }> = ({ initialStatus = "ALL" }) => {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [hostelId, setHostelId] = useState("ALL");
  const [buildingId, setBuildingId] = useState("ALL");
  const [aiFilter, setAiFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog state
  const [comparisonPaymentId, setComparisonPaymentId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showUndoDialog, setShowUndoDialog] = useState(false);
  const [undoTarget, setUndoTarget] = useState<{ id: string; name: string } | null>(null);

  // Result banner
  const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Data
  const { data: hostels } = useHostels();
  useBuildings(hostelId !== "ALL" ? hostelId : undefined);
  const { data, isLoading, refetch, isFetching } = useVerificationQueue({
    search,
    hostel_id: hostelId,
    building_id: buildingId,
    ai_filter: aiFilter !== "ALL" ? aiFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    limit: 200,
  });

  const payments = data?.items ?? [];

  // Mutations
  const verifySelected = useVerifySelected();
  const bulkReject = useBulkReject();
  const moveToManual = useMoveToManualReview();
  const undoVerify = useUndoVerification();

  // ─── Selection handlers ───────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === payments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(payments.map((p) => p.id.toString())));
    }
  }, [payments, selectedIds.size]);

  const deselectAll = () => setSelectedIds(new Set());

  // ─── Bulk action handlers ─────────────────────────────────────────────────

  const handleVerifySelected = async () => {
    try {
      const res = await verifySelected.mutateAsync({ payment_ids: Array.from(selectedIds) });
      setResult({ message: res.message, type: "success" });
      setSelectedIds(new Set());
    } catch (e: any) {
      setResult({ message: e?.response?.data?.detail ?? "Verification failed.", type: "error" });
    }
  };

  const handleBulkReject = async (reason: string, remarks?: string) => {
    const res = await bulkReject.mutateAsync({
      payment_ids: Array.from(selectedIds),
      reason,
      remarks,
    });
    setResult({ message: res.message, type: "success" });
    setSelectedIds(new Set());
  };

  const handleMoveToManual = async () => {
    const res = await moveToManual.mutateAsync({
      payment_ids: Array.from(selectedIds),
      reason: "Manually moved to review queue by admin.",
    });
    setResult({ message: res.message, type: "success" });
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const selected = payments.filter((p) => selectedIds.has(p.id.toString()));
    const rows = [
      ["Tenant", "Room", "Billing Month", "Amount", "Submitted UTR", "Bank UTR", "Confidence", "Recommendation", "Status"],
      ...selected.map((p) => [
        p.tenant_name, p.room_number, p.billing_month,
        p.total_amount, p.submitted_utr ?? "", p.bank_utr ?? "",
        p.confidence_score?.toFixed(0) ?? "", p.recommendation ?? "", p.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUndoVerification = async (reason?: string) => {
    if (!undoTarget) return;
    await undoVerify.mutateAsync({ payment_id: undoTarget.id, reason });
    setResult({ message: `Verification undone for ${undoTarget.name}.`, type: "success" });
    setUndoTarget(null);
  };

  const allSelected = payments.length > 0 && selectedIds.size === payments.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < payments.length;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Verification Queue</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {data?.total ?? 0} payments · Multi-select + bulk actions enabled
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Result Banner */}
      <AnimatePresence>
        {result && <ResultBanner result={result} onDismiss={() => setResult(null)} />}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant, UTR, room…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Manual Review">Manual Review</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Clarification Requested">Clarification</option>
          </select>

          {/* AI filter */}
          <select
            value={aiFilter}
            onChange={(e) => setAiFilter(e.target.value)}
            className="flex-1 sm:flex-none text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="ALL">All AI Scores</option>
            <option value="ai_ready">🟢 AI Ready (≥95%)</option>
            <option value="needs_review">🟡 Needs Review (75–94%)</option>
            <option value="manual">🔴 Manual Required (&lt;75%)</option>
          </select>

          {/* Hostel filter */}
          <select
            value={hostelId}
            onChange={(e) => { setHostelId(e.target.value); setBuildingId("ALL"); }}
            className="flex-1 sm:flex-none text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="ALL">All Hostels</option>
            {hostels?.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                {/* Select all checkbox */}
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Tenant</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap hidden md:table-cell">Room</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap hidden lg:table-cell">Month</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Amount</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap hidden md:table-cell">Submitted UTR</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap hidden lg:table-cell">Bank UTR</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Confidence</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap hidden xl:table-cell">Recommendation</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 11 }).map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}

              {!isLoading && payments.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No payments found</p>
                      <p className="text-xs text-gray-400">Try changing your filters</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && payments.map((payment) => {
                const pid = payment.id.toString();
                const isSelected = selectedIds.has(pid);
                const isVerified = payment.status === "Verified";

                return (
                  <motion.tr
                    key={pid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 ${isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(pid)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    {/* Tenant */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{payment.tenant_name}</p>
                        {payment.is_fraud_flagged && (
                          <FraudAlertBadge is_fraud_flagged={true} fraud_flags={[]} variant="inline" />
                        )}
                        {payment.is_duplicate && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                            <Copy className="h-3 w-3" /> Dup
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{payment.hostel_name}</p>
                      {/* Mobile-only: show room and UTR since those columns are hidden */}
                      <div className="md:hidden mt-0.5 space-y-0.5">
                        {payment.room_number && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Room {payment.room_number}
                            {payment.building_name && <span className="text-gray-400"> · {payment.building_name}</span>}
                          </p>
                        )}
                        {payment.submitted_utr && (
                          <p className="text-[10px] font-mono text-gray-600 dark:text-gray-300">
                            UTR: {payment.submitted_utr}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Room */}
                    <td className="px-3 py-3 align-middle hidden md:table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{payment.room_number}</p>
                      <p className="text-xs text-gray-500">{payment.building_name}</p>
                    </td>

                    {/* Month */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{payment.billing_month}</p>
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-3 align-middle text-right">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        ₹{payment.total_amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-500">
                        R:{payment.rent_share.toFixed(0)} + E:{payment.electricity_share.toFixed(0)}
                      </p>
                    </td>

                    {/* Submitted UTR */}
                    <td className="px-3 py-3 align-middle hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {payment.submitted_utr ?? "—"}
                      </span>
                    </td>

                    {/* Bank UTR */}
                    <td className="px-3 py-3 align-middle hidden lg:table-cell">
                      <span className={`font-mono text-xs ${
                        payment.bank_utr
                          ? payment.bank_utr === payment.submitted_utr
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                          : "text-gray-400"
                      }`}>
                        {payment.bank_utr ?? "—"}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="px-3 py-3 align-middle text-center">
                      <ConfidenceBadge score={payment.confidence_score} label={payment.confidence_label} />
                    </td>

                    {/* Recommendation */}
                    <td className="px-3 py-3 align-middle hidden xl:table-cell">
                      <RecommendationBadge rec={payment.recommendation} />
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 align-middle">
                      <StatusBadge status={payment.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        {/* View detail */}
                        <button
                          onClick={() => navigate(`/payments/${pid}`)}
                          title="View Details"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Comparison panel */}
                        <button
                          onClick={() => setComparisonPaymentId(pid)}
                          title="Compare with Bank Statement"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                        >
                          <GitCompare className="h-3.5 w-3.5" />
                        </button>

                        {/* AI detail */}
                        <button
                          onClick={() => navigate(`/payments/reconciliation/${pid}`)}
                          title="View AI Explanation"
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                        >
                          <Brain className="h-3.5 w-3.5" />
                        </button>

                        {/* Undo for verified */}
                        {isVerified && (
                          <button
                            onClick={() => { setUndoTarget({ id: pid, name: payment.tenant_name }); setShowUndoDialog(true); }}
                            title="Undo Verification"
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!isLoading && payments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedIds.size > 0
                ? `${selectedIds.size} of ${payments.length} selected`
                : `${payments.length} payments`}
            </p>
            {selectedIds.size > 0 && (
              <button
                onClick={deselectAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Deselect all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.size}
        onVerify={handleVerifySelected}
        onReject={() => setShowRejectDialog(true)}
        onManualReview={handleMoveToManual}
        onExport={handleExport}
        onDeselect={deselectAll}
        isVerifying={verifySelected.isPending}
        isRejecting={bulkReject.isPending}
        isMoving={moveToManual.isPending}
      />

      {/* Comparison Panel slide-over */}
      <ComparisonPanel
        paymentId={comparisonPaymentId}
        onClose={() => setComparisonPaymentId(null)}
      />

      {/* Reject Dialog */}
      <RejectDialog
        isOpen={showRejectDialog}
        selectedCount={selectedIds.size}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleBulkReject}
      />

      {/* Undo Verification Dialog */}
      <UndoVerificationDialog
        isOpen={showUndoDialog}
        paymentId={undoTarget?.id ?? null}
        tenantName={undoTarget?.name}
        onClose={() => { setShowUndoDialog(false); setUndoTarget(null); }}
        onConfirm={handleUndoVerification}
      />
    </div>
  );
};

export { VerificationQueuePage };
export default VerificationQueuePage;
