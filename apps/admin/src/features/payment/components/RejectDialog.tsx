import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, X, RefreshCw } from "lucide-react";

const PREDEFINED_REASONS = [
  "Duplicate UTR",
  "Invalid Screenshot",
  "Amount Mismatch",
  "Wrong Payment",
  "Fraud Suspected",
  "UTR Not Found in Bank Statement",
  "Payment Already Captured",
  "Other",
];

interface RejectDialogProps {
  isOpen: boolean;
  selectedCount: number;
  tenantName?: string;        // used when rejecting a single payment
  onClose: () => void;
  onConfirm: (reason: string, remarks?: string) => Promise<void>;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  isOpen,
  selectedCount,
  tenantName,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!reason) {
      setError("Please select a rejection reason.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await onConfirm(reason, remarks || undefined);
      setReason("");
      setRemarks("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setRemarks("");
      setError("");
      onClose();
    }
  };

  const label = selectedCount === 1 && tenantName
    ? `Reject payment for ${tenantName}`
    : `Reject ${selectedCount} payment${selectedCount > 1 ? "s" : ""}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-red-50/60 to-rose-50/60 dark:from-red-950/20 dark:to-rose-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
                    {selectedCount > 1 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">One reason applies to all selected</p>
                    )}
                  </div>
                </div>
                {!isLoading && (
                  <button onClick={handleClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Reason selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Rejection Reason *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PREDEFINED_REASONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setReason(r); setError(""); }}
                        className={`text-left px-3 py-2 rounded-xl text-sm border transition-all
                          ${reason === r
                            ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-semibold"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Additional Remarks <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional context for the tenant or audit log…"
                    rows={3}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-600 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={isLoading || !reason}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Rejecting…</>
                    ) : (
                      <><XCircle className="h-4 w-4" /> Reject {selectedCount > 1 ? `${selectedCount} Payments` : "Payment"}</>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
