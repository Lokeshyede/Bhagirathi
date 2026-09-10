import React from "react";
import { Users, UserCheck, UserMinus, ShieldAlert, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StatisticsCardsProps {
  stats: {
    total: number;
    active: number;
    checkedOut: number;
    inactive: number;
  };
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ stats }) => {
  const occupancyRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  const cards = [
    {
      label: "Total Onboarded",
      value: stats.total,
      icon: <Users className="h-6 w-6 text-red-500" />,
      iconBg: "bg-red-50/80 dark:bg-red-500/10",
      accentLeft: "from-red-500 to-rose-500",
      sub: "All time registrations",
    },
    {
      label: "Active Tenants",
      value: stats.active,
      icon: <UserCheck className="h-6 w-6 text-emerald-500" />,
      iconBg: "bg-emerald-50/80 dark:bg-emerald-500/10",
      accentLeft: "from-emerald-500 to-green-500",
      badge: `${occupancyRate}% rate`,
      badgeClass: "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
      sub: "Currently allocated",
    },
    {
      label: "Checked Out",
      value: stats.checkedOut,
      icon: <UserMinus className="h-6 w-6 text-blue-500" />,
      iconBg: "bg-blue-50/80 dark:bg-blue-500/10",
      accentLeft: "from-blue-500 to-cyan-500",
      sub: "Vacated beds",
    },
    {
      label: "Inactive",
      value: stats.inactive,
      icon: <ShieldAlert className="h-6 w-6 text-slate-500" />,
      iconBg: "bg-slate-100/80 dark:bg-slate-500/10",
      accentLeft: "from-slate-400 to-slate-500",
      sub: "Unlinked profiles",
    },
  ];

  return (
    <motion.div 
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
    >
      {cards.map((card) => (
        <motion.div
          variants={itemVariants}
          key={card.label}
          className="glass-card relative overflow-hidden rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300"
        >
          {/* Gradient Top Border */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.accentLeft}`} />
          
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 truncate">
                {card.label}
              </p>
              <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums drop-shadow-sm">
                {card.value}
              </div>
              {card.sub && (
                <p className="text-[10px] text-muted dark:text-gray-600 mt-1">{card.sub}</p>
              )}
            </div>
            <div className={`p-2.5 rounded-icon flex-shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          {card.badge && (
            <div className="mt-3 pt-2.5 border-t border-border/50 dark:border-gray-800/50">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-badge ${card.badgeClass}`}>
                <TrendingUp className="h-2.5 w-2.5" />
                {card.badge}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatisticsCards;
