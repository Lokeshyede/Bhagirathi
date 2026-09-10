import React, { useState } from "react";
import { Modal, Button } from "@bhagirathi/ui";
import { useHostels, useBuildings, useFloors, useRooms, useBeds } from "../../hostel/hooks/api/useHostel";
import { useTenantMutations } from "../hooks/api/useTenant";
import { BedStatusGrid } from "./BedStatusGrid";
import { RoomOccupancyCard } from "./RoomOccupancyCard";
import { RotateCcw, AlertTriangle, CheckCircle2, Building2 } from "lucide-react";
import { ArchivedTenantItem } from "@bhagirathi/types";

interface RestoreTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: ArchivedTenantItem | null;
  onRestore?: (params: { id: string; room_id?: string; bed_id?: string }) => Promise<void>;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export const RestoreTenantDialog: React.FC<RestoreTenantDialogProps> = ({
  isOpen,
  onClose,
  tenant,
  onRestore,
  onSuccess,
  isLoading
}) => {
  const { restoreTenant } = useTenantMutations();
  const [usePreviousBed, setUsePreviousBed] = useState<boolean>(true);
  const [selectedHostel, setSelectedHostel] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedBed, setSelectedBed] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cascading queries for reassignment
  const { data: hostels } = useHostels();
  const { data: buildings } = useBuildings(selectedHostel || null);
  const { data: floors } = useFloors(selectedBuilding || null);
  const { data: rooms } = useRooms(selectedFloor || null);
  const { data: beds } = useBeds(selectedRoom || null);

  const activeRoomObj = rooms?.find((r) => r.id === selectedRoom);

  const handleConfirmRestore = async () => {
    if (!tenant) return;
    setErrorMsg(null);

    try {
      if (usePreviousBed) {
        // Attempt restore to original bed
        if (onRestore) {
          await onRestore({ id: tenant.id });
        } else {
          await restoreTenant.mutateAsync({ id: tenant.id });
        }
      } else {
        // Require explicit room & bed selection
        if (!selectedRoom || !selectedBed) {
          setErrorMsg("Please select both a valid room and an available bed.");
          return;
        }
        if (onRestore) {
          await onRestore({
            id: tenant.id,
            room_id: selectedRoom,
            bed_id: selectedBed
          });
        } else {
          await restoreTenant.mutateAsync({
            id: tenant.id,
            room_id: selectedRoom,
            bed_id: selectedBed
          });
        }
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message || err?.response?.data?.detail || err?.message || "Restore failed";
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
      // If 409 conflict, automatically switch to new bed selection
      if (err?.response?.status === 409) {
        setUsePreviousBed(false);
      }
    }
  };

  if (!tenant) return null;

  const hasPreviousAllocation = !!(tenant.last_room_number && tenant.last_bed_number);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restore Archived Tenant"
      className="max-w-2xl w-full"
    >
      <div className="space-y-5 text-xs select-none">
        {/* Tenant overview card */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Restoring Resident</span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{tenant.full_name}</h4>
            <p className="text-[11px] text-slate-500">{tenant.phone} • {tenant.email}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Previous Room/Bed</span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {hasPreviousAllocation ? `Room ${tenant.last_room_number} • Bed ${tenant.last_bed_number}` : "None Assigned"}
            </p>
            {tenant.last_hostel_name && (
              <p className="text-[10px] text-slate-400">{tenant.last_hostel_name}</p>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Allocation Conflict / Notice</p>
              <p className="mt-0.5 text-[11px]">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Restore strategy selection */}
        {hasPreviousAllocation ? (
          <div className="space-y-3">
            <label className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
              Room & Bed Assignment Option
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setUsePreviousBed(true);
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  usePreviousBed
                    ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-900 dark:text-white ring-1 ring-red-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-black text-xs">Original Room & Bed</span>
                  {usePreviousBed && <CheckCircle2 className="h-4 w-4 text-red-600" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Attempt to return to Room {tenant.last_room_number}, Bed {tenant.last_bed_number} (if currently vacant).
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsePreviousBed(false);
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  !usePreviousBed
                    ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 text-red-900 dark:text-white ring-1 ring-red-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-black text-xs">Select New Available Bed</span>
                  {!usePreviousBed && <CheckCircle2 className="h-4 w-4 text-red-600" />}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Choose an available bed in any room across hostel buildings.
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
            This tenant had no prior room allocation. Please choose an available room and bed to restore them.
          </div>
        )}

        {/* New Bed Cascading Selector when not using previous bed */}
        {(!usePreviousBed || !hasPreviousAllocation) && (
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/40 space-y-3.5">
            <h5 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-red-500" />
              <span>Select Destination Room & Bed</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Hostel / PG
                </label>
                <select
                  value={selectedHostel}
                  onChange={(e) => {
                    setSelectedHostel(e.target.value);
                    setSelectedBuilding("");
                    setSelectedFloor("");
                    setSelectedRoom("");
                    setSelectedBed("");
                  }}
                  className="w-full h-8.5 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                >
                  <option value="">-- Choose Hostel --</option>
                  {hostels?.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Building
                </label>
                <select
                  value={selectedBuilding}
                  disabled={!selectedHostel}
                  onChange={(e) => {
                    setSelectedBuilding(e.target.value);
                    setSelectedFloor("");
                    setSelectedRoom("");
                    setSelectedBed("");
                  }}
                  className="w-full h-8.5 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs disabled:opacity-50"
                >
                  <option value="">-- Choose Building --</option>
                  {buildings?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Floor
                </label>
                <select
                  value={selectedFloor}
                  disabled={!selectedBuilding}
                  onChange={(e) => {
                    setSelectedFloor(e.target.value);
                    setSelectedRoom("");
                    setSelectedBed("");
                  }}
                  className="w-full h-8.5 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs disabled:opacity-50"
                >
                  <option value="">-- Choose Floor --</option>
                  {floors?.map((fl) => (
                    <option key={fl.id} value={fl.id}>{fl.name} (Floor {fl.floor_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Room
                </label>
                <select
                  value={selectedRoom}
                  disabled={!selectedFloor}
                  onChange={(e) => {
                    setSelectedRoom(e.target.value);
                    setSelectedBed("");
                  }}
                  className="w-full h-8.5 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs disabled:opacity-50"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms?.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} ({r.vacant_beds} vacant / {r.capacity} beds)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeRoomObj && (
              <div className="pt-2">
                <RoomOccupancyCard
                  roomNumber={activeRoomObj.room_number}
                  roomType={typeof activeRoomObj.room_type === "string" ? activeRoomObj.room_type : ""}
                  capacity={activeRoomObj.capacity}
                  occupiedCount={activeRoomObj.occupied_beds || activeRoomObj.active_occupants || 0}
                  vacantCount={activeRoomObj.vacant_beds ?? (activeRoomObj.capacity - (activeRoomObj.occupied_beds || 0))}
                  status={activeRoomObj.status}
                />
              </div>
            )}

            {selectedRoom && beds && (
              <div className="pt-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Available Bed Space
                </label>
                <BedStatusGrid
                  beds={beds}
                  selectedBedId={selectedBed}
                  onSelectBed={(bedId) => setSelectedBed(bedId)}
                />
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmRestore}
            isLoading={isLoading}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Confirm & Restore</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
