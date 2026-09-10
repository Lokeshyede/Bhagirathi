import React from "react";
import { formatCurrency } from "@bhagirathi/utils";
import { RentDashboardStats } from "@bhagirathi/types";
import { Wallet, Activity, CalendarClock, CreditCard, Landmark } from "lucide-react";

interface RentDashboardCardsProps {
  stats: RentDashboardStats;
}

export const RentDashboardCards: React.FC<RentDashboardCardsProps> = ({ stats }) => {
  const collectedRent = stats.collectedRent ?? (stats as any).total_collected ?? 0;
  const pendingRent = stats.pendingRent ?? (stats as any).total_pending_amount ?? 0;
  const overdueRent = stats.overdueRent ?? 0;
  const todayDue = stats.todayDue ?? 0;
  const totalDue = stats.totalDue ?? (stats as any).total_pending_amount ?? 0;
  const collectionPercentage = stats.collectionPercentage ?? (stats as any).collection_rate ?? 0;
  const totalMonthlyRent = stats.totalMonthlyRent ?? (collectedRent + pendingRent);

  const cards = [
    { label: "Collection trend", value: formatCurrency(Number(totalMonthlyRent)), subtitle: `Eff. Rate: ${collectionPercentage}%`, icon: <Landmark className="h-5 w-5 text-red-655" />, bg: "bg-red-50 dark:bg-red-950/10" },
    { label: "Collected Rent", value: formatCurrency(Number(collectedRent)), subtitle: "Aggregate Payments", icon: <CreditCard className="h-5 w-5 text-green-600" />, bg: "bg-green-50 dark:bg-green-950/10" },
    { label: "Overdue Rent", value: formatCurrency(Number(overdueRent)), subtitle: "Past Due limit", icon: <CalendarClock className="h-5 w-5 text-red-600" />, bg: "bg-red-50 dark:bg-red-955/20" },
    { label: "Today's Due", value: formatCurrency(Number(todayDue)), subtitle: "Urgent Collections", icon: <Activity className="h-5 w-5 text-yellow-600" />, bg: "bg-yellow-50 dark:bg-yellow-950/10" },
    { label: "Total Outstanding", value: formatCurrency(Number(totalDue)), subtitle: "All Pending Bills", icon: <Wallet className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50 dark:bg-blue-950/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition cursor-default"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xxs font-bold text-gray-505 uppercase tracking-wider block" style={{ fontSize: "9px" }}>
              {card.label}
            </span>
            <div className={`p-1.5 rounded-lg ${card.bg}`}>
              {card.icon}
            </div>
          </div>
          <div>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white block mt-1 truncate">
              {card.value}
            </span>
            <span className="text-xxs text-gray-400 font-medium block mt-1">
              {card.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default RentDashboardCards;
