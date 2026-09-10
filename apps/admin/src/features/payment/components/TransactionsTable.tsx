import React, { useState } from "react";
import { Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, AlertTriangle, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import type { StatementTransaction, TransactionFilters } from "../hooks/useBankStatement";
import { useBankStatementTransactions } from "../hooks/useBankStatement";

interface TransactionsTableProps {
  statementId: string;
}

const VALIDATION_BADGE: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  VALID: {
    label: "Valid",
    classes: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/40",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  INVALID: {
    label: "Invalid",
    classes: "text-danger bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  WARNING: {
    label: "Warning",
    classes: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ statementId }) => {
  const [filters, setFilters] = useState<TransactionFilters>({ limit: 50, skip: 0 });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useBankStatementTransactions(statementId, filters);

  const totalPages = data ? Math.ceil(data.total / (filters.limit ?? 50)) : 0;
  const currentPage = Math.floor((filters.skip ?? 0) / (filters.limit ?? 50)) + 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, skip: 0 }));
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, skip: 0 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, skip: (page - 1) * (prev.limit ?? 50) }));
  };

  return (
    <div className="space-y-4">
      {/* ── Filters Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search UTR, reference, narration, sender..."
              className="w-full pl-9 pr-4 h-9 text-xs font-medium bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-800 rounded-lg text-primaryText dark:text-gray-200 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Type filter */}
        <select
          value={filters.transaction_type || ""}
          onChange={(e) => handleFilterChange("transaction_type", e.target.value)}
          className="h-9 px-3 text-xs font-bold bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-800 rounded-lg text-primaryText dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition"
        >
          <option value="">All Types</option>
          <option value="CREDIT">Credits</option>
          <option value="DEBIT">Debits</option>
        </select>

        {/* Validation status filter */}
        <select
          value={filters.validation_status || ""}
          onChange={(e) => handleFilterChange("validation_status", e.target.value)}
          className="h-9 px-3 text-xs font-bold bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-800 rounded-lg text-primaryText dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition"
        >
          <option value="">All Status</option>
          <option value="VALID">Valid</option>
          <option value="INVALID">Invalid</option>
          <option value="WARNING">Warning</option>
        </select>

        {/* Duplicates filter */}
        <button
          onClick={() => handleFilterChange("is_duplicate", filters.is_duplicate === true ? undefined : true)}
          className={`h-9 px-3 text-xs font-bold border rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            filters.is_duplicate
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-50 dark:bg-gray-950 border-border dark:border-gray-800 text-muted hover:border-primary/50"
          }`}
        >
          <Copy className="h-3 w-3" />
          Duplicates Only
        </button>

        {/* Clear filters */}
        {(filters.search || filters.transaction_type || filters.validation_status || filters.is_duplicate) && (
          <button
            onClick={() => {
              setFilters({ limit: 50, skip: 0 });
              setSearchInput("");
            }}
            className="h-9 px-3 text-xs font-bold text-danger border border-red-200 dark:border-red-900/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
        {/* Count bar */}
        <div className="px-5 py-3 border-b border-border dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between">
          <span className="text-xs font-bold text-muted">
            {isLoading ? "Loading..." : `${(data?.total ?? 0).toLocaleString("en-IN")} transactions`}
          </span>
          {data && data.total > (filters.limit ?? 50) && (
            <span className="text-xs font-bold text-muted">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border dark:border-gray-800">
                {["Date", "Time", "Type", "Amount", "UTR", "Reference", "Narration", "Sender", "Receiver", "Balance", "Status"].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50 dark:border-gray-800/50 animate-pulse">
                    {Array.from({ length: 11 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-xs font-bold text-danger">
                    Failed to load transactions. Please try again.
                  </td>
                </tr>
              ) : !data?.transactions.length ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-xs font-bold text-muted">
                    No transactions match the current filters.
                  </td>
                </tr>
              ) : (
                data.transactions.map((txn: StatementTransaction) => {
                  const badge = VALIDATION_BADGE[txn.validation_status] ?? VALIDATION_BADGE.VALID;
                  return (
                    <tr
                      key={txn.id}
                      className={`border-b border-border/50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors duration-100 ${
                        txn.is_duplicate ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-primaryText dark:text-gray-200">
                        {txn.transaction_date ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {txn.transaction_time ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          txn.transaction_type === "CREDIT"
                            ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/40"
                            : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40"
                        }`}>
                          {txn.transaction_type === "CREDIT"
                            ? <TrendingUp className="h-2.5 w-2.5" />
                            : <TrendingDown className="h-2.5 w-2.5" />
                          }
                          {txn.transaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-black text-primaryText dark:text-gray-100">
                        {formatAmount(txn.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-primary text-[11px] font-bold select-all">
                          {txn.utr ?? <span className="text-muted font-medium">—</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {txn.reference_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="truncate text-primaryText dark:text-gray-300">
                          {txn.narration ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {txn.sender_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {txn.receiver_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted font-medium">
                        {txn.balance !== null ? formatAmount(txn.balance) : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${badge.classes}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                          {txn.is_duplicate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40">
                              <Copy className="h-2.5 w-2.5" />
                              Dup
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────── */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold text-muted border border-border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs font-bold text-muted">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold text-muted border border-border dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
