import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, FileText, CheckCircle2, Clock, AlertTriangle,
  Calendar, TrendingUp, Receipt
} from "lucide-react";
import { useTenantBillingLedger, Bill } from "../hooks/api/useBilling";

interface BillingLedgerDrawerProps {
  tenantId: string | null;
  tenantName?: string;
  onClose: () => void;
}

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PAID: {
    label: "Paid",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  PENDING: {
    label: "Pending",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  OVERDUE: {
    label: "Overdue",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

const BillRow: React.FC<{ bill: Bill }> = ({ bill }) => {
  const cfg = statusConfig[bill.status] ?? statusConfig.PENDING;
  const balance = bill.total_amount - bill.paid_amount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group p-4 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {MONTH_NAMES[bill.rent_month]} {bill.rent_year}
            </p>
            {bill.room_number && (
              <p className="text-xs text-slate-400">Room {bill.room_number}</p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Amount grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-white/[0.04]">
          <p className="text-xs text-slate-500 mb-0.5">Room Rent</p>
          <p className="text-sm font-bold text-slate-200">₹{bill.monthly_rent.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.04]">
          <p className="text-xs text-slate-500 mb-0.5">Your Share</p>
          <p className="text-sm font-bold text-violet-300">₹{bill.total_amount.toLocaleString("en-IN")}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.04]">
          <p className="text-xs text-slate-500 mb-0.5">Balance</p>
          <p className={`text-sm font-bold ${balance > 0 ? "text-red-400" : "text-emerald-400"}`}>
            ₹{balance.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Due date */}
      {bill.due_date && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500">
          <Calendar className="w-3 h-3" />
          Due: {new Date(bill.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          {bill.late_fee > 0 && (
            <span className="ml-2 text-red-400">+₹{bill.late_fee} late fee</span>
          )}
          {bill.discount > 0 && (
            <span className="ml-2 text-emerald-400">-₹{bill.discount} discount</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export const BillingLedgerDrawer: React.FC<BillingLedgerDrawerProps> = ({
  tenantId,
  tenantName,
  onClose,
}) => {
  const { data: bills, isLoading, isError } = useTenantBillingLedger(tenantId);

  const totalBilled = bills?.reduce((s, b) => s + b.total_amount, 0) ?? 0;
  const totalPaid = bills?.reduce((s, b) => s + b.paid_amount, 0) ?? 0;
  const totalOutstanding = totalBilled - totalPaid;
  const overdueCount = bills?.filter(b => b.status === "OVERDUE").length ?? 0;

  return (
    <AnimatePresence>
      {tenantId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0f1117 0%, #0a0d14 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Billing Ledger</h2>
                  <p className="text-xs text-slate-400">{tenantName ?? "Tenant"}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.06]">
              <div className="p-4 bg-[#0a0d14] text-center">
                <p className="text-xs text-slate-500 mb-1">Total Billed</p>
                <p className="text-lg font-bold text-white">₹{totalBilled.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 bg-[#0a0d14] text-center">
                <p className="text-xs text-slate-500 mb-1">Collected</p>
                <p className="text-lg font-bold text-emerald-400">₹{totalPaid.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 bg-[#0a0d14] text-center">
                <p className="text-xs text-slate-500 mb-1">Outstanding</p>
                <p className={`text-lg font-bold ${totalOutstanding > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  ₹{totalOutstanding.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Overdue alert */}
            {overdueCount > 0 && (
              <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">
                  {overdueCount} overdue bill{overdueCount > 1 ? "s" : ""} — immediate attention required
                </p>
              </div>
            )}

            {/* Bills list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 rounded-xl bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              )}

              {isError && (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Failed to load billing ledger.
                </div>
              )}

              {!isLoading && !isError && (!bills || bills.length === 0) && (
                <div className="text-center py-16">
                  <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No bills generated yet</p>
                  <p className="text-xs text-slate-600 mt-1">Bills appear here once the billing engine runs</p>
                </div>
              )}

              {bills?.map(bill => <BillRow key={bill.id} bill={bill} />)}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BillingLedgerDrawer;
