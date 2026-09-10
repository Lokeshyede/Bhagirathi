import React from "react";
import { Eye, HelpCircle, CircleDot, Wrench, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Complaint } from "@bhagirathi/types";
import { ComplaintStatus, ComplaintPriority } from "@bhagirathi/constants";
import { Button } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface ComplaintTableProps {
  complaints: Complaint[];
  onSelect: (id: string) => void;
}

export const statusBadgeMap: Record<string, { label: string; className: string; dot: string; icon: React.ReactNode }> = {
  [ComplaintStatus.OPEN]: {
    label: "Open Ticket",
    className: "bg-amber-50 text-amber-705 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-200 dark:border-amber-955/30",
    dot: "bg-warning",
    icon: <CircleDot className="h-3 w-3" />,
  },
  [ComplaintStatus.ASSIGNED]: {
    label: "Assigned Staff",
    className: "bg-purple-50 text-purple-750 dark:bg-purple-955/20 dark:text-purple-400 border border-purple-200 dark:border-purple-955/30",
    dot: "bg-purple-650",
    icon: <Wrench className="h-3 w-3" />,
  },
  [ComplaintStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-955/30",
    dot: "bg-info",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  [ComplaintStatus.RESOLVED]: {
    label: "Resolved Ticket",
    className: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    dot: "bg-success",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  [ComplaintStatus.CLOSED]: {
    label: "Closed Case",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted",
    icon: <XCircle className="h-3 w-3" />,
  },
  [ComplaintStatus.REJECTED]: {
    label: "Rejected File",
    className: "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    dot: "bg-danger",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export const priorityBadgeMap: Record<string, { label: string; className: string; dot: string }> = {
  [ComplaintPriority.LOW]: {
    label: "Low Priority",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted",
  },
  [ComplaintPriority.MEDIUM]: {
    label: "Medium Priority",
    className: "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
    dot: "bg-info",
  },
  [ComplaintPriority.HIGH]: {
    label: "High Priority",
    className: "bg-orange-50 text-orange-700 dark:bg-orange-955/20 dark:text-orange-400 border border-orange-200 dark:border-orange-955/30",
    dot: "bg-orange-500",
  },
  [ComplaintPriority.CRITICAL]: {
    label: "Critical Danger",
    className: "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    dot: "bg-danger",
  },
};

const avatarColors = [
  "from-primary to-red-700",
  "from-blue-600 to-blue-700",
  "from-success to-green-700",
  "from-purple-600 to-violet-755",
  "from-warning to-amber-600",
];

function getInitials(name?: string): string {
  if (!name) return "??";
  return name.split(" ").filter(Boolean).map(p => p[0] || "").join("").toUpperCase().slice(0, 2);
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({ complaints, onSelect }) => {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card text-center h-[350px] select-none">
        <HelpCircle className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3 animate-pulse" />
        <h3 className="text-sm font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">No complaints reported</h3>
        <p className="text-xs text-muted dark:text-gray-550 max-w-sm leading-relaxed">
          No complaints fit your criteria. Try adjusting the tags or keywords in your filters bar.
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
              <th className="pl-5">Ticket ID</th>
              <th>Tenant Info</th>
              <th>Issue Description</th>
              <th>Urgency Priority</th>
              <th>Assigned Staff</th>
              <th>Current Status</th>
              <th className="text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(complaints ?? []).map((c, i) => {
              const statusBadge = statusBadgeMap[c.status] ?? { label: c.status, className: "bg-gray-150 text-gray-800", dot: "bg-muted", icon: null };
              const priorityBadge = priorityBadgeMap[c.priority] ?? { label: c.priority, className: "bg-gray-150 text-gray-800", dot: "bg-muted" };
              const colorClass = avatarColors[i % avatarColors.length];

              return (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
                >
                  {/* ID */}
                  <td className="pl-5 select-none">
                    <span className="font-mono text-xs font-bold text-secondaryText dark:text-gray-400 tracking-widest block select-all">
                      {c.complaint_number}
                    </span>
                  </td>

                  {/* Tenant */}
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${colorClass} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none`}>
                        {getInitials(c.tenant_name)}
                      </div>
                      <div>
                        <p className="font-bold text-primaryText dark:text-white leading-tight">
                          {c.tenant_name || "Unknown Tenant"}
                        </p>
                        <span className="text-[9px] text-primary dark:text-red-400 font-bold uppercase tracking-wider mt-0.5 block select-none">
                          Room {c.room_number || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Issue */}
                  <td>
                    <p className="font-bold text-primaryText dark:text-gray-250 truncate max-w-[200px]" title={c.title}>
                      {c.title}
                    </p>
                    <span className="text-[9px] text-muted dark:text-gray-550 uppercase font-bold tracking-widest block mt-0.5 select-none">
                      {c.category}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold select-none ${priorityBadge.className}`}>
                      <span className={`pg-badge-dot ${priorityBadge.dot}`} />
                      {priorityBadge.label}
                    </span>
                  </td>

                  {/* Assigned Staff */}
                  <td>
                    {c.maintenance_name ? (
                      <span className="text-secondaryText dark:text-gray-300 font-bold">
                        {c.maintenance_name}
                      </span>
                    ) : (
                      <span className="pg-badge bg-amber-50 text-amber-700 dark:bg-amber-955/20 border border-amber-150/40 text-[9px] font-bold select-none">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold select-none flex items-center gap-1 ${statusBadge.className}`}>
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="pr-5 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => onSelect(c.id)}
                      className="inline-flex items-center gap-1 h-8 text-[10px] px-2.5 font-bold cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-muted" />
                      <span>Review Complaint</span>
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

export default ComplaintTable;
