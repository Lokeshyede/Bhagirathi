import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, Share2 } from "lucide-react";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  receiptNumber?: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  receiptNumber = "Receipt",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.focus();
        iframeRef.current.contentWindow?.print();
      } catch (e) {
        // Fallback if cross-origin print is blocked by browser security
        window.open(pdfUrl || "", "_blank");
      }
    }
  };

  const handleShare = () => {
    if (navigator.share && pdfUrl) {
      navigator
        .share({
          title: `Receipt ${receiptNumber}`,
          text: `Here is the receipt for ${receiptNumber}`,
          url: pdfUrl,
        })
        .catch(console.error);
    } else {
      // Fallback
      navigator.clipboard.writeText(pdfUrl || "");
      alert("Receipt PDF link copied to clipboard!");
    }
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
          >
            <div className="w-full max-w-4xl h-[90vh] sm:h-[85vh] rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 flex-shrink-0">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Receipt PDF Preview</h3>
                  <p className="text-xs text-gray-500">{receiptNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Print */}
                  <button
                    onClick={handlePrint}
                    disabled={!pdfUrl}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    title="Print Receipt"
                  >
                    <Printer className="h-4 w-4" />
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    disabled={!pdfUrl}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    title="Share Link"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  {/* Direct Download */}
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                      title="Download PDF File"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}

                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* PDF Document Frame */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-950 relative">
                {pdfUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={`${pdfUrl}#toolbar=1`}
                    className="w-full h-full border-none"
                    title="Receipt PDF Preview Frame"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    No PDF url available.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default PDFPreviewModal;
