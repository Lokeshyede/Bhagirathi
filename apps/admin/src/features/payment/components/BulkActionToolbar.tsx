import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, X, Download,
} from "lucide-react";

interface BulkActionToolbarProps {
  selectedCount: number;
  onVerify: () => void;
  onReject: () => void;
  onManualReview: () => void;
  onExport: () => void;
  onDeselect: () => void;
  isVerifying?: boolean;
  isRejecting?: boolean;
  isMoving?: boolean;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onVerify,
  onReject,
  onManualReview,
  onExport,
  onDeselect,
  isVerifying,
  isRejecting,
  isMoving,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)]"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-x-auto scrollbar-none">
            {/* Selection count */}
            <div className="flex items-center gap-2 pr-2.5 sm:pr-3 border-r border-gray-700 dark:border-gray-600 shrink-0">
              <span className="h-6 min-w-6 px-2 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                {selectedCount}
              </span>
              <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
                {selectedCount === 1 ? "pmt" : "pmts"} selected
              </span>
            </div>

            {/* Verify Selected */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onVerify}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="whitespace-nowrap">{isVerifying ? "Verifying…" : "Verify"}</span>
            </motion.button>

            {/* Reject Selected */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onReject}
              disabled={isRejecting}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-60 shrink-0"
            >
              <XCircle className="h-4 w-4" />
              <span className="whitespace-nowrap">{isRejecting ? "Rejecting…" : "Reject"}</span>
            </motion.button>

            {/* Move to Manual Review */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onManualReview}
              disabled={isMoving}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-semibold transition-colors disabled:opacity-60 shrink-0"
            >
              <Clock className="h-4 w-4" />
              <span className="whitespace-nowrap">{isMoving ? "Moving…" : "Manual"}</span>
            </motion.button>

            {/* Export */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 text-xs font-medium transition-colors shrink-0"
            >
              <Download className="h-4 w-4" />
              <span className="whitespace-nowrap">Export</span>
            </motion.button>

            {/* Deselect */}
            <button
              onClick={onDeselect}
              className="ml-1 h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
              title="Deselect all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
