import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";

interface PrintDialogProps {
  isOpen:   boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
}

export const PrintDialog: React.FC<PrintDialogProps> = ({
  isOpen, onClose, title, children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = contentRef.current?.innerHTML;
    if (!content) return;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title} — Bhagirathi PG System</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 12px;
      color: #111827;
      background: #fff;
      padding: 24px;
    }
    .print-header {
      border-bottom: 2px solid #c0392b;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .print-header h1 {
      font-size: 18px;
      font-weight: 700;
      color: #c0392b;
    }
    .print-header p { font-size: 11px; color: #6b7280; margin-top: 3px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
    }
    thead th {
      background: #c0392b;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td {
      padding: 6px 10px;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
    }
    .stat-card .label { font-size: 10px; color: #9ca3af; text-transform: uppercase; }
    .stat-card .value { font-size: 20px; font-weight: 700; color: #111827; margin-top: 4px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>Bhagirathi Hostel &amp; PG Management System</h1>
    <p>${title} &mdash; Generated: ${new Date().toLocaleString()}</p>
  </div>
  ${content}
</body>
</html>`);

    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Print Preview</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div
                  ref={contentRef}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-h-96"
                >
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
