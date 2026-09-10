import React from "react";
import { Inbox, RotateCcw } from "lucide-react";
import { Button } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface DashboardEmptyStateProps {
  onResetFilters?: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onResetFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card text-center transition-colors select-none"
    >
      <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-850 rounded-full text-gray-400 dark:text-gray-600 mb-4 shadow-sm">
        <Inbox className="h-10 w-10" />
      </div>
      <h3 className="text-base font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">
        No Dashboard Data Found
      </h3>
      <p className="text-xs text-muted dark:text-gray-550 max-w-sm mb-6 leading-relaxed">
        No records could be found matching your selected date range parameters. Please try adjusting your date filter boundaries or reload the dashboard assets.
      </p>
      {onResetFilters && (
        <Button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 cursor-pointer font-bold h-9.5 px-4"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Date Filters
        </Button>
      )}
    </motion.div>
  );
};

export default DashboardEmptyState;
