import React from "react";
import { Wrench, RefreshCw, CheckCircle, AlertOctagon, Trash2 } from "lucide-react";
import { useComplaintDetails, useComplaintHistory, useComplaintMutations } from "../hooks/useComplaint";
import { Timeline } from "./Timeline";
import { PhotoGallery } from "./PhotoGallery";
import { Drawer, Button, Spinner } from "@bhagirathi/ui";
import { ComplaintStatus } from "@bhagirathi/constants";
import { statusBadgeMap, priorityBadgeMap } from "./ComplaintTable";

interface ComplaintDetailsDrawerProps {
  id: string | null;
  onClose: () => void;
  onAssignCrew: () => void;
  onChangeStatus: () => void;
}

export const ComplaintDetailsDrawer: React.FC<ComplaintDetailsDrawerProps> = ({
  id,
  onClose,
  onAssignCrew,
  onChangeStatus
}) => {
  const { data: c, isLoading, isError } = useComplaintDetails(id);
  const { data: timeline } = useComplaintHistory(id);
  const { deleteComplaint, updateStatus } = useComplaintMutations();

  const isOpen = !!id;

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this complaint record? This action is irreversible.")) {
      await deleteComplaint.mutateAsync(id);
      onClose();
    }
  };

  const handleCloseComplaint = async () => {
     if (!id) return;
     if (window.confirm("Verify that the issue has been successfully resolved and close the complaint?")) {
        await updateStatus.mutateAsync({
           id,
           status: ComplaintStatus.CLOSED,
           remarks: "Complaint reviewed and verified closed by Admin."
        });
     }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Complaint Review">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-secondaryText select-none">
          <Spinner size="md" className="mb-2" />
          <span className="text-xs font-semibold">Loading complaint details...</span>
        </div>
      ) : isError || !c ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-secondaryText select-none">
          <AlertOctagon className="h-10 w-10 text-danger mb-2" />
          <h4 className="font-extrabold text-sm text-primaryText dark:text-white mb-1 uppercase tracking-wider">Failed to Load Details</h4>
          <p className="text-xs text-muted">The requested logs could not be fetched.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Badges status */}
          <div className="bg-gray-55/65 dark:bg-gray-955/20 p-4 border border-border dark:border-gray-850 rounded-card space-y-3 select-none">
            <div className="flex justify-between items-center text-xs border-b border-border dark:border-gray-800 pb-2 font-bold">
              <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wider">Workflow Status</span>
              <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase select-none flex items-center gap-1 ${statusBadgeMap[c.status]?.className}`}>
                {statusBadgeMap[c.status]?.icon}
                <span>{statusBadgeMap[c.status]?.label}</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wider">Priority Level</span>
              <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase select-none ${priorityBadgeMap[c.priority]?.className}`}>
                <span className={`pg-badge-dot ${priorityBadgeMap[c.priority]?.dot}`} />
                {priorityBadgeMap[c.priority]?.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wider">Complaint ID:</span>
              <span className="font-mono font-black text-primaryText dark:text-white select-all">
                {c.complaint_number}
              </span>
            </div>
          </div>

          {/* Core details */}
          <div className="space-y-3.5">
            <div>
              <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wide block select-none">Category & Title</span>
              <h4 className="font-extrabold text-sm text-primaryText dark:text-white mt-1">
                [{c.category}] {c.title}
              </h4>
            </div>
            <div>
              <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wide block select-none mb-1">Issue Description</span>
              <p className="text-xs text-secondaryText dark:text-gray-300 whitespace-pre-wrap bg-gray-50/50 dark:bg-gray-955/20 p-3.5 rounded-card border border-border dark:border-gray-850 leading-relaxed">
                {c.description}
              </p>
            </div>
          </div>

          {/* Tenant details */}
          <div className="select-none">
            <h5 className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-850 pb-2 mb-3.5">Lodging Context</h5>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
              <div>
                <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wide block">Tenant Account</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5">{c.tenant_name}</p>
              </div>
              <div>
                <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wide block">Hostel / PG Room</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5">
                  {c.hostel_name || "N/A"}{" "}
                  <span className="text-[10px] font-extrabold text-primary block">Room: {c.room_number || "N/A"}</span>
                </p>
              </div>
              <div>
                <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wide block">Assigned Crew Staff</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5">
                  {c.maintenance_name || <span className="text-[10px] font-bold text-warning italic">Unassigned</span>}
                </p>
              </div>
              <div>
                <span className="text-muted dark:text-gray-555 uppercase text-[9px] tracking-wide block">Filed Date</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5 tabular-nums">
                  {new Date(c.created_at || c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="pt-4 border-t border-border dark:border-gray-800">
            <h5 className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-850 pb-2 mb-3">Attachments Proof</h5>
            <PhotoGallery images={c.images || []} />
          </div>

          {/* Resolution Note if status resolved */}
          {c.resolution_notes && (
            <div className="bg-green-50/50 dark:bg-green-950/15 border border-green-200/50 p-4 rounded-card space-y-1 select-none">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Resolution notes</span>
              <p className="text-xs text-secondaryText dark:text-gray-300 leading-relaxed">
                 {c.resolution_notes}
              </p>
            </div>
          )}

          {/* History timeline */}
          <div className="pt-4 border-t border-border dark:border-gray-800">
            <h5 className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-850 pb-2 mb-4 select-none">Timeline log</h5>
            <Timeline history={timeline || []} />
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-border dark:border-gray-800 flex flex-col gap-2.5 select-none">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onAssignCrew}
                className="inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer border-border dark:border-gray-800 h-9.5"
              >
                <Wrench className="h-4 w-4 text-muted" />
                <span>Assign Staff</span>
              </Button>
              <Button
                variant="outline"
                onClick={onChangeStatus}
                className="inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer border-border dark:border-gray-800 h-9.5"
              >
                <RefreshCw className="h-4 w-4 text-muted" />
                <span>Update Status</span>
              </Button>
            </div>

            {c.status === ComplaintStatus.RESOLVED && (
              <Button
                onClick={handleCloseComplaint}
                className="w-full inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer h-9.5 text-white animate-pulse"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Verify & Close Ticket</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDelete}
              className="w-full inline-flex items-center justify-center gap-1.5 font-bold text-danger border-red-200 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-955/15 cursor-pointer h-9.5 mt-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Complaint</span>
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default ComplaintDetailsDrawer;
