import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { useExportReport } from "../hooks/useReports";
import type { ReportType, ReportFilters } from "../types";

interface ExportDialogProps {
  isOpen:      boolean;
  onClose:     () => void;
  reportType:  ReportType;
  filters?:    ReportFilters;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen, onClose, reportType, filters,
}) => {
  const { doExport, isPdfLoading, isExcelLoading } = useExportReport();

  const handleExport = (format: "pdf" | "excel") => {
    doExport(format, reportType, filters);
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
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Export Report
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                    {(reportType ?? "GENERAL").replace(/_/g, " ")} report
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                {/* PDF */}
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={isPdfLoading || isExcelLoading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                    {isPdfLoading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Export as PDF
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Formatted report with borders and headers
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 ml-auto group-hover:text-red-500 transition-colors" />
                </button>

                {/* Excel */}
                <button
                  onClick={() => handleExport("excel")}
                  disabled={isPdfLoading || isExcelLoading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                    {isExcelLoading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <FileSpreadsheet className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Export as Excel
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Spreadsheet with styled cells (.xlsx)
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-500 transition-colors" />
                </button>
              </div>

              {/* Note */}
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
                Applied filters will be included in the export.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
