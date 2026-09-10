import React from "react";
import { Filter, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@bhagirathi/ui";
import { Hostel, Building } from "@bhagirathi/types";

interface DashboardFilterBarProps {
  hostels?: Hostel[];
  buildings?: Building[];
  hostelId: string;
  buildingId: string;
  status: string;
  dateRange: string;
  onHostelChange: (id: string) => void;
  onBuildingChange: (id: string) => void;
  onStatusChange: (status: string) => void;
  onDateRangeChange: (range: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  hostels = [],
  buildings = [],
  hostelId,
  buildingId,
  status,
  dateRange,
  onHostelChange,
  onBuildingChange,
  onStatusChange,
  onDateRangeChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}) => {
  const hasActiveFilters = Boolean(hostelId || buildingId || (status && status !== "ALL") || (dateRange && dateRange !== "30d"));

  return (
    <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm px-4 py-3.5 select-none transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Filter Controls Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-secondaryText dark:text-gray-300 shrink-0">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-wider">Filters</span>
          </div>

          {/* Hostel Filter */}
          <select
            value={hostelId}
            onChange={(e) => {
              onHostelChange(e.target.value);
              onBuildingChange("");
            }}
            className="h-8.5 px-3 border border-border dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 text-xs font-bold text-primaryText dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0 min-w-[130px]"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Building Filter */}
          <select
            value={buildingId}
            onChange={(e) => onBuildingChange(e.target.value)}
            disabled={!hostelId}
            className="h-8.5 px-3 border border-border dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 text-xs font-bold text-primaryText dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0 min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-8.5 px-3 border border-border dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 text-xs font-bold text-primaryText dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0 min-w-[120px]"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {/* Date Range / Period */}
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="h-8.5 px-3 border border-border dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 text-xs font-bold text-primaryText dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0 min-w-[125px]"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Right: Reset & Refresh Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="h-8.5 px-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-secondaryText hover:text-primary text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset Filters to Default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}

          <Button
            variant="outline"
            onClick={onRefresh}
            className="h-8.5 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 text-secondaryText hover:text-primary transition-colors cursor-pointer"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilterBar;
