import React from "react";
import { motion } from "framer-motion";

// ─── Summary Card ─────────────────────────────────────────────────────────────
interface SummaryItem {
  label: string;
  value: string | number;
  color?: string;
}

interface SummaryCardProps {
  title: string;
  items: SummaryItem[];
  icon?: React.ReactNode;
  delay?: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title, items, icon, delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
  >
    <div className="flex items-center gap-2 mb-4">
      {icon && (
        <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h3>
    </div>

    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
          <span
            className={`text-sm font-semibold ${
              item.color || "text-gray-900 dark:text-white"
            }`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

// ─── Summary Cards Grid ───────────────────────────────────────────────────────
interface SummaryCardsProps {
  cards: SummaryCardProps[];
  columns?: 2 | 3 | 4;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  cards, columns = 3,
}) => {
  const gridClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {cards.map((card, i) => (
        <SummaryCard key={card.title} {...card} delay={i * 0.06} />
      ))}
    </div>
  );
};
