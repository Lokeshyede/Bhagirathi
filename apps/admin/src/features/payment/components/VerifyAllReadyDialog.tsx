import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Play, RefreshCw, X, Brain, AlertTriangle } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";

interface VerifyAllReadyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  aiReadyCount: number;
  minConfidence?: number;
}

export const VerifyAllReadyDialog: React.FC<VerifyAllReadyDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  aiReadyCount,
  minConfidence = 95,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ processed: number; skipped: number } | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setResult({ processed: aiReadyCount, skipped: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? handleClose : undefined}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50/60 to-emerald-50/60 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Verify All Ready</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI Confidence ≥ {minConfidence}%</p>
                  </div>
                </div>
                {!isLoading && (
                  <button
                    onClick={handleClose}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-4">
                {result ? (
                  /* Success state */
                  <div className="text-center py-4 space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">Verification Complete</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {result.processed} payment{result.processed !== 1 ? "s" : ""} have been verified successfully.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Confirmation */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You are about to verify{" "}
                        <span className="font-bold text-amber-800 dark:text-amber-200">
                          {aiReadyCount} payment{aiReadyCount !== 1 ? "s" : ""}
                        </span>{" "}
                        with AI confidence ≥ {minConfidence}%. This action cannot be undone in bulk but individual payments can be un-verified separately.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <ConfidenceMeter score={minConfidence} label="Minimum" size="sm" showLabel={false} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Confidence Threshold</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{minConfidence}%+</p>
                        <p className="text-xs text-gray-500">{aiReadyCount} eligible payments</p>
                      </div>
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
                        disabled={isLoading || aiReadyCount === 0}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          <><RefreshCw className="h-4 w-4 animate-spin" /> Verifying…</>
                        ) : (
                          <><Play className="h-4 w-4" /> Verify Now</>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
