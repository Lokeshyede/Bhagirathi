import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "red" | "green" | "blue" | "amber" | "purple" | "gray";
  delay?: number;
}

const colorMap: Record<string, string> = {
  red:    "bg-red-50    dark:bg-red-950/20   text-red-600    dark:text-red-400",
  green:  "bg-green-50  dark:bg-green-950/20 text-green-600  dark:text-green-400",
  blue:   "bg-blue-50   dark:bg-blue-950/20  text-blue-600   dark:text-blue-400",
  amber:  "bg-amber-50  dark:bg-amber-950/20 text-amber-600  dark:text-amber-400",
  purple: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400",
  gray:   "bg-gray-50   dark:bg-gray-800/50  text-gray-600   dark:text-gray-400",
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, trend, trendValue, color = "gray", delay = 0,
}) => {
  const iconClass = colorMap[color] || colorMap.gray;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow group overflow-hidden"
    >
      {/* Background glow */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${iconClass.split(" ")[0]}`} />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              {trend === "up"      && <TrendingUp   className="w-3 h-3 text-green-500" />}
              {trend === "down"    && <TrendingDown  className="w-3 h-3 text-red-500"   />}
              {trend === "neutral" && <Minus         className="w-3 h-3 text-gray-400"  />}
              <span className={`text-xs font-medium ${
                trend === "up" ? "text-green-600 dark:text-green-400" :
                trend === "down" ? "text-red-600 dark:text-red-400" :
                "text-gray-500 dark:text-gray-400"
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Statistics Grid ──────────────────────────────────────────────────────────
interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "red" | "green" | "blue" | "amber" | "purple" | "gray";
}

interface StatisticsCardsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  stats, columns = 4,
}) => {
  const gridClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} delay={i * 0.05} />
      ))}
    </div>
  );
};
