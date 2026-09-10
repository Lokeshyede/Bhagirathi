import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Loader2,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Column Definition ────────────────────────────────────────────────────────
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

// ─── Table Props ──────────────────────────────────────────────────────────────
interface ReportTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  total?: number;
  page?: number;
  pages?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  caption?: string;
}

// ─── Sort State ───────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc" | null;

// ─── Reusable Table ───────────────────────────────────────────────────────────
function ReportTable<T extends object>({
  columns,
  data,
  total,
  page = 1,
  pages = 1,
  onPageChange,
  loading = false,
  emptyMessage = "No records found.",
  searchable = true,
  searchPlaceholder = "Search records…",
  caption,
}: ReportTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [search,  setSearch]  = useState("");

  // Client-side sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Filtered + sorted rows
  const processed = useMemo(() => {
    let rows = [...data];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((v) =>
          v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        const cmp =
          av == null ? -1
          : bv == null ? 1
          : typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return rows;
  }, [data, search, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: TableColumn<T> }) => {
    if (!col.sortable) return null;
    const active = sortKey === String(col.key);
    if (!active)       return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
    if (sortDir === "asc")  return <ChevronUp   className="w-3.5 h-3.5 text-red-500" />;
    if (sortDir === "desc") return <ChevronDown  className="w-3.5 h-3.5 text-red-500" />;
    return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Toolbar */}
      {(searchable || caption) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          {caption && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {total !== undefined ? `${total.toLocaleString()} total records` : caption}
            </p>
          )}
          {searchable && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap select-none ${
                    col.align === "center" ? "text-center" :
                    col.align === "right"  ? "text-right"  : "text-left"
                  } ${col.sortable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors" : ""}`}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">Loading report…</p>
                  </td>
                </tr>
              ) : processed.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                processed.map((row, ri) => (
                  <motion.tr
                    key={ri}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: ri * 0.01 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {columns.map((col) => {
                      const rawVal = (row as Record<string, unknown>)[String(col.key)];
                      const content = col.render ? col.render(rawVal, row, ri) : (rawVal ?? "—") as React.ReactNode;
                      return (
                        <td
                          key={String(col.key)}
                          className={`px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap ${
                            col.align === "center" ? "text-center" :
                            col.align === "right"  ? "text-right"  : ""
                          }`}
                        >
                          {content as React.ReactNode}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {pages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers (up to 7 visible) */}
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = pages <= 7 ? i + 1
                : page <= 4 ? i + 1
                : page >= pages - 3 ? pages - 6 + i
                : page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-red-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportTable;
