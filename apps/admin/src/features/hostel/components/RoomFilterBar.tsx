import React from "react";
import { Building2, Building, Layers, CircleDot, RotateCcw, Filter, Search, Edit2, Trash2 } from "lucide-react";
import { Hostel, Building as BuildingType, Floor } from "@bhagirathi/types";

export interface FilterState {
  hostelId: string;
  buildingId: string;
  floorId: string;
  status: string;
  search: string;
}

interface RoomFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
  hostels?: Hostel[];
  buildings?: BuildingType[];
  floors?: Floor[];
  isLoadingHierarchy?: boolean;
  onEditHostel?: (hostel: Hostel) => void;
  onDeleteHostel?: (hostel: Hostel) => void;
  onEditBuilding?: (building: BuildingType) => void;
  onDeleteBuilding?: (building: BuildingType) => void;
  onEditFloor?: (floor: Floor) => void;
  onDeleteFloor?: (floor: Floor) => void;
}

export const RoomFilterBar: React.FC<RoomFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  hostels = [],
  buildings = [],
  floors = [],
  isLoadingHierarchy = false,
  onEditHostel,
  onDeleteHostel,
  onEditBuilding,
  onDeleteBuilding,
  onEditFloor,
  onDeleteFloor,
}) => {
  // Cascading lists
  const availableBuildings = React.useMemo(() => {
    if (!filters.hostelId) return buildings;
    return buildings.filter((b) => b.hostel_id === filters.hostelId);
  }, [buildings, filters.hostelId]);

  const availableFloors = React.useMemo(() => {
    if (!filters.buildingId) {
      if (!filters.hostelId) return floors;
      const validBuildingIds = new Set(availableBuildings.map((b) => b.id));
      return floors.filter((f) => validBuildingIds.has(f.building_id));
    }
    return floors.filter((f) => f.building_id === filters.buildingId);
  }, [floors, filters.buildingId, filters.hostelId, availableBuildings]);

  const selectedHostelObj = hostels.find((h) => h.id === filters.hostelId);
  const selectedBuildingObj = availableBuildings.find((b) => b.id === filters.buildingId);
  const selectedFloorObj = availableFloors.find((f) => f.id === filters.floorId);

  const handleHostelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      hostelId: val,
      buildingId: "",
      floorId: "",
    });
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange({
      buildingId: val,
      floorId: "",
    });
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ floorId: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ status: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-xs space-y-3 select-none">
      {/* Search and Filters Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: 4 Select Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-1">
          {/* 1. Hostel Selector */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 focus-within:border-primary/50 transition">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block leading-none">
                PG / Hostel
              </label>
              <select
                value={filters.hostelId}
                onChange={handleHostelChange}
                disabled={isLoadingHierarchy}
                className="w-full bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer pt-0.5 truncate"
              >
                <option value="" className="dark:bg-gray-900">All Hostels & PGs</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id} className="dark:bg-gray-900">
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Contextual PG Actions if selected */}
            {selectedHostelObj && (
              <div className="flex items-center gap-1 shrink-0">
                {onEditHostel && (
                  <button
                    type="button"
                    onClick={() => onEditHostel(selectedHostelObj)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition cursor-pointer"
                    title={`Edit ${selectedHostelObj.name}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
                {onDeleteHostel && (
                  <button
                    type="button"
                    onClick={() => onDeleteHostel(selectedHostelObj)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition cursor-pointer"
                    title={`Delete ${selectedHostelObj.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Building Selector */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 focus-within:border-primary/50 transition">
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block leading-none">
                Building
              </label>
              <select
                value={filters.buildingId}
                onChange={handleBuildingChange}
                disabled={isLoadingHierarchy}
                className="w-full bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer pt-0.5 truncate"
              >
                <option value="" className="dark:bg-gray-900">All Buildings</option>
                {availableBuildings.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-gray-900">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Contextual Building Actions if selected */}
            {selectedBuildingObj && (
              <div className="flex items-center gap-1 shrink-0">
                {onEditBuilding && (
                  <button
                    type="button"
                    onClick={() => onEditBuilding(selectedBuildingObj)}
                    className="p-1 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded transition cursor-pointer"
                    title={`Edit ${selectedBuildingObj.name}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
                {onDeleteBuilding && (
                  <button
                    type="button"
                    onClick={() => onDeleteBuilding(selectedBuildingObj)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition cursor-pointer"
                    title={`Delete ${selectedBuildingObj.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. Floor Selector */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 focus-within:border-primary/50 transition">
            <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block leading-none">
                Floor
              </label>
              <select
                value={filters.floorId}
                onChange={handleFloorChange}
                disabled={isLoadingHierarchy}
                className="w-full bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer pt-0.5 truncate"
              >
                <option value="" className="dark:bg-gray-900">All Floors</option>
                {availableFloors.map((f) => (
                  <option key={f.id} value={f.id} className="dark:bg-gray-900">
                    {f.name} (Floor {f.floor_number})
                  </option>
                ))}
              </select>
            </div>
            {/* Contextual Floor Actions if selected */}
            {selectedFloorObj && (
              <div className="flex items-center gap-1 shrink-0">
                {onEditFloor && (
                  <button
                    type="button"
                    onClick={() => onEditFloor(selectedFloorObj)}
                    className="p-1 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 rounded transition cursor-pointer"
                    title={`Edit ${selectedFloorObj.name}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                )}
                {onDeleteFloor && (
                  <button
                    type="button"
                    onClick={() => onDeleteFloor(selectedFloorObj)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition cursor-pointer"
                    title={`Delete ${selectedFloorObj.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4. Status Selector */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 focus-within:border-primary/50 transition">
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <CircleDot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block leading-none">
                Status
              </label>
              <select
                value={filters.status}
                onChange={handleStatusChange}
                className="w-full bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer pt-0.5 truncate"
              >
                <option value="ALL" className="dark:bg-gray-900">All Statuses</option>
                <option value="AVAILABLE" className="dark:bg-gray-900">Available</option>
                <option value="PARTIAL" className="dark:bg-gray-900">Partially Occupied</option>
                <option value="OCCUPIED" className="dark:bg-gray-900">Occupied</option>
                <option value="MAINTENANCE" className="dark:bg-gray-900">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: Search Input + Clear + Apply Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative min-w-[180px] sm:min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search room, tenant..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60 text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={onClearFilters}
            type="button"
            className="h-10 px-3 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition inline-flex items-center gap-1.5 cursor-pointer"
            title="Clear all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          {/* Apply Filters Button */}
          <button
            onClick={onApplyFilters}
            type="button"
            className="h-10 px-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/40 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomFilterBar;
