import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hostelSchema, HostelInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";

interface HostelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HostelInput) => void;
  initialData?: any;
  isLoading?: boolean;
}

export const HostelForm: React.FC<HostelFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostelInput>({
    resolver: zodResolver(hostelSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      type: initialData?.type || "COED",
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Hostel" : "Add Hostel"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Hostel Name"
          type="text"
          placeholder="e.g. Bhagirathi Block A"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Address"
          type="text"
          placeholder="e.g. Kormangala Sector 4"
          error={errors.address?.message}
          {...register("address")}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Hostel Gender Type
          </label>
          <select
            {...register("type")}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            <option value="COED">Co-Ed (All)</option>
            <option value="BOYS">Boys Only</option>
            <option value="GIRLS">Girls Only</option>
          </select>
          {errors.type?.message && (
            <p className="text-[11px] text-red-500 mt-0.5">{errors.type.message}</p>
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
export default HostelForm;
