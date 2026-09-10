import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { X, Wrench, AlertCircle } from "lucide-react";
import { useMaintenanceStaff } from "../hooks/useComplaint";
import { Button, Spinner } from "@bhagirathi/ui";
import { Complaint } from "@bhagirathi/types";

const assignSchema = zod.object({
  maintenanceId: zod.string().min(1, "Please select a maintenance worker")
});

interface AssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onAssign: (maintenanceId: string) => Promise<void>;
}

export const AssignDialog: React.FC<AssignDialogProps> = ({
  isOpen,
  onClose,
  complaint,
  onAssign
}) => {
  const { data: staffList, isLoading, isError } = useMaintenanceStaff();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      maintenanceId: complaint.assigned_maintenance_id || ""
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      await onAssign(data.maintenanceId);
      reset();
      onClose();
    } catch (err) {
      // Handled by parent mutation
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 bg-gray-50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-red-600" />
            <span className="font-bold text-sm text-gray-900 dark:text-white">Assign Task</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-650 dark:hover:text-gray-305 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Spinner size="sm" className="mb-2" />
            <span className="text-xxs">Fetching maintenance staff...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="h-9 w-9 text-red-650 mx-auto mb-2" />
            <h4 className="font-bold text-xs">Failed to load staff list</h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <p className="text-xs text-gray-500">
              Select a registered maintenance worker to look after this PG issue. They will receive the task immediately in their dashboard.
            </p>

            <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-bold uppercase text-3xs text-gray-400">Issue ID:</span>{" "}
                <span className="font-bold text-gray-800 dark:text-gray-200">{complaint.complaint_number}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-3xs text-gray-400">Title:</span>{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{complaint.title}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-705 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Select Maintenance Crew *
              </label>
              <select
                className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-semibold cursor-pointer"
                {...register("maintenanceId")}
              >
                <option value="">-- Choose Staff --</option>
                {staffList?.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.full_name} ({staff.mobile})
                  </option>
                ))}
              </select>
              {errors.maintenanceId && (
                <p className="text-3xs text-red-600 font-bold mt-1.5">{errors.maintenanceId.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="cursor-pointer font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="cursor-pointer font-bold"
              >
                Assign Task
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default AssignDialog;
