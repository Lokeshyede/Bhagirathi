import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";
import { formatCurrency } from "@bhagirathi/utils";
import { DashboardStatisticsData, DashboardChartsData } from "../types";

interface DashboardRentOverviewCardProps {
  stats: DashboardStatisticsData;
  charts?: DashboardChartsData;
}

export const DashboardRentOverviewCard: React.FC<DashboardRentOverviewCardProps> = ({
  stats,
  charts,
}) => {
  const collectedRent = stats.collected_rent;
  const expectedRent = stats.monthly_rent;
  const advanceRent = stats.advance_rent;
  const rawCollectionRate = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;
  const displayCollectionRate = Math.min(100, rawCollectionRate);
  const pendingRent = stats.pending_rent;

  // Monthly collection trend data from backend charts
  const trendData = charts?.monthly_rent_collection || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4 select-none flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-150/70 dark:border-gray-800">
        <div>
          <h3 className="font-black text-sm text-primaryText dark:text-white uppercase tracking-wider">
            Rent Overview
          </h3>
          <p className="text-[11px] text-muted dark:text-gray-400 mt-0.5">
            Billing collection & revenue realization
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
            displayCollectionRate >= 80
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              displayCollectionRate >= 80 ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {advanceRent > 0 ? "OVER COLLECTED" : `${displayCollectionRate}% Realized`}
        </span>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Expected Rent */}
        <div className="p-3 rounded-xl bg-gray-50/60 dark:bg-gray-950/30 border border-border dark:border-gray-800">
          <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-wider block truncate">
            Expected Rent
          </span>
          <span className="text-sm sm:text-base font-black text-primaryText dark:text-white tabular-nums block mt-1 truncate">
            {formatCurrency(expectedRent).split(".00")[0]}
          </span>
          <span className="text-[10px] text-secondaryText dark:text-gray-400 font-semibold block mt-0.5">
            Active cycle
          </span>
        </div>

        {/* Collected Rent */}
        <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30">
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block truncate">
            Collected Rent
          </span>
          <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums block mt-1 truncate">
            {formatCurrency(collectedRent).split(".00")[0]}
          </span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-semibold block mt-0.5">
            {advanceRent > 0 ? `+${formatCurrency(advanceRent).split(".00")[0]} Advance` : `${displayCollectionRate}% Rate`}
          </span>
        </div>

        {/* Outstanding Rent */}
        <div className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
          <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block truncate">
            Outstanding
          </span>
          <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 tabular-nums block mt-1 truncate">
            {formatCurrency(pendingRent).split(".00")[0]}
          </span>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-semibold block mt-0.5">
            {pendingRent > 0 ? (expectedRent > 0 ? `${Math.round((pendingRent / expectedRent) * 100)}% Pending` : "Pending") : "Fully Paid"}
          </span>
        </div>

        {/* Advance / Credit */}
        <div className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30">
          <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider block truncate">
            Advance / Credit
          </span>
          <span className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 tabular-nums block mt-1 truncate">
            {formatCurrency(advanceRent).split(".00")[0]}
          </span>
          <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80 font-semibold block mt-0.5">
            Overpaid amount
          </span>
        </div>
      </div>

      {/* Progress Bar & Mini Trend Chart */}
      <div className="space-y-3 pt-2">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-secondaryText dark:text-gray-400">
            <span>Collection Realization</span>
            <span className="tabular-nums font-black text-primaryText dark:text-white">
              {displayCollectionRate}% ({formatCurrency(Math.min(collectedRent, expectedRent)).split(".00")[0]} / {formatCurrency(expectedRent).split(".00")[0]})
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                displayCollectionRate >= 80 ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${displayCollectionRate}%` }}
            />
          </div>
          {advanceRent > 0 && (
            <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 pt-1">
              + {formatCurrency(advanceRent).split(".00")[0]} advance / excess payment
            </div>
          )}
        </div>

        {/* Historical Trend Chart (if data exists) */}
        {trendData.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-widest block mb-1.5">
              Recent Monthly Trend
            </span>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value).split(".00")[0], "Collected"]}
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {trendData.map((_, idx) => (
                      <Cell
                        key={`bar-${idx}`}
                        fill={idx === trendData.length - 1 ? "#DC2626" : "#E5E7EB"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardRentOverviewCard;
