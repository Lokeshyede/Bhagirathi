import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rentSchema, RentInput } from "@bhagirathi/validation";
import { Modal, Button, Input } from "@bhagirathi/ui";
import { Tenant } from "@bhagirathi/types";
import { Receipt, Landmark, CalendarRange } from "lucide-react";

interface RentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RentInput) => void;
  tenants: Tenant[];
  initialData?: any;
  isLoading?: boolean;
}

export const RentForm: React.FC<RentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  tenants,
  initialData,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RentInput>({
    resolver: zodResolver(rentSchema),
    defaultValues: {
      tenant_id: initialData?.tenant_id || "",
      rent_month: initialData?.rent_month || new Date().getMonth() + 1,
      rent_year: initialData?.rent_year || new Date().getFullYear(),
      monthly_rent: initialData?.monthly_rent || 0,
      security_deposit: initialData?.security_deposit || 0,
      discount: initialData?.discount || 0,
      late_fee: initialData?.late_fee || 0,
      previous_balance: initialData?.previous_balance || 0,
      due_date: initialData?.due_date || "",
      remarks: initialData?.remarks || "",
    },
  });

  const sectionHeaderClass = "text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-800 pb-2 mb-3.5 flex items-center gap-2 select-none";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modify Rent Invoice" : "Create Manual Rent Bill"}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[550px] overflow-y-auto pr-2">
        
        {/* Section 1: Tenant & Period */}
        <div className="bg-gray-50/20 dark:bg-gray-950/20 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <CalendarRange className="h-4 w-4 text-primary" />
            <span>Tenant & Period</span>
          </h4>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Tenant Account *</label>
              <select
                {...register("tenant_id")}
                disabled={!!initialData}
                className="h-9.5 px-3 border border-border dark:border-gray-800 rounded-input bg-white dark:bg-gray-950 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-60"
              >
                <option value="">Select Tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name} ({t.tenant_id})</option>
                ))}
              </select>
              {errors.tenant_id?.message && (
                <p className="text-[10px] text-danger mt-0.5 font-bold">{errors.tenant_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Billing Month *</label>
                <select
                  {...register("rent_month")}
                  disabled={!!initialData}
                  className="h-9.5 px-3 border border-border dark:border-gray-800 rounded-input bg-white dark:bg-gray-950 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-60"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                {errors.rent_month?.message && (
                  <p className="text-[10px] text-danger mt-0.5 font-bold">{errors.rent_month.message}</p>
                )}
              </div>

              <Input
                label="Billing Year *"
                type="number"
                disabled={!!initialData}
                error={errors.rent_year?.message}
                {...register("rent_year")}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bill Item Breakdown */}
        <div className="bg-gray-50/20 dark:bg-gray-955/10 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <Receipt className="h-4 w-4 text-warning" />
            <span>Bill Item Breakdown</span>
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Monthly Room Rent *"
                type="number"
                placeholder="6000"
                error={errors.monthly_rent?.message}
                {...register("monthly_rent")}
              />

              <Input
                label="Security Deposit Charge"
                type="number"
                placeholder="0"
                error={errors.security_deposit?.message}
                {...register("security_deposit")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Late Fee"
                type="number"
                placeholder="0"
                error={errors.late_fee?.message}
                {...register("late_fee")}
              />

              <Input
                label="Discount"
                type="number"
                placeholder="0"
                error={errors.discount?.message}
                {...register("discount")}
              />

              <Input
                label="Previous Balance"
                type="number"
                placeholder="0"
                error={errors.previous_balance?.message}
                {...register("previous_balance")}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Due Dates & Notes */}
        <div className="bg-gray-50/20 dark:bg-gray-955/10 border border-border dark:border-gray-855 rounded-card p-4">
          <h4 className={sectionHeaderClass}>
            <Landmark className="h-4 w-4 text-info" />
            <span>Due Dates & Notes</span>
          </h4>
          
          <div className="space-y-4">
            <Input
              label="Payment Due Date *"
              type="date"
              error={errors.due_date?.message}
              {...register("due_date")}
            />

            <Input
              label="Remarks / Notes"
              type="text"
              placeholder="Optional ledger instructions..."
              error={errors.remarks?.message}
              {...register("remarks")}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border dark:border-gray-800 select-none">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 cursor-pointer font-bold h-9.5"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 font-bold cursor-pointer h-9.5 text-white"
            isLoading={isLoading}
          >
            {initialData ? "Save Invoice" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RentForm;
