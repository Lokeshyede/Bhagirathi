import React from "react";

interface NotificationFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  statusFilter,
  onStatusChange
}) => {
  const statuses = [
    { value: "ALL", label: "All" },
    { value: "UNREAD", label: "Unread" },
    { value: "READ", label: "Read" },
    { value: "ARCHIVED", label: "Archived" }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => onStatusChange(status.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
            statusFilter === status.value
              ? "bg-red-600 border-red-700 text-white shadow-sm"
              : "bg-white border-gray-200 text-gray-750 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};
