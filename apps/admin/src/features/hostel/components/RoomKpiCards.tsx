import React from "react";
import { Building2, BedDouble, Bed, Wrench, ChevronRight } from "lucide-react";

export interface RoomKpiStats {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceRooms: number;
  scopeLabel?: string;
}

interface RoomKpiCardsProps {
  stats: RoomKpiStats;
  isLoading?: boolean;
  onCardClick?: (cardType: "rooms" | "occupied" | "available" | "maintenance") => void;
}

export const RoomKpiCards: React.FC<RoomKpiCardsProps> = ({
  stats,
  isLoading = false,
  onCardClick,
}) => {
  const {
    totalRooms = 0,
    totalBeds = 0,
    occupiedBeds = 0,
    availableBeds = 0,
    maintenanceRooms = 0,
    scopeLabel = "Across all hostels",
  } = stats;

  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : "0.00";
  const availableRate = totalBeds > 0 ? ((availableBeds / totalBeds) * 100).toFixed(2) : "0.00";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-md" />
                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded-md" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded-md" />
              </div>
            </div>
            <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 select-none">
      {/* 1. Total Rooms */}
      <div
        onClick={() => onCardClick?.("rooms")}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {totalRooms}
            </div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
              Total Rooms
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
              {scopeLabel}
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 shrink-0 transition" />
      </div>

      {/* 2. Occupied Beds */}
      <div
        onClick={() => onCardClick?.("occupied")}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BedDouble className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {occupiedBeds} <span className="text-base sm:text-lg font-medium text-gray-400">/ {totalBeds}</span>
            </div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
              Occupied Beds
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {occupancyRate}% Occupied
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 shrink-0 transition" />
      </div>

      {/* 3. Available Beds */}
      <div
        onClick={() => onCardClick?.("available")}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bed className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {availableBeds}
            </div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
              Available Beds
            </div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5 truncate">
              {availableRate}% Available
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 shrink-0 transition" />
      </div>

      {/* 4. Maintenance */}
      <div
        onClick={() => onCardClick?.("maintenance")}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Wrench className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {maintenanceRooms}
            </div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
              Maintenance
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
              Rooms under maintenance
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 shrink-0 transition" />
      </div>
    </div>
  );
};
