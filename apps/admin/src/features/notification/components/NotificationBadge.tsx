import React from "react";

interface NotificationBadgeProps {
  type: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ type }) => {
  let color = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
  if (type === "SUCCESS") {
    color = "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30";
  } else if (type === "WARNING") {
    color = "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30";
  } else if (type === "ERROR") {
    color = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}`}>
      {type}
    </span>
  );
};
