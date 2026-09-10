import React from "react";
import { useNavigate } from "react-router-dom";
import { PhoneCall, Mail, AlertTriangle, ShieldCheck, HelpCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto pb-12"
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
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">Help &amp; Support</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Contact building administration, report emergency situations, or find local help.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PG Helpdesk Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800 select-none">
            <HelpCircle className="h-5 w-5 text-red-655" />
            <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Administration Helpdesk</h3>
          </div>
          
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
            For rent invoices, check-in questions, security deposits, and contract extensions, please contact the main PG administrator.
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-stone-800 dark:text-gray-300">
              <PhoneCall className="h-4.5 w-4.5 text-stone-400 shrink-0" />
              <a href="tel:+919876543210" className="hover:text-red-650 font-black select-all">+91 98765 43210</a>
            </div>
            <div className="flex items-center gap-2.5 text-stone-800 dark:text-gray-300">
              <Mail className="h-4.5 w-4.5 text-stone-400 shrink-0" />
              <a href="mailto:support@bhagirathipg.com" className="hover:text-red-655 font-black select-all">support@bhagirathipg.com</a>
            </div>
          </div>
        </div>

        {/* Emergency Card */}
        <div className="bg-red-50/20 dark:bg-red-955/15 border border-red-200 dark:border-red-900/30 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-red-200 dark:border-red-900/20 select-none">
            <AlertTriangle className="h-5 w-5 text-red-650 shrink-0 animate-bounce" />
            <h3 className="font-black text-xs text-red-700 dark:text-red-400 uppercase tracking-wider">Emergency Services</h3>
          </div>

          <p className="text-xs text-red-700/80 dark:text-red-300/80 leading-relaxed font-semibold">
            In case of power failures, water pipe bursts, medical emergencies, or security alarms, contact the PG gate warden or manager directly.
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400">
              <PhoneCall className="h-4.5 w-4.5 shrink-0" />
              <a href="tel:+919999988888" className="hover:underline font-black select-all">+91 99999 88888 (24x7 Warden)</a>
            </div>
            <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400 select-none">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span className="font-black">On-campus Security Gate (Ext 101)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportPage;
