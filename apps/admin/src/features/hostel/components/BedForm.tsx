import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bedSchema, BedInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";

interface BedFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BedInput) => void;
  roomId: string;
  initialData?: any;
  isLoading?: boolean;
}

export const BedForm: React.FC<BedFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roomId,
  initialData,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BedInput>({
    resolver: zodResolver(bedSchema),
    defaultValues: {
      room_id: roomId,
      bed_number: initialData?.bed_number || "",
      bed_status: initialData?.bed_status || "AVAILABLE",
      occupancy_status: initialData?.occupancy_status || "VACANT",
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Bed" : "Add Bed"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" value={roomId} {...register("room_id")} />

        <Input
          label="Bed Number/Label"
          type="text"
          placeholder="e.g. Bed-A"
          error={errors.bed_number?.message}
          {...register("bed_number")}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Bed Status
          </label>
          <select
            {...register("bed_status")}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Under Maintenance</option>
          </select>
          {errors.bed_status?.message && (
            <p className="text-xxs text-red-500 mt-0.5">{errors.bed_status.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Occupancy Status
          </label>
          <select
            {...register("occupancy_status")}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="VACANT">Vacant</option>
            <option value="OCCUPIED">Occupied</option>
          </select>
          {errors.occupancy_status?.message && (
            <p className="text-xxs text-red-500 mt-0.5">{errors.occupancy_status.message}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
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
            {initialData ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default BedForm;
