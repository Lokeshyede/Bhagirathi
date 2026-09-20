import React from "react";
import { HelpCircle, Activity, CheckCircle2, Flame } from "lucide-react";
import { ComplaintDashboardStats } from "@bhagirathi/types";

interface StatisticsCardsProps {
  stats?: ComplaintDashboardStats;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  const openCount = stats?.openCount ?? 0;
  const assignedCount = stats?.assignedCount ?? 0;
  const inProgressCount = stats?.inProgressCount ?? 0;
  const resolvedCount = stats?.resolvedCount ?? 0;
  const criticalCount = stats?.criticalCount ?? 0;

  const cards = [
    {
      title: "Open Issues",
      value: openCount,
      subtitle: "Unassigned submissions",
      icon: <HelpCircle className="h-5 w-5 text-warning" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
      accentLeft: "border-l-warning/70",
    },
    {
      title: "In Progress",
      value: assignedCount + inProgressCount,
      subtitle: `${assignedCount} assigned · ${inProgressCount} active`,
      icon: <Activity className="h-5 w-5 text-info" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      accentLeft: "border-l-info/70",
    },
    {
      title: "Resolved",
      value: resolvedCount,
      subtitle: "Successfully closed tickets",
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      iconBg: "bg-green-50 dark:bg-green-950/20",
      accentLeft: "border-l-success/70",
    },
    {
      title: "Critical",
      value: criticalCount,
      subtitle: "Immediate action required",
      icon: <Flame className="h-5 w-5 text-danger" />,
      iconBg: "bg-red-50 dark:bg-red-950/20",
      accentLeft: "border-l-danger/70",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`
            bg-white dark:bg-gray-900
            border border-border dark:border-gray-800
            border-l-[3px] ${card.accentLeft}
            rounded-card shadow-card p-3.5 sm:p-4
            hover:shadow-card-hover hover:-translate-y-0.5
            transition-all duration-200 cursor-default
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest mb-1.5 truncate">
                {card.title}
              </p>
              <div className="text-2xl font-black text-primaryText dark:text-white tabular-nums">
                {card.value}
              </div>
              <p className="text-[10px] text-muted dark:text-gray-600 mt-1">{card.subtitle}</p>
            </div>
            <div className={`p-2.5 rounded-icon flex-shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
