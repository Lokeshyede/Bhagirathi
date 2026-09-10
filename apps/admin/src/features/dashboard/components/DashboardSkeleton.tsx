import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 pb-8 select-none">
      {/* 1. Header Filter Row */}
      <div className="h-16 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 flex justify-between items-center px-5">
        <div className="h-3 w-32 bg-gray-150 dark:bg-gray-800 rounded pg-skeleton" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-gray-150 dark:bg-gray-800 rounded pg-skeleton" />
          <div className="h-9 w-9 bg-gray-150 dark:bg-gray-800 rounded pg-skeleton" />
        </div>
      </div>

      {/* 2. Welcome Banner */}
      <div className="h-28 rounded-card bg-gray-100 dark:bg-gray-900/60 border border-border dark:border-gray-800 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1">
          <div className="h-12 w-12 rounded-icon bg-gray-250 dark:bg-gray-800 pg-skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-40 bg-gray-250 dark:bg-gray-800 rounded pg-skeleton" />
            <div className="h-5 w-64 bg-gray-250 dark:bg-gray-800 rounded pg-skeleton" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 w-24 bg-gray-250 dark:bg-gray-800 rounded pg-skeleton" />
          <div className="h-3.5 w-32 bg-gray-250 dark:bg-gray-800 rounded pg-skeleton" />
        </div>
      </div>

      {/* 3. Quick Actions (10 items) */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5">
        <div className="h-3.5 w-28 bg-gray-150 dark:bg-gray-800 rounded mb-4 pg-skeleton" />
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 rounded-card bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-850 pg-skeleton" />
          ))}
        </div>
      </div>

      {/* 4. KPI Cards (12 items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-border dark:border-gray-850 rounded-card p-5 h-28 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-2.5 w-16 bg-gray-150 dark:bg-gray-800 rounded pg-skeleton" />
                <div className="h-6 w-20 bg-gray-250 dark:bg-gray-800 rounded pg-skeleton" />
              </div>
              <div className="h-9 w-9 rounded-xl bg-gray-150 dark:bg-gray-800 pg-skeleton" />
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-850 rounded pg-skeleton mt-2" />
          </div>
        ))}
      </div>

      {/* 5. Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 p-5 pg-skeleton" />
            ))}
          </div>

          {/* Occupancy and Complaint Overview */}
          <div className="h-64 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
          <div className="h-64 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />

          {/* Tables skeletons */}
          <div className="h-72 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
          <div className="h-72 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
        </div>

        {/* Right Side (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-44 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
          <div className="h-56 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
          <div className="h-32 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
          <div className="h-60 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800 pg-skeleton" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
