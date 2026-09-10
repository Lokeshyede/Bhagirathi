import React from "react";
import { useNavigate } from "react-router-dom";
import { useTenantContract } from "../features/payment/hooks/useTenantDashboard";
import { Button } from "@bhagirathi/ui";
import { FileText, Calendar, Landmark, ShieldCheck, Download, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const MyContractPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: contract, isLoading, isError, refetch } = useTenantContract();

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-3xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-64 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError || !contract || contract.status === "NO_CONTRACT" || !contract.id) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="font-black text-sm text-stone-900 dark:text-white mb-2 uppercase tracking-wider">No Active Contract</h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          {contract?.message || "There was an error accessing lease contract details. Make sure your contracts are generated and active."}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="font-bold h-10 px-6 cursor-pointer text-stone-700 dark:text-stone-300">
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto pb-12"
    >
      {/* Header with Back */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">My Rent Contract</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            View your leasing tenure, security deposit holdings, and agreement files.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
          <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-650 flex items-center justify-center shrink-0">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Lease Terms</h3>
        </div>

        <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs">
          <div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Contract Number</span>
            <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block select-all font-mono text-xs">
              {strContractId(contract.id)}
            </span>
          </div>

          <div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Agreement Status</span>
            <span className="mt-1 block">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                {contract.status}
              </span>
            </span>
          </div>

          <div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Commencement Date</span>
            <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-stone-400" />
              {formatDate(contract.start_date)}
            </span>
          </div>

          <div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Expiration Date</span>
            <span className="font-bold text-stone-850 dark:text-stone-105 mt-1 block flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-red-600" />
              {formatDate(contract.end_date)}
            </span>
          </div>

          <div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Monthly Rent Rate</span>
            <span className="font-bold text-stone-800 dark:text-stone-200 mt-1 block select-all">
              ₹{Number(contract.rent_amount).toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Security Deposit Paid</span>
            <span className="font-bold text-stone-850 dark:text-white mt-1 block flex items-center gap-1.5 select-all">
              <Landmark className="h-4 w-4 text-stone-400" />
              ₹{Number(contract.security_deposit).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {contract.agreement_url && (
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2 flex justify-end">
            <a
              href={contract.agreement_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-black text-red-650 hover:text-red-700 transition-colors bg-red-50 dark:bg-red-955/15 px-4 py-2.5 rounded-xl border border-red-150/40 dark:border-transparent"
            >
              <Download className="h-4 w-4 animate-bounce" />
              <span>Download Signed Rent Agreement (PDF)</span>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const strContractId = (id: string | null | undefined) => {
  if (!id) return "N/A";
  return id.slice(0, 8).toUpperCase();
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default MyContractPage;
