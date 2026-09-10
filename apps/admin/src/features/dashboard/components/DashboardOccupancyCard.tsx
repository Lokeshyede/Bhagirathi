import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Users, BedDouble, CheckCircle2 } from "lucide-react";
import { DashboardStatisticsData } from "../types";

interface DashboardOccupancyCardProps {
  stats: DashboardStatisticsData;
  occupancyData?: any;
}

export const DashboardOccupancyCard: React.FC<DashboardOccupancyCardProps> = ({ stats }) => {
  const totalBeds = stats.total_beds;
  const occupiedBeds = stats.occupied_beds;
  const vacantBeds = stats.vacant_beds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const chartData = [
    { name: "Occupied Beds", value: occupiedBeds, color: "#DC2626" }, // primary red
    { name: "Available Beds", value: vacantBeds, color: "#10B981" }, // emerald green
  ].filter((d) => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4 select-none flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-150/70 dark:border-gray-800">
        <div>
          <h3 className="font-black text-sm text-primaryText dark:text-white uppercase tracking-wider">
            Occupancy Overview
          </h3>
          <p className="text-[11px] text-muted dark:text-gray-400 mt-0.5">
            Real-time allocation of beds and capacity
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {occupancyRate}% Allocated
        </span>
      </div>

      {/* Main Content: Donut Chart on Left + Breakdown on Right */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-auto">
        {/* Donut Chart (5 cols) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
          <div className="h-40 w-full relative flex items-center justify-center">
            {totalBeds === 0 ? (
              <div className="text-xs text-muted font-bold uppercase tracking-wider text-center">
                No beds created
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.length > 0 ? chartData : [{ name: "No Beds", value: 1, color: "#E5E7EB" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={chartData.length > 1 ? 3 : 0}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} Beds`, ""]}
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Center Stats Overlay */}
            {totalBeds > 0 && (
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-primaryText dark:text-white leading-none tracking-tight">
                  {occupancyRate}%
                </span>
                <span className="text-[9px] uppercase font-black text-muted dark:text-gray-400 tracking-wider mt-1">
                  Occupancy
                </span>
                <span className="text-[10px] font-bold text-secondaryText dark:text-gray-400 mt-0.5">
                  {occupiedBeds}/{totalBeds} beds
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Stats (7 cols) */}
        <div className="sm:col-span-7 space-y-2.5">
          {/* Occupied Beds Row */}
          <div className="p-3 bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-wider block">
                  Occupied Beds
                </span>
                <span className="text-xs font-bold text-primaryText dark:text-gray-200">
                  Active allocations
                </span>
              </div>
            </div>
            <span className="text-base font-black text-red-600 dark:text-red-400 tabular-nums">
              {occupiedBeds}
            </span>
          </div>

          {/* Available Beds Row */}
          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-wider block">
                  Available Beds
                </span>
                <span className="text-xs font-bold text-primaryText dark:text-gray-200">
                  Ready for check-in
                </span>
              </div>
            </div>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {vacantBeds}
            </span>
          </div>

          {/* Total Capacity Row */}
          <div className="p-3 bg-gray-50/60 dark:bg-gray-950/30 border border-border dark:border-gray-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-secondaryText flex items-center justify-center shrink-0">
                <BedDouble className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-wider block">
                  Total Capacity
                </span>
                <span className="text-xs font-bold text-primaryText dark:text-gray-200">
                  {stats.total_rooms} Total Rooms
                </span>
              </div>
            </div>
            <span className="text-base font-black text-primaryText dark:text-white tabular-nums">
              {totalBeds} Beds
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOccupancyCard;
