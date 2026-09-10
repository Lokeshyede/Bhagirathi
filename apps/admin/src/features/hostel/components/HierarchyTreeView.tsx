import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Building,
  Building2,
  Layers,
  DoorOpen,
  Bed,
  Plus,
  Edit2,
  Trash2,
  Eye,
  User,
} from "lucide-react";
import { Hostel, Building as BuildingType, Floor, Room } from "@bhagirathi/types";
import { formatCurrency } from "@bhagirathi/utils";
import { useRoomAvailability } from "../hooks/api/useHostel";

interface HierarchyTreeViewProps {
  hostels: Hostel[];
  buildings: BuildingType[];
  floors: Floor[];
  rooms: Room[];
  onAddBuilding: (hostel: Hostel) => void;
  onEditHostel: (hostel: Hostel) => void;
  onDeleteHostel: (hostel: Hostel) => void;
  onAddFloor: (building: BuildingType) => void;
  onEditBuilding: (building: BuildingType) => void;
  onDeleteBuilding: (building: BuildingType) => void;
  onAddRoom: (floor: Floor) => void;
  onEditFloor: (floor: Floor) => void;
  onDeleteFloor: (floor: Floor) => void;
  onAddBed: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  onViewRoom: (room: Room) => void;
  onDeleteBed?: (bedId: string, bedNumber: string) => void;
}

