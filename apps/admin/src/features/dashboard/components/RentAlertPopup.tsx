/**
 * RentAlertPopup — Morning Login Rent Alert Notification
 *
 * Shows once per browser session (sessionStorage) when admin logs in,
 * if there are any due-today or overdue tenants.
 *
 * Uses Framer Motion for smooth entrance/exit animation.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CircleDollarSign, AlertTriangle, Timer,
  TrendingUp, Users, ArrowRight, Bell,
} from "lucide-react";
import { useRentAlertSummary } from "../../rent_collection/hooks/useRentCollection";

const SESSION_KEY = "rent_alert_popup_dismissed";

const fmt = (n?: number | null) =>
  n != null
    ? `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "—";

export const RentAlertPopup: React.FC = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useRentAlertSummary();
  const [visible, setVisible] = useState(false);

  // Show popup once per session if there are any alerts
  useEffect(() => {
    if (isLoading || !summary) return;

    const alreadyDismissed = sessionStorage.getItem(SESSION_KEY);
    if (alreadyDismissed) return;

    const hasAlerts = summary.total_due_today > 0 || summary.total_overdue > 0;
    if (hasAlerts) {
      // Small delay so it doesn't flash immediately on page load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [summary, isLoading]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  };

  const handleViewAll = () => {
    handleDismiss();
    navigate("/rent/cash-collection");
  };

  if (!summary) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            id="rent-alert-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[9000]"
          />

          {/* Popup Card */}
          <motion.div
            id="rent-alert-popup"
            initial={{ opacity: 0, scale: 0.92, y: -24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -12 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed top-[6%] sm:top-[10%] left-1/2 -translate-x-1/2 z-[9001] w-[calc(100%-1.5rem)] max-w-md"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden">

              {/* Header gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

              {/* Content */}
              <div className="p-4 sm:p-6">
                {/* Title row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-950/30 rounded-xl">
                      <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{greeting}!</p>
                      <h2 className="text-base font-extrabold text-primaryText dark:text-white">
                        Today's Rent Collection
                      </h2>
                    </div>
                  </div>
                  <button
                    id="rent-alert-popup-close"
                    onClick={handleDismiss}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Alert Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Due Today */}
                  <div className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-lg shrink-0">
                      <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Due Today</p>
                      <p className="text-xl font-black text-amber-700 dark:text-amber-300 leading-none">
                        {summary.total_due_today}
                      </p>
                      <p className="text-[10px] font-semibold text-amber-600/70 dark:text-amber-500 truncate">
                        {fmt(summary.total_due_today_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Overdue */}
                  <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
                    <div className="p-2 bg-red-100 dark:bg-red-950/40 rounded-lg shrink-0">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Overdue</p>
                      <p className="text-xl font-black text-red-700 dark:text-red-300 leading-none">
                        {summary.total_overdue}
                      </p>
                      <p className="text-[10px] font-semibold text-red-600/70 dark:text-red-500 truncate">
                        {fmt(summary.total_overdue_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Expected Collection */}
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Expected</p>
                      <p className="text-base font-black text-emerald-700 dark:text-emerald-300 leading-none truncate">
                        {fmt(summary.expected_collection)}
                      </p>
                    </div>
                  </div>

                  {/* Tenants */}
                  <div className="flex items-center gap-3 p-3.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/40 rounded-lg shrink-0">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Tenants</p>
                      <p className="text-xl font-black text-purple-700 dark:text-purple-300 leading-none">
                        {summary.tenant_count}
                      </p>
                      <p className="text-[10px] font-semibold text-purple-600/70 dark:text-purple-500">affected</p>
                    </div>
                  </div>
                </div>

                {/* Date info */}
                <p className="text-[10px] text-center text-muted mb-4">
                  As of {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    id="rent-alert-popup-view-all"
                    onClick={handleViewAll}
                    className="flex-1 h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <CircleDollarSign className="h-4 w-4" />
                    View Collection List
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    id="rent-alert-popup-dismiss"
                    onClick={handleDismiss}
                    className="h-10 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-muted text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RentAlertPopup;
