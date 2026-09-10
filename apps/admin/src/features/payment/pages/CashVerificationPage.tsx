import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote, Home, ChevronRight, RefreshCw, AlertTriangle, CheckCircle,
  XCircle, Search, Check
} from "lucide-react";
import { Button } from "@bhagirathi/ui";
import {
  usePendingCashPayments
} from "../../rent_collection/hooks/useRentCollection";
import {
  useVerifySinglePayment,
  useRejectSinglePayment
} from "../hooks/useVerification";

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const CashVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Queries & Mutations
  const { data: pendingPayments, isLoading, refetch, isFetching } = usePendingCashPayments();
  const verifyMutation = useVerifySinglePayment();
  const rejectMutation = useRejectSinglePayment();

  const handleVerify = async (paymentId: string) => {
    setSuccessBanner(null);
    setErrorBanner(null);
    try {
      await verifyMutation.mutateAsync({ payment_id: paymentId });
      setSuccessBanner("✓ Cash payment successfully verified. Rent ledger updated and receipt generated!");
      refetch();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setErrorBanner(err.response?.data?.detail || "Failed to verify cash payment.");
      setTimeout(() => setErrorBanner(null), 5000);
    }
  };

  const handleReject = async (paymentId: string) => {
    setSuccessBanner(null);
    setErrorBanner(null);
    const remarks = prompt("Please enter rejection remarks (optional):") ?? "Rejected by admin.";
    try {
      await rejectMutation.mutateAsync({ payment_id: paymentId, remarks });
      setSuccessBanner("Payment successfully rejected.");
      refetch();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setErrorBanner(err.response?.data?.detail || "Failed to reject payment.");
      setTimeout(() => setErrorBanner(null), 5000);
    }
  };

  const filteredPayments = pendingPayments?.filter(p =>
    p.tenant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.payment_reference.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12 text-primaryText dark:text-white"
    >
      
      {/* 1. Header & Navigation Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 px-5 py-4 rounded-card shadow-card select-none">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
          <Home className="h-4 w-4 text-primary" />
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondaryText hover:text-primaryText cursor-pointer" onClick={() => navigate("/payments")}>Payments</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primaryText dark:text-white">Cash Verification</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
            title="Refresh List"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 text-secondaryText ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Banners */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-sm font-semibold"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successBanner}</span>
          </motion.div>
        )}

        {errorBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-300 text-sm font-semibold"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title block */}
      <div>
        <h1 className="text-lg font-black leading-tight uppercase tracking-wider flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Banknote className="h-5 w-5" />
          </div>
          Cash Verification Queue
        </h1>
        <p className="text-xs text-muted mt-1 leading-normal font-medium">
          Verify and settle cash collections recorded by PG Administrators. Finalizes ledger and generates PDFs.
        </p>
      </div>

      {/* 2. Main List & Search */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card p-4 space-y-4">
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search pending cash by tenant name, room, reference..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-9 pr-3 border border-border dark:border-gray-800 rounded bg-gray-55 dark:bg-gray-950 text-xs font-semibold text-primaryText focus:outline-none"
          />
        </div>

        {/* Table or Cards */}
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-55 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center select-none border border-dashed border-border dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-955/10">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-3 animate-bounce" />
            <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">All Cash Payments Settled</h4>
            <p className="text-xs text-muted max-w-xs mt-1">There are no pending cash payment submissions awaiting verification.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredPayments.map(p => (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900/60 border border-border dark:border-gray-800 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                
                {/* Details segment */}
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-primaryText dark:text-white uppercase tracking-wider">{p.tenant_name}</h4>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-muted border border-border">
                        {p.tenant_display_id}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs font-semibold text-secondaryText dark:text-gray-400">
                      <div>
                        <span className="text-[9px] text-muted block uppercase">Room</span>
                        <span className="text-primaryText dark:text-white font-bold">{p.room_number}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted block uppercase">Billing Month</span>
                        <span className="text-primaryText dark:text-white font-bold">
                          {p.billing_month ? MONTH_NAMES[parseInt(p.billing_month)] : ""} {p.billing_year}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted block uppercase">Reference Code</span>
                        <span className="font-mono text-[10px] tracking-tight">{p.payment_reference}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted block uppercase">Recorded On</span>
                        <span className="text-primaryText dark:text-white font-bold">
                          {p.submission_date ? new Date(p.submission_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount segment */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-border dark:border-gray-850 pt-3.5 md:pt-0 shrink-0 gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-muted block uppercase font-bold">Cash Amount</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleReject(p.id)}
                      variant="secondary"
                      className="h-8.5 px-3 border border-red-500/20 text-red-500 hover:bg-red-500/5 hover:text-red-600 font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                      disabled={verifyMutation.isPending || rejectMutation.isPending}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleVerify(p.id)}
                      className="h-8.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                      isLoading={verifyMutation.isPending && verifyMutation.variables?.payment_id === p.id}
                      disabled={verifyMutation.isPending || rejectMutation.isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Verify &amp; Settle</span>
                    </Button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default CashVerificationPage;
