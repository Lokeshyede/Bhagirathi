import React from "react";
import { ArrowRight, Edit3, Trash2, Plus, BedDouble, Building, Layers } from "lucide-react";
import { Room } from "@bhagirathi/types";
import { formatCurrency } from "@bhagirathi/utils";

interface RoomsCardsViewProps {
  rooms: Room[];
  onViewRoom: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onAddBed: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
}

export const RoomsCardsView: React.FC<RoomsCardsViewProps> = ({
  rooms,
  onViewRoom,
  onEditRoom,
  onAddBed,
  onDeleteRoom,
}) => {
  const renderStatusBadge = (room: Room) => {
    const capacity = room.capacity || 1;
    const occupied = room.occupied_beds ?? 0;
    const isMaintenance = room.status === "MAINTENANCE";

    if (isMaintenance) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
          Maintenance
        </span>
      );
    }

    if (occupied >= capacity && capacity > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Occupied
        </span>
      );
    }

    if (occupied > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Partially Occupied
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Available
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4 sm:p-5">
      {rooms.map((room) => {
        const capacity = room.capacity || 1;
        const occupied = room.occupied_beds ?? 0;
        const available = Math.max(0, capacity - occupied);
        const rentVal = Number(room.room_rent) || 0;
        const occupancyPct = Math.round((occupied / capacity) * 100);

        return (
          <div
            key={room.id}
            className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-gray-250 dark:hover:border-gray-700 transition-all flex flex-col justify-between group select-none"
          >
            {/* Header: Room Number + Status */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
                    Room
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {room.room_number}
                  </h3>
                </div>
                {renderStatusBadge(room)}
              </div>

              {/* Hierarchy Info */}
              <div className="space-y-1 mb-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 truncate">
                  <Building className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{room.hostel_name || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 truncate">
                  <Layers className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">
                    {(room.building_name && room.floor_name) ? `${room.building_name} • ${room.floor_name}` : (room.building_name || room.floor_name || "—")}
                  </span>
                </div>
              </div>

              {/* Occupancy & Bed Indicators */}
              <div className="bg-gray-50/70 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-gray-400" />
                    Beds
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                    {occupied} / {capacity} Beds
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      occupied >= capacity ? "bg-red-500" : occupied > 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, occupancyPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
                  <span>{available} available</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{occupancyPct}%</span>
                </div>
              </div>

              {/* Rent Details */}
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">Monthly Rent</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                    {formatCurrency(rentVal).replace("INR", "").trim()}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">/ month</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditRoom(room)}
                  title="Edit Room"
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onAddBed(room)}
                  title="Add Bed"
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteRoom(room)}
                  title="Delete Room"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => onViewRoom(room)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 group-hover:translate-x-0.5 transition-transform cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
