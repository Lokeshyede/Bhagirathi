import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomTransferSchema, RoomTransferInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";

import { useHostels, useBuildings, useFloors, useRooms, useBeds } from "../../hostel/hooks/api/useHostel";
import { RoomOccupancyCard } from "./RoomOccupancyCard";
import { BedStatusGrid } from "./BedStatusGrid";

interface TransferRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomTransferInput) => void;
  tenantId: string;
  tenantName: string;
  isLoading?: boolean;
}

export const TransferRoomDialog: React.FC<TransferRoomDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tenantId,
  tenantName,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomTransferInput>({
    resolver: zodResolver(roomTransferSchema),
    defaultValues: {
      tenant_id: tenantId,
      to_hostel_id: "",
      to_building_id: "",
      to_floor_id: "",
      to_room_id: "",
      to_bed_id: "",
      transfer_date: new Date().toISOString().split("T")[0],
      reason: "",
      remarks: "",
    },
  });

  const watchedHostel = watch("to_hostel_id");
  const watchedBuilding = watch("to_building_id");
  const watchedFloor = watch("to_floor_id");
  const watchedRoom = watch("to_room_id");
  const watchedBed = watch("to_bed_id");

  // Cascade queries
  const { data: hostels } = useHostels();
  const { data: buildings } = useBuildings(watchedHostel || null);
  const { data: floors } = useFloors(watchedBuilding || null);
  const { data: rooms } = useRooms(watchedFloor || null);
  const { data: beds } = useBeds(watchedRoom || null);

  // Cascading resets
  useEffect(() => {
    setValue("to_building_id", "");
    setValue("to_floor_id", "");
    setValue("to_room_id", "");
    setValue("to_bed_id", "");
  }, [watchedHostel, setValue]);

  useEffect(() => {
    setValue("to_floor_id", "");
    setValue("to_room_id", "");
    setValue("to_bed_id", "");
  }, [watchedBuilding, setValue]);

  useEffect(() => {
    setValue("to_room_id", "");
    setValue("to_bed_id", "");
  }, [watchedFloor, setValue]);

  useEffect(() => {
    setValue("to_bed_id", "");
  }, [watchedRoom, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer Room: ${tenantName}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[520px] overflow-y-auto pr-2 select-none">
        <input type="hidden" value={tenantId} {...register("tenant_id")} />

        <h4 className="text-xxs font-bold text-gray-405 uppercase tracking-widest border-b pb-1">Destination Facility</h4>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hostel</label>
            <select
              {...register("to_hostel_id")}
              className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="">Select Hostel</option>
              {hostels?.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            {errors.to_hostel_id?.message && (
              <p className="text-xxs text-red-500 mt-0.5">{errors.to_hostel_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Building</label>
            <select
              {...register("to_building_id")}
              disabled={!watchedHostel}
              className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-305 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Select Building</option>
              {buildings?.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.to_building_id?.message && (
              <p className="text-xxs text-red-500 mt-0.5">{errors.to_building_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Floor</label>
            <select
              {...register("to_floor_id")}
              disabled={!watchedBuilding}
              className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-305 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Select Floor</option>
              {floors?.map((f: any) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {errors.to_floor_id?.message && (
              <p className="text-xxs text-red-500 mt-0.5">{errors.to_floor_id.message}</p>
            )}
          </div>
        </div>

        {watchedFloor && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-gray-750 dark:text-gray-300 block">Select Destination Room</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms?.map((rm: any) => {
                const activeBeds = rm.beds || [];
                const occupiedBedsCount = activeBeds.filter((b: any) => b.occupancy_status === "OCCUPIED").length;
                const vacantBedsCount = activeBeds.filter((b: any) => b.occupancy_status === "VACANT" && b.bed_status === "AVAILABLE" && b.is_active).length;

                return (
                  <RoomOccupancyCard
                    key={rm.id}
                    roomNumber={rm.room_number}
                    roomType={rm.room_type}
                    capacity={rm.capacity}
                    occupiedCount={occupiedBedsCount}
                    vacantCount={vacantBedsCount}
                    status={rm.status}
                    isSelected={watchedRoom === rm.id}
                    onClick={() => setValue("to_room_id", rm.id)}
                  />
                );
              })}
            </div>
            {errors.to_room_id?.message && (
              <p className="text-xxs text-red-500">{errors.to_room_id.message}</p>
            )}
          </div>
        )}

        {watchedRoom && (
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="text-xs font-semibold text-gray-755 dark:text-gray-300 block">Select Destination Bed</label>
            {beds && beds.length > 0 ? (
              <BedStatusGrid
                beds={beds}
                selectedBedId={watchedBed}
                onSelectBed={(bedId) => setValue("to_bed_id", bedId)}
              />
            ) : (
              <p className="text-xxs text-gray-400">Loading beds...</p>
            )}
            {errors.to_bed_id?.message && (
              <p className="text-xxs text-red-500">{errors.to_bed_id.message}</p>
            )}
          </div>
        )}

        <h4 className="text-xxs font-bold text-gray-405 uppercase tracking-widest border-b pb-1 pt-2">Transfer Parameters</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Transfer Execution Date"
            type="date"
            error={errors.transfer_date?.message}
            {...register("transfer_date")}
          />
          <Input
            label="Transfer Reason"
            type="text"
            placeholder="e.g. Room upgrade / behavioral shift"
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>

        <Input
          label="Remarks"
          type="text"
          placeholder="Optional info..."
          error={errors.remarks?.message}
          {...register("remarks")}
        />

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 cursor-pointer font-semibold"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 font-semibold cursor-pointer"
            isLoading={isLoading}
          >
            Confirm Room Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default TransferRoomDialog;
