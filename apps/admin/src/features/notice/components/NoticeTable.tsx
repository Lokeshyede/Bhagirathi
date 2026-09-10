import React from "react";
import { Eye, Megaphone, CheckCircle2, Clock, Archive, FileEdit } from "lucide-react";
import { Notice } from "@bhagirathi/types";
import { NoticeStatus, NoticePriority, NoticeTargetType } from "@bhagirathi/constants";
import { Button } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface NoticeTableProps {
  notices: Notice[];
  onSelect: (id: string) => void;
}

export const statusBadgeMap: Record<string, { label: string; className: string; dot: string; icon: React.ReactNode }> = {
  [NoticeStatus.DRAFT]: {
    label: "Draft",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted",
    icon: <FileEdit className="h-3 w-3" />
  },
  [NoticeStatus.SCHEDULED]: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-955/30",
    dot: "bg-info",
    icon: <Clock className="h-3 w-3" />
  },
  [NoticeStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    dot: "bg-success",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  [NoticeStatus.EXPIRED]: {
    label: "Expired",
    className: "bg-amber-50 text-amber-705 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-200 dark:border-amber-955/30",
    dot: "bg-warning",
    icon: <Clock className="h-3 w-3" />
  },
  [NoticeStatus.ARCHIVED]: {
    label: "Archived",
    className: "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    dot: "bg-danger",
    icon: <Archive className="h-3 w-3" />
  },
};

export const priorityBadgeMap: Record<string, { label: string; className: string; dot: string }> = {
  [NoticePriority.NORMAL]: {
    label: "Normal",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted"
  },
  [NoticePriority.IMPORTANT]: {
    label: "Important",
    className: "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
    dot: "bg-info"
  },
  [NoticePriority.URGENT]: {
    label: "Urgent",
    className: "bg-orange-50 text-orange-700 dark:bg-orange-955/20 dark:text-orange-400 border border-orange-200 dark:border-orange-955/30",
    dot: "bg-orange-500"
  },
  [NoticePriority.EMERGENCY]: {
    label: "Emergency",
    className: "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    dot: "bg-danger"
  },
};

function renderTargetSummary(notice: Notice): string {
  if (!notice.targets || notice.targets.length === 0) return "No Targets";
  const types = notice.targets.map((t) => t.target_type);
  if (types.includes(NoticeTargetType.ALL)) return "All Tenants";
  return `Custom (${notice.targets.length} groups)`;
}

export const NoticeTable: React.FC<NoticeTableProps> = ({ notices, onSelect }) => {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card text-center h-[350px] select-none">
        <Megaphone className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3 animate-pulse" />
        <h3 className="text-sm font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">No notices found</h3>
        <p className="text-xs text-muted dark:text-gray-550 max-w-sm leading-relaxed">
          No notices matches your active query filters. Try adjusting target details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="pg-table">
          <thead>
            <tr className="select-none">
              <th className="pl-5">Notice ID</th>
              <th>Title & Audience</th>
              <th>Priority Level</th>
              <th>Status</th>
              <th>Publish / Expiry</th>
              <th>Read Ratio</th>
              <th className="text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((n, i) => {
              const statusBadge = statusBadgeMap[n.status] ?? { label: n.status, className: "bg-gray-150 text-gray-800", dot: "bg-muted", icon: null };
              const priorityBadge = priorityBadgeMap[n.priority] ?? { label: n.priority, className: "bg-gray-150 text-gray-800", dot: "bg-muted" };

              return (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
                >
                  {/* ID */}
                  <td className="pl-5 font-mono text-xs font-bold text-secondaryText dark:text-gray-400 select-all tracking-wider select-none">
                    {n.notice_number}
                  </td>

                  {/* Title */}
                  <td>
                    <p className="font-bold text-primaryText dark:text-white truncate max-w-[200px]" title={n.title}>
                      {n.title}
                    </p>
                    <span className="text-[9px] font-bold text-primary dark:text-red-400 uppercase block tracking-wider mt-0.5 select-none">
                      {renderTargetSummary(n)}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold select-none ${priorityBadge.className}`}>
                      <span className={`pg-badge-dot ${priorityBadge.dot}`} />
                      {priorityBadge.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold select-none flex items-center gap-1 w-fit ${statusBadge.className}`}>
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="select-none">
                    <p className="font-semibold text-secondaryText dark:text-gray-300 tabular-nums">
                      {n.publish_date ? new Date(n.publish_date).toLocaleDateString("en-IN") : "Immediate"}
                    </p>
                    <p className="text-[10px] text-muted dark:text-gray-550 mt-0.5 tabular-nums">
                      Expiry: {n.expiry_date ? new Date(n.expiry_date).toLocaleDateString("en-IN") : "Permanent"}
                    </p>
                  </td>

                  {/* Reads */}
                  <td className="select-none">
                    {n.status === NoticeStatus.DRAFT || n.status === NoticeStatus.SCHEDULED ? (
                      <span className="text-[10px] font-medium text-muted dark:text-gray-550 italic">Scheduled</span>
                    ) : (
                      <div>
                        <p className="font-black text-primaryText dark:text-white tabular-nums">
                          {n.read_count}/{n.target_count}
                        </p>
                        <p className="text-[10px] text-muted dark:text-gray-555 mt-0.5">
                          {n.read_rate !== undefined ? `${n.read_rate.toFixed(0)}%` : "0%"} rate
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="pr-5 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => onSelect(n.id)}
                      className="inline-flex items-center gap-1 h-8 text-[10px] px-2.5 font-bold cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-muted" />
                      <span>View Notice</span>
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoticeTable;
