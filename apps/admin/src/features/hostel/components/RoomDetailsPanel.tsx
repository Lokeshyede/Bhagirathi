import React from "react";
import {
  X,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  BedDouble,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Room, Bed, Building, Floor } from "@bhagirathi/types";
import { formatCurrency, formatDate } from "@bhagirathi/utils";
import { Button, TableActionMenu } from "@bhagirathi/ui";
import { useNavigate } from "react-router-dom";

interface RoomDetailsPanelProps {
  room: Room | null;
  building?: Building | null;
  floor?: Floor | null;
  beds?: Bed[];
  allocations?: any[];
  onClose?: () => void;
  onEditRoom?: (room: Room) => void;
  onAddBed?: (room: Room) => void;
  onVacateRoom?: (room: Room) => void;
  onEditBed?: (bed: Bed) => void;
  onDeleteBed?: (bedId: string) => void;
  onAssignBed?: (bed: Bed) => void;
  onTransferTenant?: (tenantId: string, tenantName: string) => void;
  onCheckoutTenant?: (tenantId: string, tenantName: string) => void;
  onViewTenant?: (tenantId: string) => void;
}

export const RoomDetailsPanel: React.FC<RoomDetailsPanelProps> = ({
  room,
  building,
  floor,
  beds = [],
  allocations = [],
  onClose,
  onEditRoom,
  onAddBed,
  onVacateRoom,
  onEditBed,
  onDeleteBed,
  onAssignBed,
  onTransferTenant,
  onCheckoutTenant,
  onViewTenant,
}) => {
  const navigate = useNavigate();

  if (!room) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl p-6 text-center shadow-sm select-none flex flex-col items-center justify-center min-h-[420px]">
        <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-muted dark:text-gray-400 mb-3">
          <BedDouble className="h-6 w-6" />
        </div>
        <h4 className="font-extrabold text-sm text-primaryText dark:text-white mb-1">
          No Room Selected
        </h4>
        <p className="text-xs text-secondaryText dark:text-gray-400 max-w-xs leading-relaxed">
          Click any room card on the floor grid to view its detailed specifications, bed allocations, and occupant profiles.
        </p>
      </div>
    );
  }

  const capacity = room.capacity || 1;
  const roomAllocs = allocations.filter(
    (a) => a.room_id === room.id && a.status === "ACTIVE"
  );
  const occupiedBedsCount =
    beds.filter((b) => b.occupancy_status === "OCCUPIED").length ||
    roomAllocs.length;
  const roomRevenue = roomAllocs.reduce(
    (acc, a) => acc + Number(a.monthly_rent || 0),
    0
  );

  // Status computation
  let statusBadgeText = "VACANT";
  let statusBadgeColor =
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  let statusDot = "bg-emerald-500";

  if (room.status === "MAINTENANCE") {
    statusBadgeText = "MAINTENANCE";
    statusBadgeColor =
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";
    statusDot = "bg-gray-500";
  } else if (occupiedBedsCount >= capacity && capacity > 0) {
    statusBadgeText = "OCCUPIED";
    statusBadgeColor =
      "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200";
    statusDot = "bg-red-500";
  } else if (occupiedBedsCount > 0) {
    statusBadgeText = "PARTIALLY OCCUPIED";
    statusBadgeColor =
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200";
    statusDot = "bg-amber-500";
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="p-4.5 border-b border-border dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between shrink-0 select-none">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-base text-primaryText dark:text-white tracking-tight">
              Room {room.room_number}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${statusBadgeColor}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
              {statusBadgeText}
            </span>
          </div>
          <p className="text-[11px] text-secondaryText dark:text-gray-400 mt-0.5 truncate">
            {building?.name ? `${building.name} • ` : ""}
            {floor?.name || `Floor ${room.floor_id}`}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondaryText hover:text-primaryText hover:bg-gray-200/60 dark:hover:bg-gray-700 transition cursor-pointer shrink-0"
            title="Close Panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4.5 space-y-5 scrollbar-thin select-none">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {onEditRoom && (
            <button
              onClick={() => onEditRoom(room)}
              className="flex-1 min-w-[90px] h-8 text-xs font-bold border border-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg inline-flex items-center justify-center gap-1.5 text-primaryText dark:text-gray-200 transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-secondaryText" />
              <span>Edit Room</span>
            </button>
          )}

          {onAddBed && (
            <button
              onClick={() => onAddBed(room)}
              className="flex-1 min-w-[90px] h-8 text-xs font-bold border border-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg inline-flex items-center justify-center gap-1.5 text-primaryText dark:text-gray-200 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-secondaryText" />
              <span>Add Bed</span>
            </button>
          )}

          {onVacateRoom && occupiedBedsCount > 0 && (
            <button
              onClick={() => onVacateRoom(room)}
              className="h-8 px-2.5 text-xs font-bold border border-red-200 dark:border-red-900/40 bg-red-50/20 hover:bg-red-50/40 text-red-650 rounded-lg inline-flex items-center justify-center gap-1 transition cursor-pointer"
              title="Vacate entire room"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Section 1: Room Information */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-widest block">
            Room Information
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/60 dark:bg-gray-950/30 p-3 rounded-xl border border-gray-150/70 dark:border-gray-800/80">
            <div>
              <span className="text-[10px] text-muted dark:text-gray-500 uppercase block font-semibold">
                Building
              </span>
              <span className="font-bold text-primaryText dark:text-gray-200 truncate block mt-0.5">
                {building?.name || "Main Building"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted dark:text-gray-500 uppercase block font-semibold">
                Floor
              </span>
              <span className="font-bold text-primaryText dark:text-gray-200 truncate block mt-0.5">
                {floor?.name || "Level 1"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted dark:text-gray-500 uppercase block font-semibold">
                Room Type
              </span>
              <span className="font-bold text-primaryText dark:text-gray-200 capitalize block mt-0.5">
                {room.room_type ? String(room.room_type).replace("_", " ").toLowerCase() : "Standard"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted dark:text-gray-500 uppercase block font-semibold">
                Capacity
              </span>
              <span className="font-bold text-primaryText dark:text-gray-200 block mt-0.5">
                {capacity} {capacity === 1 ? "Bed" : "Beds"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted dark:text-gray-500 uppercase block font-semibold">
                Monthly Rent
              </span>
              <span className="font-black text-primaryText dark:text-white block mt-0.5">
                {formatCurrency(Number(room.room_rent || 0)).split(".00")[0]}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted dark:text-gray-500 uppercase block font-semibold">
                Rent Split
              </span>
              <span className="font-bold text-primaryText dark:text-gray-200 block mt-0.5">
                {room.auto_split ? (room.rent_split_type || "Auto Equal") : "Manual"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Bed Details */}
        <div className="space-y-3 pt-2 border-t border-border dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-widest block">
                Bed Details
              </span>
              <span className="text-[11px] font-bold text-secondaryText dark:text-gray-400">
                {occupiedBedsCount} of {capacity} Beds Occupied
              </span>
            </div>

            {onAddBed && (
              <button
                onClick={() => onAddBed(room)}
                className="text-[11px] font-extrabold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Bed
              </button>
            )}
          </div>

          {/* Beds list */}
          <div className="space-y-2.5">
            {beds.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-center bg-gray-50/40 dark:bg-gray-900/50">
                <p className="text-xs text-muted dark:text-gray-400 font-semibold mb-2">
                  No beds defined in this room.
                </p>
                {onAddBed && (
                  <button
                    onClick={() => onAddBed(room)}
                    className="h-7 px-3 text-xs font-bold bg-primary text-white rounded-md inline-flex items-center gap-1 cursor-pointer hover:bg-red-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Bed
                  </button>
                )}
              </div>
            ) : (
              beds.map((b) => {
                const activeAlloc = allocations.find(
                  (a) => a.bed_id === b.id && a.status === "ACTIVE"
                );
                const isBedOccupied =
                  b.occupancy_status === "OCCUPIED" && activeAlloc;

                const bedActions = [
                  ...(onEditBed
                    ? [
                        {
                          label: "Edit Bed",
                          icon: Edit3,
                          onClick: () => onEditBed(b),
                        },
                      ]
                    : []),
                  ...(onDeleteBed
                    ? [
                        {
                          label: "Delete Bed",
                          icon: Trash2,
                          onClick: () => onDeleteBed(b.id),
                          variant: "danger" as const,
                        },
                      ]
                    : []),
                ];

                return (
                  <div
                    key={b.id}
                    className="p-3 bg-white dark:bg-gray-950 border border-border dark:border-gray-800 rounded-xl space-y-2 shadow-2xs"
                  >
                    {/* Bed Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-secondaryText shrink-0" />
                        <span className="font-extrabold text-xs text-primaryText dark:text-white">
                          Bed {b.bed_number}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            b.bed_status === "MAINTENANCE"
                              ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300"
                              : isBedOccupied
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
                          }`}
                        >
                          {b.bed_status === "MAINTENANCE"
                            ? "MAINTENANCE"
                            : isBedOccupied
                            ? "OCCUPIED"
                            : "VACANT"}
                        </span>

                        {bedActions.length > 0 && (
                          <TableActionMenu actions={bedActions} />
                        )}
                      </div>
                    </div>

                    {/* Bed Details */}
                    {isBedOccupied ? (
                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted dark:text-gray-500 font-semibold uppercase">
                            Tenant
                          </span>
                          <span
                            onClick={() =>
                              onViewTenant?.(activeAlloc.tenant_id)
                            }
                            className="font-bold text-primary hover:underline cursor-pointer truncate max-w-[150px]"
                            title={activeAlloc.tenant_name}
                          >
                            {activeAlloc.tenant_name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted dark:text-gray-500 font-semibold uppercase">
                            Since
                          </span>
                          <span className="font-medium text-secondaryText dark:text-gray-400">
                            {activeAlloc.allocation_date
                              ? formatDate(activeAlloc.allocation_date, true)
                              : "N/A"}
                          </span>
                        </div>

                        {/* Bed Quick Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                          <button
                            onClick={() =>
                              onTransferTenant?.(
                                activeAlloc.tenant_id,
                                activeAlloc.tenant_name
                              )
                            }
                            className="flex-1 h-7 text-[10px] font-bold border border-border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md inline-flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3 text-info" />
                            <span>Transfer</span>
                          </button>

                          <button
                            onClick={() =>
                              onCheckoutTenant?.(
                                activeAlloc.tenant_id,
                                activeAlloc.tenant_name
                              )
                            }
                            className="flex-1 h-7 text-[10px] font-bold border border-red-200 dark:border-red-900/40 bg-red-50/10 hover:bg-red-50/30 text-red-650 rounded-md inline-flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <LogOut className="h-3 w-3 text-danger" />
                            <span>Checkout</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-muted dark:text-gray-500 italic">
                          {b.bed_status === "MAINTENANCE"
                            ? "Under repair"
                            : "Available for allocation"}
                        </span>

                        {onAssignBed && b.bed_status === "AVAILABLE" && (
                          <button
                            onClick={() => onAssignBed(b)}
                            className="h-7 px-2.5 text-[11px] font-bold bg-primary hover:bg-red-700 text-white rounded-md inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Assign</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 3: Financial Overview */}
        <div className="space-y-2.5 pt-2 border-t border-border dark:border-gray-800">
          <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-widest block">
            Financial Overview
          </span>

          <div className="space-y-1.5 text-xs bg-gray-50/60 dark:bg-gray-950/30 p-3 rounded-xl border border-gray-150/70 dark:border-gray-800/80">
            <div className="flex justify-between items-center">
              <span className="text-secondaryText dark:text-gray-400 font-medium">
                Monthly Rent Ledger
              </span>
              <span className="font-extrabold text-primaryText dark:text-white tabular-nums">
                {formatCurrency(roomRevenue || Number(room.room_rent || 0)).split(".00")[0]}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-secondaryText dark:text-gray-400 font-medium">
                Outstanding Balance
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                ₹0
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-secondaryText dark:text-gray-400 font-medium">
                Active Tenant Allocations
              </span>
              <span className="font-bold text-primaryText dark:text-gray-200">
                {roomAllocs.length} {roomAllocs.length === 1 ? "Occupant" : "Occupants"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action */}
      <div className="p-3.5 border-t border-border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 shrink-0">
        <Button
          variant="outline"
          onClick={() => navigate(`/rooms/${room.id}`)}
          className="w-full h-9 flex items-center justify-center gap-1.5 text-xs font-black bg-white dark:bg-gray-900 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all rounded-xl"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>View Full Room Dossier &rarr;</span>
        </Button>
      </div>
    </div>
  );
};

export default RoomDetailsPanel;
