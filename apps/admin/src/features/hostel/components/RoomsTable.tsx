import React, { useState } from "react";
import { Eye, Edit3, MoreVertical, ChevronsUpDown, ArrowUp, ArrowDown, Trash2, Plus, ExternalLink } from "lucide-react";
import { Room } from "@bhagirathi/types";
import { formatCurrency } from "@bhagirathi/utils";

interface RoomsTableProps {
  rooms: Room[];
  selectedRoomIds: string[];
  onToggleSelectAll: (checked: boolean) => void;
  onToggleSelectRoom: (roomId: string) => void;
  onViewRoom: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onAddBed: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (field: string) => void;
}

export const RoomsTable: React.FC<RoomsTableProps> = ({
  rooms,
  selectedRoomIds,
  onToggleSelectAll,
  onToggleSelectRoom,
  onViewRoom,
  onEditRoom,
  onAddBed,
  onDeleteRoom,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [activeMenuRoomId, setActiveMenuRoomId] = useState<string | null>(null);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-red-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-red-600" />
    );
  };

  const allSelected = rooms.length > 0 && selectedRoomIds.length === rooms.length;
  const someSelected = selectedRoomIds.length > 0 && selectedRoomIds.length < rooms.length;

  const renderStatusBadge = (room: Room) => {
    const capacity = room.capacity || 1;
    const occupied = room.occupied_beds ?? 0;
    const isMaintenance = room.status === "MAINTENANCE";

    if (isMaintenance) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
          Maintenance
        </span>
      );
    }

    if (occupied >= capacity && capacity > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Occupied
        </span>
      );
    }

    if (occupied > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Partially Occupied
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Available
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 text-xs font-semibold select-none">
            {/* Checkbox */}
            <th className="py-3.5 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
            </th>

            {/* Room No. */}
            <th
              onClick={() => onSort?.("room_number")}
              className="py-3.5 px-4 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              <div className="inline-flex items-center gap-1.5">
                <span>Room No.</span>
                {renderSortIcon("room_number")}
              </div>
            </th>

            {/* Hostel */}
            <th
              onClick={() => onSort?.("hostel")}
              className="py-3.5 px-4 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              <div className="inline-flex items-center gap-1.5">
                <span>Hostel</span>
                {renderSortIcon("hostel")}
              </div>
            </th>

            {/* Building */}
            <th
              onClick={() => onSort?.("building")}
              className="py-3.5 px-4 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              <div className="inline-flex items-center gap-1.5">
                <span>Building</span>
                {renderSortIcon("building")}
              </div>
            </th>

            {/* Floor */}
            <th
              onClick={() => onSort?.("floor")}
              className="py-3.5 px-4 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              <div className="inline-flex items-center gap-1.5">
                <span>Floor</span>
                {renderSortIcon("floor")}
              </div>
            </th>

            {/* Total Beds */}
            <th className="py-3.5 px-4 text-center">Total Beds</th>

            {/* Occupied */}
            <th className="py-3.5 px-4 text-center">Occupied</th>

            {/* Available */}
            <th className="py-3.5 px-4 text-center">Available</th>

            {/* Status */}
            <th className="py-3.5 px-4">Status</th>

            {/* Rent (₹) */}
            <th
              onClick={() => onSort?.("room_rent")}
              className="py-3.5 px-4 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition text-right"
            >
              <div className="inline-flex items-center gap-1.5 justify-end w-full">
                <span>Rent (₹)</span>
                {renderSortIcon("room_rent")}
              </div>
            </th>

            {/* Actions */}
            <th className="py-3.5 px-4 text-center w-28">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs">
          {rooms.map((room) => {
            const isSelected = selectedRoomIds.includes(room.id);
            const menuOpen = activeMenuRoomId === room.id;
            const rentVal = Number(room.room_rent) || 0;
            const availableCount = Math.max(0, (room.capacity || 0) - (room.occupied_beds || 0));

            return (
              <tr
                key={room.id}
                className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors ${
                  isSelected ? "bg-red-50/20 dark:bg-red-950/10" : ""
                }`}
              >
                {/* Checkbox */}
                <td className="py-3.5 px-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectRoom(room.id)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </td>

                {/* Room No. */}
                <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                  <button
                    onClick={() => onViewRoom(room)}
                    className="hover:text-red-600 dark:hover:text-red-400 transition text-left cursor-pointer font-bold"
                  >
                    {room.room_number}
                  </button>
                </td>

                {/* Hostel */}
                <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                  {room.hostel_name || "—"}
                </td>

                {/* Building */}
                <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                  {room.building_name || "—"}
                </td>

                {/* Floor */}
                <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                  {room.floor_name || "—"}
                </td>

                {/* Total Beds */}
                <td className="py-3.5 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                  {room.capacity}
                </td>

                {/* Occupied */}
                <td className="py-3.5 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                  {room.occupied_beds ?? 0}
                </td>

                {/* Available */}
                <td className="py-3.5 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                  {availableCount}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {renderStatusBadge(room)}
                </td>

                {/* Rent (₹) */}
                <td className="py-3.5 px-4 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(rentVal).replace("INR", "").trim()}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1 relative">
                    {/* View */}
                    <button
                      onClick={() => onViewRoom(room)}
                      type="button"
                      title="View Details"
                      className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditRoom(room)}
                      type="button"
                      title="Edit Room"
                      className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {/* More */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuRoomId(menuOpen ? null : room.id)}
                        type="button"
                        title="More Actions"
                        className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveMenuRoomId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-lg z-30 py-1 text-left">
                            <button
                              onClick={() => {
                                setActiveMenuRoomId(null);
                                onViewRoom(room);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                              View Dossier
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuRoomId(null);
                                onAddBed(room);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition"
                            >
                              <Plus className="h-3.5 w-3.5 text-gray-400" />
                              Add Bed
                            </button>
                            <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuRoomId(null);
                                onDeleteRoom(room);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Room
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
