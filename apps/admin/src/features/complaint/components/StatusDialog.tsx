import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@bhagirathi/ui";
import { Complaint } from "@bhagirathi/types";
import { ComplaintStatus } from "@bhagirathi/constants";

const statusSchema = zod.object({
  status: zod.string().min(1, "Please select a status"),
  remarks: zod.string().min(3, "Timeline remarks must be at least 3 characters")
});

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  onUpdateStatus: (data: { status: string; remarks: string }) => Promise<void>;
}

export const StatusDialog: React.FC<StatusDialogProps> = ({
  isOpen,
  onClose,
  complaint,
  onUpdateStatus
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: complaint.status || "",
      remarks: ""
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      await onUpdateStatus({
        status: data.status,
        remarks: data.remarks
      });
      reset();
      onClose();
    } catch (err) {
      // Handled by parent mutation
    }
  };

  // Filter allowed transitions based on roles (Admins can set any status)
  const allowedStatuses = [
    { label: "Open / Unassigned", value: ComplaintStatus.OPEN },
    { label: "Assigned", value: ComplaintStatus.ASSIGNED },
    { label: "In Progress", value: ComplaintStatus.IN_PROGRESS },
    { label: "Resolved", value: ComplaintStatus.RESOLVED },
    { label: "Closed / Verified", value: ComplaintStatus.CLOSED },
    { label: "Rejected / Reopen", value: ComplaintStatus.REJECTED }
  ];

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 bg-gray-50 dark:bg-gray-955 border-b border-gray-100 dark:border-gray-850">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-red-600" />
            <span className="font-bold text-sm text-gray-900 dark:text-white">Update Status</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-650 dark:hover:text-gray-305 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <p className="text-xs text-gray-500">
            Set the workflow progression status for this complaint. The tenant and assigned staff will see the updates on their dashboards.
          </p>

          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border text-xs space-y-1 text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-bold uppercase text-3xs text-gray-400">Current Status:</span>{" "}
              <span className="font-extrabold text-red-650 dark:text-red-500">{complaint.status}</span>
            </div>
          </div>

          {/* Select Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Select New Status *
            </label>
            <select
              className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-semibold cursor-pointer"
              {...register("status")}
            >
              <option value="">-- Choose Status --</option>
              {allowedStatuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.status && (
              <p className="text-3xs text-red-655 font-bold mt-1.5">{errors.status.message}</p>
            )}
          </div>

          {/* Remarks input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Action Remarks / Comments *
            </label>
            <textarea
              className="w-full min-h-[90px] p-3 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              placeholder="Explain the reason for this status update..."
              {...register("remarks")}
            />
            {errors.remarks && (
              <p className="text-3xs text-red-655 font-bold mt-1">{errors.remarks.message}</p>
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
              Update Status
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
export default StatusDialog;