export const HierarchyTreeView: React.FC<HierarchyTreeViewProps> = ({
  hostels,
  buildings,
  floors,
  rooms,
  onAddBuilding,
  onEditHostel,
  onDeleteHostel,
  onAddFloor,
  onEditBuilding,
  onDeleteBuilding,
  onAddRoom,
  onEditFloor,
  onDeleteFloor,
  onAddBed,
  onEditRoom,
  onDeleteRoom,
  onViewRoom,
}) => {
  // Expansion state for tree nodes
  const [expandedHostels, setExpandedHostels] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    hostels.forEach((h) => (init[h.id] = true)); // default open hostels
    return init;
  });
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    buildings.forEach((b) => (init[b.id] = true)); // default open buildings
    return init;
  });
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

  // Optimized flat bed availability query
  const { data: availabilityData } = useRoomAvailability();

  const toggleHostel = (id: string) => {
    setExpandedHostels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBuilding = (id: string) => {
    setExpandedBuildings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFloor = (id: string) => {
    setExpandedFloors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRoom = (id: string) => {
    setExpandedRooms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allH: Record<string, boolean> = {};
    hostels.forEach((h) => (allH[h.id] = true));
    setExpandedHostels(allH);

    const allB: Record<string, boolean> = {};
    buildings.forEach((b) => (allB[b.id] = true));
    setExpandedBuildings(allB);

    const allF: Record<string, boolean> = {};
    floors.forEach((f) => (allF[f.id] = true));
    setExpandedFloors(allF);

    const allR: Record<string, boolean> = {};
    rooms.forEach((r) => (allR[r.id] = true));
    setExpandedRooms(allR);
  };

  const collapseAll = () => {
    setExpandedHostels({});
    setExpandedBuildings({});
    setExpandedFloors({});
    setExpandedRooms({});
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-850/40">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Property Structure Tree</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              (PG → Building → Floor → Room → Bed)
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium transition cursor-pointer"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 font-medium transition cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {hostels.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No Hostels/PGs added yet. Click <strong>[+ Add PG]</strong> above to start building your hierarchy.
          </div>
        ) : (
          hostels.map((hostel) => {
            const isHostelOpen = !!expandedHostels[hostel.id];
            const hostelBuildings = buildings.filter((b) => b.hostel_id === hostel.id);

            return (
              <div
                key={hostel.id}
                className="border border-blue-100 dark:border-blue-950/40 rounded-xl overflow-hidden bg-blue-50/20 dark:bg-blue-950/10"
              >
                {/* PG Level Row */}
                <div className="p-3 sm:p-4 bg-blue-50/60 dark:bg-blue-950/30 flex items-center justify-between gap-3 select-none">
                  <div
                    onClick={() => toggleHostel(hostel.id)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                  >
                    <button className="text-blue-600 dark:text-blue-400 p-0.5">
                      {isHostelOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <Building className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {hostel.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                          {hostel.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({hostelBuildings.length} {hostelBuildings.length === 1 ? "Building" : "Buildings"})
                        </span>
                      </div>
                      {hostel.address && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {hostel.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PG Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onAddBuilding(hostel)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      title="Add Building under this PG"
                    >
                      <Plus className="h-3 w-3" />
                      <span className="hidden sm:inline">Add Building</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditHostel(hostel)}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
                      title="Edit PG"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHostel(hostel)}
                      className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
                      title="Delete PG"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Buildings Under PG */}
                {isHostelOpen && (
                  <div className="p-3 sm:p-4 sm:pl-8 space-y-3">
                    {hostelBuildings.length === 0 ? (
                      <div className="p-3 text-center text-gray-400 text-xs bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                        No buildings in this PG. Click{" "}
                        <button
                          onClick={() => onAddBuilding(hostel)}
                          className="text-blue-600 font-semibold underline cursor-pointer"
                        >
                          + Add Building
                        </button>{" "}
                        to create one.
                      </div>
                    ) : (
                      hostelBuildings.map((building) => {
                        const isBuildingOpen = !!expandedBuildings[building.id];
                        const buildingFloors = floors.filter((f) => f.building_id === building.id);

                        return (
                          <div
                            key={building.id}
                            className="border border-teal-100 dark:border-teal-950/40 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xs"
                          >
                            {/* Building Level Row */}
                            <div className="p-2.5 sm:p-3 bg-teal-50/40 dark:bg-teal-950/20 flex items-center justify-between gap-3 select-none">
                              <div
                                onClick={() => toggleBuilding(building.id)}
                                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                              >
                                <button className="text-teal-600 dark:text-teal-400 p-0.5">
                                  {isBuildingOpen ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <div className="h-6 w-6 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                                  <Building2 className="h-3 w-3" />
                                </div>
                                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                    {building.name}
                                  </span>
                                  {building.code && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                      {building.code}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                    ({buildingFloors.length} {buildingFloors.length === 1 ? "Floor" : "Floors"})
                                  </span>
                                </div>
                              </div>

                              {/* Building Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onAddFloor(building)}
                                  className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                  title="Add Floor"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span className="hidden sm:inline">Add Floor</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onEditBuilding(building)}
                                  className="p-1 text-gray-500 hover:text-teal-600 rounded transition cursor-pointer"
                                  title="Edit Building"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteBuilding(building)}
                                  className="p-1 text-gray-500 hover:text-red-600 rounded transition cursor-pointer"
                                  title="Delete Building"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Floors Under Building */}
                            {isBuildingOpen && (
                              <div className="p-3 sm:pl-6 space-y-2.5 bg-gray-50/30 dark:bg-gray-950/20">
                                {buildingFloors.length === 0 ? (
                                  <div className="p-2.5 text-center text-gray-400 text-xs">
                                    No floors added. Click{" "}
                                    <button
                                      onClick={() => onAddFloor(building)}
                                      className="text-teal-600 font-semibold underline cursor-pointer"
                                    >
                                      + Add Floor
                                    </button>
                                  </div>
                                ) : (
                                  buildingFloors.map((floor) => {
                                    const isFloorOpen = !!expandedFloors[floor.id];
                                    const floorRooms = rooms.filter((r) => r.floor_id === floor.id);

                                    return (
                                      <div
                                        key={floor.id}
                                        className="border border-sky-100 dark:border-sky-950/40 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
                                      >
                                        {/* Floor Level Row */}
                                        <div className="p-2 sm:p-2.5 bg-sky-50/30 dark:bg-sky-950/20 flex items-center justify-between gap-2 select-none">
                                          <div
                                            onClick={() => toggleFloor(floor.id)}
                                            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                          >
                                            <button className="text-sky-600 dark:text-sky-400 p-0.5">
                                              {isFloorOpen ? (
                                                <ChevronDown className="h-3 w-3" />
                                              ) : (
                                                <ChevronRight className="h-3 w-3" />
                                              )}
                                            </button>
                                            <div className="h-5 w-5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                                              <Layers className="h-3 w-3" />
                                            </div>
                                            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                                              <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                                {floor.name}
                                              </span>
                                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                                Floor {floor.floor_number}
                                              </span>
                                              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                ({floorRooms.length} {floorRooms.length === 1 ? "Room" : "Rooms"})
                                              </span>
                                            </div>
                                          </div>

                                          {/* Floor Actions */}
                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => onAddRoom(floor)}
                                              className="px-2 py-0.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                              title="Add Room on this floor"
                                            >
                                              <Plus className="h-3 w-3" />
                                              <span className="hidden sm:inline">Add Room</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => onEditFloor(floor)}
                                              className="p-1 text-gray-500 hover:text-sky-600 rounded transition cursor-pointer"
                                              title="Edit Floor"
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => onDeleteFloor(floor)}
                                              className="p-1 text-gray-500 hover:text-red-600 rounded transition cursor-pointer"
                                              title="Delete Floor"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Rooms Under Floor */}
                                        {isFloorOpen && (
                                          <div className="p-2 sm:pl-6 space-y-1.5 bg-gray-50/20 dark:bg-gray-950/10">
                                            {floorRooms.length === 0 ? (
                                              <div className="p-2 text-center text-gray-400 text-xs">
                                                No rooms on this floor. Click{" "}
                                                <button
                                                  onClick={() => onAddRoom(floor)}
                                                  className="text-sky-600 font-semibold underline cursor-pointer"
                                                >
                                                  + Add Room
                                                </button>
                                              </div>
                                            ) : (
                                              floorRooms.map((room) => {
                                                const isRoomOpen = !!expandedRooms[room.id];
                                                const roomAvail = availabilityData?.find(
                                                  (a: any) => a.room_id === room.id
                                                );
                                                const bedsList = roomAvail?.beds || [];

                                                const cap = room.capacity || 1;
                                                const occ = room.occupied_beds ?? 0;

                                                return (
                                                  <div
                                                    key={room.id}
                                                    className="border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-gray-900 overflow-hidden"
                                                  >
                                                    {/* Room Level Row */}
                                                    <div className="p-2 flex items-center justify-between gap-2 select-none">
                                                      <div
                                                        onClick={() => toggleRoom(room.id)}
                                                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                                      >
                                                        <button className="text-gray-400 p-0.5">
                                                          {isRoomOpen ? (
                                                            <ChevronDown className="h-3 w-3" />
                                                          ) : (
                                                            <ChevronRight className="h-3 w-3" />
                                                          )}
                                                        </button>
                                                        <div className="h-5 w-5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                                          <DoorOpen className="h-3 w-3" />
                                                        </div>
                                                        <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                            Room {room.room_number}
                                                          </span>
                                                          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                                            {formatCurrency(Number(room.room_rent))}
                                                          </span>
                                                          <span
                                                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                                              occ >= cap
                                                                ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                                                : occ > 0
                                                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                                                : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                                            }`}
                                                          >
                                                            {occ}/{cap} Beds Occupied
                                                          </span>
                                                          {room.status === "MAINTENANCE" && (
                                                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-gray-200 text-gray-700">
                                                              Maintenance
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>

                                                      {/* Room Actions */}
                                                      <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                          type="button"
                                                          onClick={() => onAddBed(room)}
                                                          className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                                                          title="Add Bed"
                                                        >
                                                          <Plus className="h-2.5 w-2.5" />
                                                          <span>Add Bed</span>
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => onViewRoom(room)}
                                                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition cursor-pointer"
                                                          title="View Room Dossier"
                                                        >
                                                          <Eye className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => onEditRoom(room)}
                                                          className="p-1 text-gray-400 hover:text-amber-600 rounded transition cursor-pointer"
                                                          title="Edit Room"
                                                        >
                                                          <Edit2 className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => onDeleteRoom(room)}
                                                          className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                                                          title="Delete Room"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </button>
                                                      </div>
                                                    </div>

                                                    {/* Beds Under Room */}
                                                    {isRoomOpen && (
                                                      <div className="p-2 sm:pl-8 bg-gray-50 dark:bg-gray-950/40 border-t border-gray-100 dark:border-gray-800 space-y-1">
                                                        {bedsList.length === 0 ? (
                                                          <div className="text-[11px] text-gray-400">
                                                            {cap} beds configured by capacity. (Click + Add Bed to add specific beds).
                                                          </div>
                                                        ) : (
                                                          bedsList.map((bed: any) => {
                                                            const isOccupied = bed.status === "OCCUPIED";

                                                            return (
                                                              <div
                                                                key={bed.bed_id}
                                                                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 select-none"
                                                              >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                  <Bed className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
                                                                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                                    {bed.bed_number}
                                                                  </span>
                                                                  <span
                                                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                                                      isOccupied
                                                                        ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                                                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                                    }`}
                                                                  >
                                                                    {bed.status}
                                                                  </span>
                                                                  {bed.tenant_name && (
                                                                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400 truncate">
                                                                      <User className="h-2.5 w-2.5" />
                                                                      {bed.tenant_name}
                                                                    </span>
                                                                  )}
                                                                </div>
                                                              </div>
                                                            );
                                                          })
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HierarchyTreeView;
