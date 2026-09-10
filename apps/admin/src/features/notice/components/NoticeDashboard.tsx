import React from "react";
import { NoticeDashboardStats } from "@bhagirathi/types";
import { Mail, Clock, Eye, FileText } from "lucide-react";


interface NoticeDashboardProps {
  stats?: NoticeDashboardStats;
}

export const NoticeDashboard: React.FC<NoticeDashboardProps> = ({ stats }) => {
  const total = stats?.totalCount ?? 0;
  const active = stats?.activeCount ?? 0;
  const scheduled = stats?.scheduledCount ?? 0;
  const draft = stats?.draftCount ?? 0;
  const overallRate = stats?.overallReadRate ?? 0;

  const cards = [
    {
      title: "Total Notices",
      value: total,
      subtitle: `${draft} in draft`,
      icon: <FileText className="h-5 w-5 text-secondaryText" />,
      iconBg: "bg-gray-100 dark:bg-gray-800",
      accentLeft: "border-l-muted/70",
    },
    {
      title: "Published",
      value: active,
      subtitle: "Visible to tenants now",
      icon: <Mail className="h-5 w-5 text-success" />,
      iconBg: "bg-green-50 dark:bg-green-950/20",
      accentLeft: "border-l-success/70",
    },
    {
      title: "Scheduled",
      value: scheduled,
      subtitle: "Awaiting publish timer",
      icon: <Clock className="h-5 w-5 text-info" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      accentLeft: "border-l-info/70",
    },
    {
      title: "Read Rate",
      value: `${overallRate}%`,
      subtitle: "Audience engagement",
      icon: <Eye className="h-5 w-5 text-warning" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
      accentLeft: "border-l-warning/70",
      showProgress: true,
      progressVal: overallRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`
            bg-white dark:bg-gray-900
            border border-border dark:border-gray-800
            border-l-[3px] ${card.accentLeft}
            rounded-card shadow-card p-4
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

          {card.showProgress && (
            <div className="mt-3 pt-2.5 border-t border-border/50 dark:border-gray-800/50">
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(card.progressVal ?? 0, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NoticeDashboard;
