import React from "react";
import { cn } from "../../design-system/utils";

// 1. RE-EXPORTS FROM CARDS TO AVOID CODE DUPLICATION
export { KPICard, StatisticsCard } from "../cards";
export type { KPICardProps, StatisticsCardProps } from "../cards";

// 2. STATS GRID LAYOUT
export interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  className,
  columns = 4,
}) => {
  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4.5 w-full",
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
};

export default StatsGrid;
