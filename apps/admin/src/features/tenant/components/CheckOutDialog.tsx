import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkOutSchema, CheckOutInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";

interface CheckOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckOutInput) => void;
  tenantId: string;
  tenantName: string;
  isLoading?: boolean;
}

export const CheckOutDialog: React.FC<CheckOutDialogProps> = ({
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
    formState: { errors },
  } = useForm<CheckOutInput>({
    resolver: zodResolver(checkOutSchema),
    defaultValues: {
      tenant_id: tenantId,
      checkout_date: new Date().toISOString().split("T")[0],
      reason: "",
      remarks: "",
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Check-Out Tenant: ${tenantName}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" value={tenantId} {...register("tenant_id")} />

        <Input
          label="Check-Out Date"
          type="date"
          error={errors.checkout_date?.message}
          {...register("checkout_date")}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Reason for Checkout
          </label>
          <select
            {...register("reason")}
            className="h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-955 text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="">Select Reason</option>
            <option value="AGREEMENT_EXPIRATION">Agreement Expired</option>
            <option value="JOB_RELOCATION">Job Relocation</option>
            <option value="COLLEGE_COMPLETION">College Completion</option>
            <option value="PERSONAL_REASONS">Personal Reasons</option>
            <option value="DISCIPLINARY_ACTION">Disciplinary Action</option>
            <option value="OTHER">Other Reason</option>
          </select>
          {errors.reason?.message && (
            <p className="text-xxs text-red-500 mt-0.5">{errors.reason.message}</p>
          )}
        </div>

        <Input
          label="Remarks"
          type="text"
          placeholder="Security deposit refunds or details..."
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
            className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold cursor-pointer"
            isLoading={isLoading}
          >
            Confirm Check-Out
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default CheckOutDialog;
