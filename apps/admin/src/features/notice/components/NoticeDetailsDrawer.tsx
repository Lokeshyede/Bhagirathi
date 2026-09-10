import React from "react";
import { Send, Archive, Copy, Edit, Trash2, AlertOctagon } from "lucide-react";
import { useNoticeDetails, useNoticeMutations } from "../hooks/api/useNotice";
import { ReadStatistics } from "./ReadStatistics";
import { Drawer, Button, Spinner } from "@bhagirathi/ui";
import { NoticeStatus } from "@bhagirathi/constants";
import { statusBadgeMap, priorityBadgeMap } from "./NoticeTable";

interface NoticeDetailsDrawerProps {
  id: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export const NoticeDetailsDrawer: React.FC<NoticeDetailsDrawerProps> = ({
  id,
  onClose,
  onEdit
}) => {
  const { data: n, isLoading, isError } = useNoticeDetails(id);
  const { publishNotice, archiveNotice, duplicateNotice, deleteNotice } = useNoticeMutations();

  const isOpen = !!id;

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this notice? This action is permanent.")) {
      await deleteNotice.mutateAsync(id);
      onClose();
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    if (window.confirm("Publish this notice to the target tenants immediately?")) {
      await publishNotice.mutateAsync(id);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    if (window.confirm("Archive this notice? It will immediately disappear from all targeted tenants' feeds.")) {
      await archiveNotice.mutateAsync(id);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    try {
      await duplicateNotice.mutateAsync(id);
      alert("Notice duplicated as Draft successfully!");
      onClose();
    } catch (err) {
      alert("Failed to duplicate notice.");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notice Review">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-secondaryText select-none">
          <Spinner size="md" className="mb-2" />
          <span className="text-xs font-semibold">Loading notice details...</span>
        </div>
      ) : isError || !n ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-secondaryText select-none">
          <AlertOctagon className="h-10 w-10 text-danger mb-2" />
          <h4 className="font-extrabold text-sm text-primaryText dark:text-white mb-1 uppercase tracking-wider">Failed to Load Details</h4>
          <p className="text-xs text-muted">The notice record could not be resolved.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status & Priority cards */}
          <div className="bg-gray-55/65 dark:bg-gray-955/20 p-4 border border-border dark:border-gray-850 rounded-card space-y-3 select-none">
            <div className="flex justify-between items-center text-xs border-b border-border dark:border-gray-800 pb-2 font-bold">
              <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wider">Notice Status</span>
              <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase select-none flex items-center gap-1 ${statusBadgeMap[n.status]?.className}`}>
                {statusBadgeMap[n.status]?.icon}
                <span>{statusBadgeMap[n.status]?.label}</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-muted dark:text-gray-555 uppercase text-[9px] tracking-wider">Priority level</span>
              <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase select-none ${priorityBadgeMap[n.priority]?.className}`}>
                <span className={`pg-badge-dot ${priorityBadgeMap[n.priority]?.dot}`} />
                {priorityBadgeMap[n.priority]?.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wider">Notice ID:</span>
              <span className="font-mono font-black text-primaryText dark:text-white select-all">
                {n.notice_number}
              </span>
            </div>
          </div>

          {/* Core details */}
          <div className="space-y-3.5">
            <div>
              <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wide block select-none mb-1">Title</span>
              <h4 className="font-extrabold text-sm text-primaryText dark:text-white leading-snug">
                {n.title}
              </h4>
            </div>
            <div>
              <span className="text-muted dark:text-gray-500 uppercase text-[9px] tracking-wide block select-none mb-1">Content</span>
              <p className="text-xs text-secondaryText dark:text-gray-300 whitespace-pre-wrap bg-gray-55/40 dark:bg-gray-955/20 p-3.5 rounded-card border border-border dark:border-gray-850 leading-relaxed font-semibold">
                {n.content}
              </p>
            </div>
          </div>

          {/* Targeting and metadata */}
          <div className="select-none">
            <h5 className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-855 pb-2 mb-3.5">Publishing Context</h5>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
              <div>
                <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wide block">Created By</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5">{n.created_by_name || "Admin"}</p>
              </div>
              <div>
                <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wide block">Publish Date</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5 tabular-nums">
                  {n.publish_date ? new Date(n.publish_date).toLocaleDateString("en-IN") : "Immediately"}
                </p>
              </div>
              <div>
                <span className="text-muted dark:text-gray-550 uppercase text-[9px] tracking-wide block">Expiry Date</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5 tabular-nums">
                  {n.expiry_date ? new Date(n.expiry_date).toLocaleDateString("en-IN") : "Permanent"}
                </p>
              </div>
              <div>
                <span className="text-muted dark:text-gray-555 uppercase text-[9px] tracking-wide block">Targets Count</span>
                <p className="font-bold text-primaryText dark:text-white mt-0.5">
                  {n.targets?.length ?? 0} audience targets
                </p>
              </div>
            </div>
          </div>

          {/* Read Stats Component */}
          {n.status !== NoticeStatus.DRAFT && n.status !== NoticeStatus.SCHEDULED && (
            <div className="pt-4 border-t border-border dark:border-gray-800">
              <ReadStatistics noticeId={n.id} />
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-6 border-t border-border dark:border-gray-800 flex flex-col gap-2.5 select-none">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => onEdit(n.id)}
                className="inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer border-border dark:border-gray-800 h-9.5"
              >
                <Edit className="h-4 w-4 text-muted" />
                <span>Edit Notice</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDuplicate}
                className="inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer border-border dark:border-gray-800 h-9.5"
              >
                <Copy className="h-4 w-4 text-muted" />
                <span>Duplicate</span>
              </Button>
            </div>

            {n.status === NoticeStatus.DRAFT && (
              <Button
                onClick={handlePublish}
                className="w-full inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer h-9.5 text-white animate-pulse"
              >
                <Send className="h-4 w-4" />
                <span>Publish Immediately</span>
              </Button>
            )}

            {n.status === NoticeStatus.PUBLISHED && (
              <Button
                variant="outline"
                onClick={handleArchive}
                className="w-full inline-flex items-center justify-center gap-1.5 font-bold text-amber-700 border-amber-250 hover:bg-amber-50 cursor-pointer h-9.5"
              >
                <Archive className="h-4 w-4 text-amber-700" />
                <span>Archive Notice</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDelete}
              className="w-full inline-flex items-center justify-center gap-1.5 font-bold text-danger border-red-200 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-955/15 cursor-pointer h-9.5 mt-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Notice</span>
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default NoticeDetailsDrawer;
