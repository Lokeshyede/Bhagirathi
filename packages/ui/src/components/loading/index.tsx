import React from "react";
import { cn } from "../../design-system/utils";

// Shimmer block
export const Shimmer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "bg-gradient-to-r from-gray-200 via-gray-250 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg dark:from-gray-800 dark:via-gray-750 dark:to-gray-800",
      className
    )}
    {...props}
  />
);

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
}

// Spinner loading component
export const Spinner: React.FC<SpinnerProps> = ({ 
  className, 
  size = "md",
  ...props 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 stroke-[3px]",
    md: "h-6 w-6 stroke-[2px]",
    lg: "h-8 w-8 stroke-[2px]",
  };

  return (
    <svg
      className={cn("animate-spin text-primary shrink-0", sizeClasses[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};


// 1. CARD SKELETON
export const CardSkeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-6 bg-white border border-border rounded-card space-y-4 dark:bg-gray-900 dark:border-gray-800", className)} {...props}>
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-1/2">
        <Shimmer className="h-3 w-1/3" />
        <Shimmer className="h-8 w-3/4" />
      </div>
      <Shimmer className="h-10 w-10 rounded-xl" />
    </div>
    <div className="pt-4 border-t border-divider dark:border-gray-800 space-y-2">
      <Shimmer className="h-2 w-full" />
      <Shimmer className="h-3.5 w-1/2" />
    </div>
  </div>
);

// 2. TABLE CARD SKELETON
export interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns = 5, rows = 5, className, ...props }) => (
  <div className={cn("w-full border border-border bg-white rounded-card p-5 space-y-4.5 dark:bg-gray-900 dark:border-gray-800", className)} {...props}>
    <div className="flex justify-between items-center pb-2">
      <Shimmer className="h-6 w-1/4" />
      <div className="flex gap-2">
        <Shimmer className="h-8 w-32 rounded-input" />
        <Shimmer className="h-8 w-20 rounded-input" />
      </div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Shimmer
              key={cIdx}
              className={cn(
                "h-5",
                cIdx === 0 ? "w-1/4" : "w-1/6 flex-1"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const TableCardSkeleton = TableSkeleton;

// 3. CHART SKELETON
export const ChartSkeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-5 bg-white border border-border rounded-card space-y-4 dark:bg-gray-900 dark:border-gray-800", className)} {...props}>
    <div className="space-y-2">
      <Shimmer className="h-3.5 w-1/4" />
      <Shimmer className="h-3 w-1/3" />
    </div>
    <div className="h-40 flex items-end gap-3 px-4 pt-4">
      {[40, 70, 45, 90, 60, 80, 50, 75, 95, 65].map((h, idx) => (
        <Shimmer
          key={idx}
          className="w-full rounded-t-lg"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </div>
);

// 4. TREE SKELETON
export const TreeSkeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-5 bg-white border border-border rounded-card space-y-4.5 dark:bg-gray-900 dark:border-gray-800", className)} {...props}>
    {[0, 1, 2, 3].map((item) => (
      <div key={item} className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <Shimmer className="h-4 w-4 rounded-md" />
          <Shimmer className="h-4 w-32" />
        </div>
        <div className="pl-6 flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <Shimmer className="h-3.5 w-3.5 rounded-md" />
            <Shimmer className="h-3.5 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="h-3.5 w-3.5 rounded-md" />
            <Shimmer className="h-3.5 w-28" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 5. PAGE SKELETON
export const PageSkeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex h-screen bg-background w-full dark:bg-gray-950", className)} {...props}>
    {/* Sidebar Shimmer */}
    <div className="w-64 border-r border-border bg-white p-4.5 flex flex-col gap-6 shrink-0 dark:bg-gray-900 dark:border-gray-850">
      <Shimmer className="h-8 w-2/3 mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Shimmer className="h-5 w-5 rounded-lg" />
          <Shimmer className="h-4 w-1/2" />
        </div>
      ))}
    </div>

    {/* Content Area */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Header Shimmer */}
      <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between dark:bg-gray-900 dark:border-gray-850">
        <Shimmer className="h-4 w-32" />
        <div className="flex items-center gap-3">
          <Shimmer className="h-8 w-8 rounded-full" />
          <Shimmer className="h-4 w-20" />
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Major table layout */}
        <TableSkeleton columns={4} rows={3} />
      </div>
    </div>
  </div>
);

// 6. PROFILE SKELETON
export const ProfileSkeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-6 bg-white border border-border rounded-card flex flex-col items-center space-y-4 max-w-sm dark:bg-gray-900 dark:border-gray-800", className)} {...props}>
    <Shimmer className="h-20 w-20 rounded-full" />
    <div className="space-y-2 w-full text-center flex flex-col items-center">
      <Shimmer className="h-4 w-2/3" />
      <Shimmer className="h-3 w-1/2" />
    </div>
    <div className="pt-4 border-t border-divider w-full space-y-3 dark:border-gray-800">
      <div className="flex justify-between">
        <Shimmer className="h-3.5 w-1/4" />
        <Shimmer className="h-3.5 w-1/2" />
      </div>
      <div className="flex justify-between">
        <Shimmer className="h-3.5 w-1/3" />
        <Shimmer className="h-3.5 w-1/3" />
      </div>
    </div>
  </div>
);
