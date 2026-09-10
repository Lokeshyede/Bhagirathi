import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bedTransferSchema, BedTransferInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";

import { useBeds } from "../../hostel/hooks/api/useHostel";
import { BedStatusGrid } from "./BedStatusGrid";

interface TransferBedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BedTransferInput) => void;
  tenantId: string;
  tenantName: string;
  roomId: string;
  isLoading?: boolean;
}

export const TransferBedDialog: React.FC<TransferBedDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tenantId,
  tenantName,
  roomId,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BedTransferInput>({
    resolver: zodResolver(bedTransferSchema),
    defaultValues: {
      tenant_id: tenantId,
      to_bed_id: "",
      transfer_date: new Date().toISOString().split("T")[0],
      reason: "",
      remarks: "",
    },
  });

  const watchedBed = watch("to_bed_id");

  // Query beds in current room
  const { data: beds } = useBeds(roomId || null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer Bed: ${tenantName}`}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 select-none">
        <input type="hidden" value={tenantId} {...register("tenant_id")} />

        <h4 className="text-xxs font-bold text-gray-405 uppercase tracking-widest border-b pb-1">Select New Bed</h4>

        <div className="py-2">
          {beds && beds.length > 0 ? (
            <BedStatusGrid
              beds={beds}
              selectedBedId={watchedBed}
              onSelectBed={(bedId) => setValue("to_bed_id", bedId)}
            />
          ) : (
            <p className="text-xxs text-gray-400">Loading beds in current room...</p>
          )}
          {errors.to_bed_id?.message && (
            <p className="text-xxs text-red-500 mt-1">{errors.to_bed_id.message}</p>
          )}
        </div>

        <h4 className="text-xxs font-bold text-gray-405 uppercase tracking-widest border-b pb-1 pt-2">Parameters</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Transfer execution date"
            type="date"
            error={errors.transfer_date?.message}
            {...register("transfer_date")}
          />
          <Input
            label="Transfer Reason"
            type="text"
            placeholder="e.g. Broken ladder / window proximity"
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>

        <Input
          label="Remarks"
          type="text"
          placeholder="Optional remarks..."
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
            Confirm Bed Swap
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default TransferBedDialog;
