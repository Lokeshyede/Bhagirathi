import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildingSchema, BuildingInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { useHostels } from "../hooks/api/useHostel";

interface BuildingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuildingInput) => void;
  hostelId?: string;
  initialData?: any;
  isLoading?: boolean;
}

export const BuildingForm: React.FC<BuildingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  hostelId = "",
  initialData,
  isLoading,
}) => {
  const { data: hostels, isLoading: isLoadingHostels } = useHostels();

  const defaultHostelId = initialData?.hostel_id || hostelId || (hostels && hostels.length > 0 ? hostels[0].id : "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BuildingInput>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      hostel_id: defaultHostelId,
      name: initialData?.name || "",
      code: initialData?.code || "",
    },
  });

  const selectedHostelId = watch("hostel_id");

  useEffect(() => {
    if (!selectedHostelId && defaultHostelId) {
      setValue("hostel_id", defaultHostelId);
    }
  }, [defaultHostelId, selectedHostelId, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Building" : "Add Building"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* PG/Hostel Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Select PG / Hostel <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedHostelId || ""}
            onChange={(e) => setValue("hostel_id", e.target.value, { shouldValidate: true })}
            disabled={isLoadingHostels}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="">-- Choose PG / Hostel --</option>
            {hostels?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
          {errors.hostel_id?.message && (
            <p className="text-[11px] text-red-500 mt-0.5">{errors.hostel_id.message}</p>
          )}
        </div>

        <Input
          label="Building Name"
          type="text"
          placeholder="e.g. Tower 1, Block A, Main Wing"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Building Code (Optional)"
          type="text"
          placeholder="e.g. TWR-1, BLK-A"
          error={errors.code?.message}
          {...register("code")}
        />

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
            {initialData ? "Save Changes" : "Create Building"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BuildingForm;
