import React from "react";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, Eye, RefreshCw } from "lucide-react";
import type { ReceiptListItem } from "../hooks/useReceipt";

interface ReceiptCardProps {
  receipt: ReceiptListItem;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onRegenerate?: (paymentId: string) => void;
  isAdmin?: boolean;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onPreview,
  onDownload,
  onRegenerate,
  isAdmin = false,
}) => {
  const getBadgeColors = (type: string) => {
    switch (type) {
      case "Rent":
        return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900";
      case "Electricity":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      case "Combined":
        return "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900";
      case "Security Deposit":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      case "Fine":
        return "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-700";
    }
  };

  const formattedDate = new Date(receipt.generated_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColors(receipt.receipt_type)}`}>
              {receipt.receipt_type}
            </span>
          </div>
          <span className={`text-xs font-bold ${receipt.status === "Generated" ? "text-green-500" : "text-amber-500"}`}>
            ● {receipt.status}
          </span>
        </div>

        {/* Receipt Number */}
        <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold text-sm mb-1">
          <FileText className="h-4 w-4 text-gray-400" />
          {receipt.receipt_number}
        </div>

        {/* Tenant */}
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
          Tenant: <span className="text-gray-800 dark:text-gray-200 font-semibold">{receipt.tenant_name}</span>
        </p>

        {/* Details Row */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Month</p>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{receipt.billing_month || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Amount</p>
            <p className="text-xs text-gray-900 dark:text-white font-bold">₹{receipt.total_amount.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </div>

        <div className="flex items-center gap-1">
          {/* Preview */}
          <button
            onClick={() => onPreview(receipt.id)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
            title="Preview Receipt"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Regenerate (Admin Only) */}
          {isAdmin && onRegenerate && (
            <button
              onClick={() => onRegenerate(receipt.payment_id)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
              title="Regenerate Receipt"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Download */}
          <button
            onClick={() => onDownload(receipt.id)}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            title="Download PDF"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
