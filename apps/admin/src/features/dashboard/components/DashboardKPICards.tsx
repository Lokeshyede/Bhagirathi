import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DoorOpen,
  BedDouble,
  CheckCircle2,
  IndianRupee,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@bhagirathi/utils";
import { DashboardStatisticsData } from "../types";

interface DashboardKPICardsProps {
  stats: DashboardStatisticsData;
}

export const DashboardKPICards: React.FC<DashboardKPICardsProps> = ({ stats }) => {
  const navigate = useNavigate();

  const totalBeds = stats.total_beds;
  const occupiedBeds = stats.occupied_beds;
  const vacantBeds = stats.vacant_beds;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const collectedRent = stats.collected_rent;
  const expectedRent = stats.monthly_rent;
  const pendingRent = stats.pending_rent;
  const advanceRent = stats.advance_rent;
  const rawCollectionRate = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;
  const displayCollectionRate = Math.min(100, rawCollectionRate);

  const kpis = [
    {
      title: "Total Rooms",
      value: stats.total_rooms,
      subtext: `${stats.total_buildings} Buildings active`,
      icon: <DoorOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40",
      accentBorder: "hover:border-blue-300 dark:hover:border-blue-800",
      link: "/rooms",
      linkText: "View Rooms",
    },
    {
      title: "Occupied Beds",
      value: `${occupiedBeds} / ${totalBeds}`,
      subtext: `${occupancyRate}% Total occupancy`,
      icon: <BedDouble className="h-5 w-5 text-primary" />,
      iconBg: "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40",
      accentBorder: "hover:border-red-300 dark:hover:border-red-800",
      link: "/rooms",
      linkText: "Bed Grid",
    },
    {
      title: "Available Beds",
      value: vacantBeds,
      subtext: "Ready for check-in",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40",
      accentBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
      link: "/rooms",
      linkText: "Allocate",
    },
    {
      title: "Rent Collected",
      value: formatCurrency(collectedRent).split(".00")[0],
      subtext: advanceRent > 0 ? `+${formatCurrency(advanceRent).split(".00")[0]} Overpaid` : `${displayCollectionRate}% Collection rate`,
      icon: <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40",
      accentBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
      link: "/payments",
      linkText: "Receipts",
    },
    {
      title: "Outstanding Rent",
      value: formatCurrency(pendingRent).split(".00")[0],
      subtext: `${stats.pending_payments} Dues pending`,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800/40",
      accentBorder: "hover:border-amber-300 dark:hover:border-amber-800",
      link: "/rent/cash-collection",
      linkText: "Collect",
    },
    {
      title: "Open Complaints",
      value: stats.open_complaints,
      subtext: `${stats.resolved_complaints} Resolved so far`,
      icon: <ShieldAlert className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      iconBg: "bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-800/40",
      accentBorder: "hover:border-purple-300 dark:hover:border-purple-800",
      link: "/complaints",
      linkText: "Resolve",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 select-none">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.04 }}
          onClick={() => navigate(kpi.link)}
          className={`bg-white dark:bg-gray-900 border border-border dark:border-gray-800 ${kpi.accentBorder} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
        >
          {/* Top Row: Icon + Label */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center border ${kpi.iconBg} transition-transform group-hover:scale-105`}
              >
                {kpi.icon}
              </div>
            </div>

            <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-wider block truncate">
              {kpi.title}
            </span>

            <h3 className="text-lg sm:text-xl font-black text-primaryText dark:text-white tracking-tight tabular-nums mt-1 truncate">
              {kpi.value}
            </h3>
          </div>

          {/* Bottom Row: Subtext & Mini Action */}
          <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-secondaryText dark:text-gray-400 font-semibold truncate max-w-[110px]">
              {kpi.subtext}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardKPICards;
