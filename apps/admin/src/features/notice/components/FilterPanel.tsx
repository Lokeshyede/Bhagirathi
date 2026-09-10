import React from "react";
import { RotateCcw } from "lucide-react";
import { NoticeStatus, NoticePriority } from "@bhagirathi/constants";

interface FilterPanelProps {
  statusFilter: string;
  priorityFilter: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
  onReset
}) => {
  const statuses = [
    { label: "All Statuses", value: "ALL" },
    { label: "Draft", value: NoticeStatus.DRAFT },
    { label: "Scheduled", value: NoticeStatus.SCHEDULED },
    { label: "Published", value: NoticeStatus.PUBLISHED },
    { label: "Expired", value: NoticeStatus.EXPIRED },
    { label: "Archived", value: NoticeStatus.ARCHIVED }
  ];

  const priorities = [
    { label: "All Priorities", value: "ALL" },
    { label: "Normal", value: NoticePriority.NORMAL },
    { label: "Important", value: NoticePriority.IMPORTANT },
    { label: "Urgent", value: NoticePriority.URGENT },
    { label: "Emergency", value: NoticePriority.EMERGENCY }
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-9 px-3 bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-700 rounded-input text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="h-9 px-3 bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-700 rounded-input text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

      </div>

      <button
        onClick={onReset}
        className="self-end inline-flex items-center gap-1.5 text-xs font-bold text-secondaryText dark:text-gray-300 border border-border dark:border-gray-750 px-4 h-9 rounded-button bg-white dark:bg-gray-955 hover:bg-red-50 hover:text-primary dark:hover:bg-red-950/20 dark:hover:text-red-400 cursor-pointer transition-all"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset Filters</span>
      </button>
    </div>
  );
};
export default FilterPanel;
