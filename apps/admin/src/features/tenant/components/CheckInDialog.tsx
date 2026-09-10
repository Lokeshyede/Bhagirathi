import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkInSchema, CheckInInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import {
  useHostels,
  useBuildings,
  useFloors,
  useRooms,
  useBeds
} from "../../hostel/hooks/api/useHostel";

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInInput) => void;
  tenantId: string;
  tenantName: string;
  isLoading?: boolean;
}

export const CheckInDialog: React.FC<CheckInDialogProps> = ({
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
  } = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      tenant_id: tenantId,
      hostel_id: "",
      building_id: "",
      floor_id: "",
      room_id: "",
      bed_id: "",
      checkin_date: new Date().toISOString().split("T")[0],
      agreement_start_date: new Date().toISOString().split("T")[0],
      security_deposit: 5000,
      monthly_rent: 0,
      advance_rent: 0,
      remarks: "",
    },
  });

  // Watch dropdown values to trigger cascade lookups
  const watchedHostel = watch("hostel_id");
  const watchedBuilding = watch("building_id");
  const watchedFloor = watch("floor_id");
  const watchedRoom = watch("room_id");

  // Queries
  const { data: hostels } = useHostels();
  const { data: buildings } = useBuildings(watchedHostel || null);
  const { data: floors } = useFloors(watchedBuilding || null);
  const { data: rooms } = useRooms(watchedFloor || null);
  const { data: beds } = useBeds(watchedRoom || null);

  // Reset child selectors when parent options modify
  useEffect(() => {
    setValue("building_id", "");
    setValue("floor_id", "");
    setValue("room_id", "");
    setValue("bed_id", "");
  }, [watchedHostel, setValue]);

  useEffect(() => {
    setValue("floor_id", "");
    setValue("room_id", "");
    setValue("bed_id", "");
  }, [watchedBuilding, setValue]);

  useEffect(() => {
    setValue("room_id", "");
    setValue("bed_id", "");
  }, [watchedFloor, setValue]);

  useEffect(() => {
    setValue("bed_id", "");
  }, [watchedRoom, setValue]);

  // Removed auto-populate of monthly_rent.
  // We should NOT prefill monthly_rent with the full room_rent because for EQUAL split rooms,
  // the RentConfigService calculates the rent dynamically. Setting this field creates a FIXED override.
  // The user should only fill this if they explicitly want to override the tenant's rent.

  // Filter vacant and active beds
  const vacantBeds = beds?.filter((b: any) => b.occupancy_status === "VACANT" && b.bed_status === "AVAILABLE" && b.is_active) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Allocate Bed: ${tenantName}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        <input type="hidden" value={tenantId} {...register("tenant_id")} />

        <h4 className="text-xxs font-bold text-gray-405 uppercase tracking-widest border-b pb-1">Property Allocation</h4>

        {/* 1. Hostel Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hostel Property</label>
          <select
            {...register("hostel_id")}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="">Select Hostel</option>
            {hostels?.map((h: any) => (
              <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
            ))}
          </select>
          {errors.hostel_id?.message && (
            <p className="text-xxs text-red-505 mt-0.5">{errors.hostel_id.message}</p>
          )}
        </div>

        {/* 2. Building Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Building</label>
          <select
            {...register("building_id")}
            disabled={!watchedHostel}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-305 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select Building</option>
            {buildings?.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name} {b.code ? `(${b.code})` : ""}</option>
            ))}
          </select>
          {errors.building_id?.message && (
            <p className="text-xxs text-red-500 mt-0.5">{errors.building_id.message}</p>
          )}
        </div>

        {/* 3. Floor Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Floor</label>
          <select
            {...register("floor_id")}
            disabled={!watchedBuilding}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-305 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select Floor</option>
            {floors?.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name} (Floor #{f.floor_number})</option>
            ))}
          </select>
          {errors.floor_id?.message && (
            <p className="text-xxs text-red-500 mt-0.5">{errors.floor_id.message}</p>
          )}
        </div>

        {/* 4. Room & Bed Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room</label>
            <select
              {...register("room_id")}
              disabled={!watchedFloor}
              className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-755 dark:text-gray-305 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Select Room</option>
               {rooms?.map((r: any) => (
                <option key={r.id} value={r.id}>Room {r.room_number ?? "N/A"} ({(r.room_type ?? "UNKNOWN").replace("_", " ")})</option>
              ))}
            </select>
            {errors.room_id?.message && (
              <p className="text-xxs text-red-500 mt-0.5">{errors.room_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bed Number</label>
            <select
              {...register("bed_id")}
              disabled={!watchedRoom}
              className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-750 dark:text-gray-305 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Select Bed</option>
              {vacantBeds.map((bd: any) => (
                <option key={bd.id} value={bd.id}>Bed {bd.bed_number}</option>
              ))}
            </select>
            {errors.bed_id?.message && (
              <p className="text-xxs text-red-500 mt-0.5">{errors.bed_id.message}</p>
            )}
          </div>
        </div>

        <h4 className="text-xxs font-bold text-gray-405 uppercase tracking-widest border-b pb-1 pt-2">Financials & Timeline</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Check-In Date"
            type="date"
            error={errors.checkin_date?.message}
            {...register("checkin_date")}
          />

          <Input
            label="Agreement Start Date"
            type="date"
            error={errors.agreement_start_date?.message}
            {...register("agreement_start_date")}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Security Deposit"
            type="number"
            placeholder="5000"
            error={errors.security_deposit?.message}
            {...register("security_deposit")}
          />

          <Input
            label="Custom Rent Override (₹)"
            type="number"
            placeholder="Leave empty for auto-calculation"
            error={errors.monthly_rent?.message}
            {...register("monthly_rent", { valueAsNumber: true })}
          />

          <Input
            label="Advance Rent"
            type="number"
            placeholder="6000"
            error={errors.advance_rent?.message}
            {...register("advance_rent")}
          />
        </div>

        <Input
          label="Remarks"
          type="text"
          placeholder="Optional instructions..."
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
            Allocate Bed
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default CheckInDialog;
