import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Button } from "@bhagirathi/ui";
import { Zap, AlertTriangle, ArrowLeft, CreditCard, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export const ElectricityBillPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: bills, isLoading, isError, refetch } = useQuery<any[]>({
    queryKey: ["my-electricity-bills"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/my/electricity-bills");
      return res.data;
    }
  });

  const getStatusBadge = (status: string, payStatus: string, outstanding?: number) => {
    const isSettled = payStatus === "VERIFIED" || payStatus === "PAID" || (outstanding !== undefined && Number(outstanding) <= 0);
    if (isSettled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 dark:bg-green-955/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
          Paid &amp; Verified
        </span>
      );
    }
    if (payStatus === "UNDER_REVIEW" || payStatus === "Submitted") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
          Under Review
        </span>
      );
    }
    if (payStatus === "REJECTED" || payStatus === "Rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 animate-pulse">
          Rejected
        </span>
      );
    }
    if (status === "OVERDUE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-450 border border-red-200 dark:border-red-900/30 animate-pulse">
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-250 dark:border-amber-900/30">
        Pending
      </span>
    );
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-2xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-44 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="h-36 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to load bills</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          There was an error retrieving your room electricity bills. Please try again.
        </p>
        <Button onClick={() => refetch()} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">Electricity Bills</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Track consumption metrics and verify meter billing schedules.
          </p>
        </div>
      </div>

      {/* Bill List */}
      <div className="space-y-5">
        {bills && bills.length > 0 ? (
          bills.map((bill) => {
            const outstandingAmt = Number(bill.outstanding ?? bill.my_share ?? 0);
            const isUnderReview = bill.payment_status === "UNDER_REVIEW" || bill.payment_status === "Submitted";
            const isPayable = outstandingAmt > 0 && !isUnderReview;
            return (
              <div
                key={bill.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                {/* Month Name & Badge */}
                <div className="flex justify-between items-center select-none border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-amber-50 dark:bg-amber-955/20 rounded-xl flex items-center justify-center text-amber-550 shrink-0">
                      <Zap className="h-5 w-5 fill-amber-500 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-black text-xs text-stone-850 dark:text-white block">
                        {getMonthName(bill.bill_month)} {bill.bill_year}
                      </span>
                      <span className="text-[9.5px] text-stone-400 dark:text-stone-500 font-bold block uppercase mt-0.5">
                        Meter: {bill.meter_number || "Common Meter"}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(bill.status, bill.payment_status, bill.outstanding)}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block select-none">Consumption Metrics</span>
                    <span className="font-mono font-black text-xs text-stone-850 dark:text-stone-200 mt-1 block select-all">
                      {bill.previous_reading} ➔ {bill.current_reading} KWh
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block select-none">Units &amp; Rate</span>
                    <span className="font-mono font-bold text-xs text-stone-600 dark:text-stone-400 mt-1 block">
                      {bill.units} units × ₹{bill.unit_rate}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block select-none">Amount Paid</span>
                    <span className="font-mono font-bold text-xs text-emerald-600 mt-1 block">
                      ₹{Number(bill?.amount_paid || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block select-none">Outstanding</span>
                    <span className="font-mono font-bold text-xs text-amber-600 mt-1 block">
                      ₹{Number(bill?.outstanding ?? bill?.my_share).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Due Date & Total */}
                <div className="flex justify-between items-end select-none pt-2 border-t border-slate-50 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Due Date</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 mt-1">
                      <Calendar className="h-4 w-4 text-stone-400" />
                      {new Date(bill.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Electricity Share</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">
                      Total Room Bill: ₹{Number(bill.bill_amount).toLocaleString("en-IN")}
                    </span>
                    <span className="text-base font-black text-primary tracking-wide block mt-0.5 select-all">
                      <span className="text-stone-800 dark:text-stone-200">₹{Number(bill?.my_share ?? bill?.outstanding ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </span>
                  </div>
                </div>

                {/* Action button */}
                {isPayable && (
                  <Button
                    onClick={() => navigate(`/pay-electricity/${bill.id}`)}
                    className="btn-primary-tenant w-full inline-flex items-center justify-center gap-1.5 font-black cursor-pointer h-10 text-xs rounded-xl mt-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Pay Bill Dues Now</span>
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none max-w-sm mx-auto">
            <Zap className="h-10 w-10 text-stone-300 dark:text-stone-700 mb-2 animate-bounce" />
            <p className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider">No bills generated</p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed font-semibold mt-1.5 max-w-[200px]">
              You don't have any electricity bills logged in this portal yet.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ElectricityBillPage;
