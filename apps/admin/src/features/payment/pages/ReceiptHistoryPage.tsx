import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCw, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useReceipts, useRegenerateReceipt } from "../hooks/useReceipt";
import { ReceiptCard } from "../components/ReceiptCard";
import { PDFPreviewModal } from "../components/PDFPreviewModal";
import { useAuthStore } from "../../../store/auth";
import { apiClient } from "@bhagirathi/api-client";

const RECEIPT_TYPES = ["ALL", "Rent", "Electricity", "Combined", "Security Deposit", "Fine", "Other"];

const ReceiptHistoryPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewNum, setPreviewNum] = useState("");
  const [banner, setBanner] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const limit = 12;
  const skip = (page - 1) * limit;

  const { data, isLoading, refetch, isFetching } = useReceipts({
    search,
    receipt_type: typeFilter,
    skip,
    limit,
  });

  const regenerateMutation = useRegenerateReceipt();

  const handlePreview = async (id: string) => {
    try {
      const res = await apiClient.get(`/api/v1/receipts/${id}`);
      setPreviewNum(res.data.receipt_number);
      setPreviewUrl(res.data.pdf_url);
      setPreviewId(id);
    } catch (e) {
      setBanner({ message: "Failed to open preview.", type: "error" });
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await apiClient.get(`/api/v1/receipts/${id}/download`);
      if (res.data.pdf_url) {
        window.open(res.data.pdf_url, "_blank");
      }
    } catch (e) {
      setBanner({ message: "Failed to trigger download.", type: "error" });
    }
  };

  const handleRegenerate = async (paymentId: string) => {
    try {
      setBanner(null);
      const res = await regenerateMutation.mutateAsync({ payment_id: paymentId });
      setBanner({ message: `Successfully regenerated receipt ${res.receipt_number}`, type: "success" });
    } catch (e: any) {
      setBanner({ message: e?.response?.data?.detail || "Regeneration failed.", type: "error" });
    }
  };

  const receipts = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View and download your digital payment receipts
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center justify-between p-4 rounded-xl text-sm border font-medium ${
              banner.type === "success"
                ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900"
                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {banner.message}
            </div>
            <button onClick={() => setBanner(null)} className="text-current opacity-60 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search receipt number, tenant..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type select */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {RECEIPT_TYPES.map((t) => (
              <option key={t} value={t}>{t === "ALL" ? "All Types" : t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Receipts */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-2xl">
          <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No receipts found</p>
          <p className="text-xs text-gray-450 mt-1">Try refining your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {receipts.map((r) => (
            <ReceiptCard
              key={r.id}
              receipt={r}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onRegenerate={handleRegenerate}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Previous
          </button>
          <span className="flex items-center text-xs font-semibold px-3 text-gray-505">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Preview Modal */}
      <PDFPreviewModal
        isOpen={!!previewId}
        onClose={() => { setPreviewId(null); setPreviewUrl(null); }}
        pdfUrl={previewUrl}
        receiptNumber={previewNum}
      />
    </div>
  );
};

export default ReceiptHistoryPage;
