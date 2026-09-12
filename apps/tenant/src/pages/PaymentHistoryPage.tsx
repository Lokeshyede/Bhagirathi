import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyPaymentHistory } from "../features/payment/hooks/useTenantPayment";

import { apiClient } from "@bhagirathi/api-client";
import { Button } from "@bhagirathi/ui";
import { History, Clock, CheckCircle, XCircle, AlertCircle, Copy, Check, Image as ImageIcon, ArrowLeft, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  // ISSUE-010 fix: useMyPaymentHistory no longer needs tenantId — JWT handles auth server-side
  const { data: payments, isLoading, isError } = useMyPaymentHistory();
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownloadReceipt = async (paymentId: string, receiptNumber: string) => {
    try {
      setIsDownloading(paymentId);
      const response = await apiClient.get(`/api/v1/receipts/payment/${paymentId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = receiptNumber ? `${receiptNumber}.pdf` : `receipt-${paymentId.slice(0,8)}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt", error);
      alert("Failed to download the receipt. Please try again later.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-3xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to Load History</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          Could not retrieve your payment history. Please check your connection or try again.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "VERIFIED" || s === "PAID") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 dark:bg-green-955/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
          <CheckCircle className="h-3.5 w-3.5" /> Verified
        </span>
      );
    }
    if (s === "REJECTED" || s === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 animate-pulse">
          <XCircle className="h-3.5 w-3.5" /> Rejected
        </span>
      );
    }
    if (s === "SUBMITTED" || s === "UNDER_REVIEW" || s === "UNDER_VERIFICATION") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
          <Clock className="h-3.5 w-3.5 animate-pulse" /> Submitted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-250 dark:border-amber-900/30">
        <Clock className="h-3.5 w-3.5" /> Pending
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto pb-12"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">Payment Ledger History</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Track submitted UTR transaction references and download verification receipts.
          </p>
        </div>
      </div>

      {payments && payments.length > 0 ? (
        <div className="space-y-5">
          {payments.map((p: any, i: number) => {
            // ISSUE: use only schema-accurate field names
            const utrVal = p.transaction_id || "N/A";
            const isVerified = (p.status || "").toUpperCase() === "VERIFIED" || (p.status || "").toUpperCase() === "PAID";
            const isRejected = (p.status || "").toUpperCase() === "REJECTED";
            // proof_image_url is the correct field name from PaymentHistoryResponse schema
            const screenshotUrl = p.proof_image_url;
            // submission_date now in schema (ISSUE-009 fix); fall back to payment_date
            const submittedDate = p.submission_date || p.payment_date;
            const billingMonthStr = p.billing_month ? (MONTH_NAMES[Number(p.billing_month) - 1] || p.billing_month) : null;
            const periodStr = billingMonthStr ? `${billingMonthStr} ${p.billing_year || ""}` : (p.payment_reference || "N/A");
            // ISSUE-009: rejection reason fields now exposed by backend
            const rejectionReason = p.remarks || p.override_reason;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="font-black text-sm text-stone-850 dark:text-white select-all">
                      ₹{Number(p.total_amount || p.amount || 0).toLocaleString("en-IN")}
                    </h4>
                    <span className="text-[9.5px] text-stone-400 dark:text-stone-500 block mt-0.5 select-none">
                      Submitted: {submittedDate ? new Date(submittedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
                    </span>
                  </div>
                  <div className="shrink-0 select-none">
                    {getStatusBadge(p.status || p.verification_status)}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs select-none">
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Billing Period</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block">
                      {periodStr}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Transaction UTR</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200 select-all text-[11px] truncate max-w-[120px]">
                        {utrVal}
                      </span>
                      {utrVal !== "N/A" && (
                        <button
                          onClick={() => handleCopyUtr(utrVal, p.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-red-650 transition cursor-pointer shrink-0"
                          title="Copy UTR Reference"
                        >
                          {copiedId === p.id ? <Check className="h-3.5 w-3.5 text-green-600 animate-bounce" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Screenshot Proof</span>
                    {screenshotUrl ? (
                      <button
                        onClick={() => setActiveImageModal(screenshotUrl)}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-red-650 hover:underline mt-1 cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> View Proof
                      </button>
                    ) : (
                      <span className="text-stone-400 text-xs block mt-1 font-semibold">No file attached</span>
                    )}
                  </div>
                </div>

                {/* ISSUE-009: Rejection Reason — now always shown for rejected payments */}
                {isRejected && (
                  <div className="bg-red-50 dark:bg-red-955/15 border border-red-200 dark:border-red-900/35 rounded-2xl p-3.5 flex gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="uppercase text-[9px] tracking-wide font-black block">Rejection Reason:</span>
                      <p className="font-semibold text-[11px] mt-0.5 leading-normal">
                        {rejectionReason || "No reason provided by admin. Please contact hostel management."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {isVerified && p.receipt_url && (
                  <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end select-none">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReceipt(p.id, p.receipt_number)}
                      disabled={isDownloading === p.id}
                      className="inline-flex items-center gap-1.5 h-9 text-xs px-4 font-black cursor-pointer border-slate-200 dark:border-zinc-800 text-stone-750 dark:text-stone-300 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    >
                      <Download className={`h-4 w-4 ${isDownloading === p.id ? "animate-bounce text-stone-500" : "text-stone-400"}`} />
                      <span>{isDownloading === p.id ? "Downloading..." : "Download Receipt"}</span>
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none max-w-sm mx-auto">
          <History className="h-10 w-10 text-stone-350 dark:text-stone-700 mb-3" />
          <h3 className="text-sm font-black text-stone-850 dark:text-white mb-1.5 uppercase tracking-wider">No Submissions Found</h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs leading-relaxed font-semibold">
            You have not submitted any UPI rent payment reference receipts yet.
          </p>
        </div>
      )}


      {/* Screenshot image modal */}
      <AnimatePresence>
        {activeImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
                <span className="text-xs font-black uppercase tracking-wider text-stone-850 dark:text-white">Payment Screenshot Proof</span>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white bg-slate-50 dark:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-200 dark:border-zinc-800 select-none">
                <img src={activeImageModal} alt="Screenshot Proof" className="w-full object-contain" />
              </div>
              <div className="text-right select-none">
                <Button onClick={() => setActiveImageModal(null)} variant="outline" className="font-bold h-10 px-5 text-xs text-stone-600 dark:text-stone-300 cursor-pointer">
                  Close Preview
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaymentHistoryPage;
