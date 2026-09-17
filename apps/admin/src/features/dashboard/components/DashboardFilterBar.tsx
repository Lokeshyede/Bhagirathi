import React, { useState, useMemo } from "react";
import {
  Filter,
  Search,
  X,
  RefreshCw,
  RotateCcw,
  ChevronDown,
  Home,
  Building2,
  DoorOpen,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";
import { Hostel, Building, Room } from "@bhagirathi/types";

export interface DashboardFilterBarProps {
  hostels?: Hostel[];
  buildings?: Building[];
  rooms?: Room[];
  hostelId: string;
  buildingId: string;
  roomId?: string;
  status: string;
  dateRange: string;
  search?: string;
  onHostelChange: (id: string) => void;
  onBuildingChange: (id: string) => void;
  onRoomChange?: (id: string) => void;
  onStatusChange: (status: string) => void;
  onDateRangeChange: (range: string) => void;
  onSearchChange?: (search: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

interface FilterDropdownProps {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  className?: string;
  iconColor?: string;
  ariaLabel?: string;
}

/**
 * Custom Dropdown adhering to:
 * <div className="...">
 *   <div className="flex items-center gap-2 min-w-0">
 *     <Icon className="shrink-0 ..." />
 *     <span className="truncate">All Hostels</span>
 *   </div>
 *   <ChevronDown className="shrink-0 ..." />
 * </div>
 *
 * Uses flex layout with zero absolute icon/text overlap.
 * An invisible native <select> overlays the component for 100% native mobile accessibility.
 */
const FilterDropdown: React.FC<FilterDropdownProps> = ({
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  iconColor = "text-gray-500 dark:text-gray-400",
  ariaLabel,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      className={`relative flex items-center justify-between gap-2 px-3 h-11 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl transition-all focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 select-none ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-gray-300 dark:hover:border-gray-700"
      } ${className}`}
    >
      {/* Icon + Text in flex container with gap (NO absolute overlap) */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none">
        <Icon className={`shrink-0 h-4 w-4 ${iconColor}`} />
        <span className="truncate text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
          {displayLabel}
        </span>
      </div>

      {/* Far-right Chevron */}
      <ChevronDown className="shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none ml-1" />

      {/* Invisible functional select overlay for native touch & keyboard access */}
      <select
        aria-label={ariaLabel || placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  hostels = [],
  buildings = [],
  rooms = [],
  hostelId,
  buildingId,
  roomId = "",
  status,
  dateRange,
  search = "",
  onHostelChange,
  onBuildingChange,
  onRoomChange,
  onStatusChange,
  onDateRangeChange,
  onSearchChange,
  onReset,
  onRefresh,
  isRefreshing = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [internalRoomId, setInternalRoomId] = useState("");

  const currentSearch = search !== undefined ? search : internalSearch;
  const currentRoomId = roomId !== undefined ? roomId : internalRoomId;

  const handleSearchChange = (val: string) => {
    setInternalSearch(val);
    onSearchChange?.(val);
  };

  const handleRoomChange = (val: string) => {
    setInternalRoomId(val);
    onRoomChange?.(val);
  };

  const activeFilters = useMemo(() => {
    const list: string[] = [];
    if (hostelId) list.push("hostel");
    if (buildingId) list.push("building");
    if (currentRoomId) list.push("room");
    if (currentSearch.trim()) list.push("search");
    if (status && status !== "ALL") list.push("status");
    if (dateRange && dateRange !== "30d") list.push("dateRange");
    return list;
  }, [hostelId, buildingId, currentRoomId, currentSearch, status, dateRange]);

  const hasActiveFilters = activeFilters.length > 0;
  const activeCount = activeFilters.length;

  // Real-time search filtering for dropdown choices
  const searchLower = currentSearch.toLowerCase().trim();

  const filteredHostels = useMemo(() => {
    if (!searchLower) return hostels;
    return hostels.filter((h) => h.name.toLowerCase().includes(searchLower));
  }, [hostels, searchLower]);

  const filteredBuildings = useMemo(() => {
    if (!searchLower) return buildings;
    return buildings.filter((b) => b.name.toLowerCase().includes(searchLower));
  }, [buildings, searchLower]);

  const filteredRooms = useMemo(() => {
    if (!searchLower) return rooms;
    return rooms.filter((r) =>
      r.room_number.toLowerCase().includes(searchLower)
    );
  }, [rooms, searchLower]);

  // Show secondary filters when toggled or when non-default values exist
  const showSecondaryFilters =
    isExpanded ||
    Boolean(status && status !== "ALL") ||
    Boolean(dateRange && dateRange !== "30d");

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-sm p-3.5 sm:p-4 md:p-4.5 w-full h-auto space-y-3 transition-all">
      {/* ── Row 1: Filters Button + Search Input + Refresh Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full">
        {/* Top controls on Mobile (<640px): Filters on Left, Refresh on Right */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          {/* Red Primary Filter Button */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label="Toggle filter options"
            aria-expanded={isExpanded}
            className="h-11 px-3.5 sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm tracking-wide inline-flex items-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/40 cursor-pointer shrink-0"
          >
            <Filter className="h-4 w-4 shrink-0 text-white" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-red-600 text-[10px] font-black leading-none">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 text-white/90 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Refresh Button on Mobile (visible only <640px next to Filter button) */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isRefreshing ? "animate-spin text-red-600" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none shrink-0" />
          <input
            id="dashboard-search-input"
            name="search"
            type="text"
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search hostel, building, room..."
            aria-label="Search hostel, building, or room"
            className="w-full h-11 pl-10 pr-10 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Clear and Refresh Buttons on Desktop / Tablet (sm+) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                handleSearchChange("");
                onReset();
              }}
              aria-label="Clear filters"
              title="Reset all filters to default"
              className="h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
            className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 shrink-0 transition-transform ${
                isRefreshing ? "animate-spin text-red-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Row 2: 3 Dropdowns (All Hostels, All Buildings, All Rooms) ── */}
      {/* Mobile: grid-cols-1 (stacked)
          Tablet: grid-cols-2 (compact multi-column)
          Desktop: grid-cols-3 (clean 3-column row)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full">
        {/* 1. All Hostels */}
        <FilterDropdown
          icon={Home}
          placeholder="All Hostels"
          value={hostelId}
          onChange={(val) => {
            onHostelChange(val);
            onBuildingChange("");
            handleRoomChange("");
          }}
          options={filteredHostels.map((h) => ({
            label: h.name,
            value: h.id,
          }))}
          iconColor="text-red-600 dark:text-red-500"
          ariaLabel="Filter by hostel"
        />

        {/* 2. All Buildings */}
        <FilterDropdown
          icon={Building2}
          placeholder="All Buildings"
          value={buildingId}
          onChange={(val) => {
            onBuildingChange(val);
            handleRoomChange("");
          }}
          options={filteredBuildings.map((b) => ({
            label: b.name,
            value: b.id,
          }))}
          disabled={!hostelId && buildings.length === 0}
          iconColor="text-gray-500 dark:text-gray-400"
          ariaLabel="Filter by building"
        />

        {/* 3. All Rooms */}
        <FilterDropdown
          icon={DoorOpen}
          placeholder="All Rooms"
          value={currentRoomId}
          onChange={handleRoomChange}
          options={filteredRooms.map((r) => ({
            label: `Room ${r.room_number}${r.room_type ? ` (${r.room_type})` : ""}`,
            value: r.id,
          }))}
          iconColor="text-gray-500 dark:text-gray-400"
          ariaLabel="Filter by room"
        />
      </div>

      {/* ── Secondary Row: Status & Date Range (Only rendered when needed) ── */}
      {/* Does NOT force empty space across the row on desktop */}
      {showSecondaryFilters && (
        <div className="pt-2.5 border-t border-gray-150/70 dark:border-gray-800/80 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Status Filter */}
          <div className="w-full sm:w-[220px]">
            <FilterDropdown
              icon={SlidersHorizontal}
              placeholder="All Statuses"
              value={status}
              onChange={onStatusChange}
              options={[
                { label: "Available", value: "AVAILABLE" },
                { label: "Occupied", value: "OCCUPIED" },
                { label: "Maintenance", value: "MAINTENANCE" },
              ]}
              iconColor="text-gray-500 dark:text-gray-400"
              ariaLabel="Filter by status"
            />
          </div>

          {/* Date Range Filter */}
          <div className="w-full sm:w-[220px]">
            <FilterDropdown
              icon={Calendar}
              placeholder="Last 30 Days"
              value={dateRange}
              onChange={onDateRangeChange}
              options={[
                { label: "Last 7 Days", value: "7d" },
                { label: "Last 30 Days", value: "30d" },
                { label: "Last 90 Days", value: "90d" },
                { label: "All Time", value: "all" },
              ]}
              iconColor="text-gray-500 dark:text-gray-400"
              ariaLabel="Filter by date range"
            />
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                handleSearchChange("");
                onReset();
              }}
              aria-label="Reset all filters"
              className="h-11 px-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardFilterBar;
