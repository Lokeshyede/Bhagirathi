import React from "react";
import { useUnreadCount } from "../hooks/api/useNotification";

export const UnreadCounter: React.FC = () => {
  const { data } = useUnreadCount();
  const count = data?.count || 0;

  if (count === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-650 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-gray-900">
      {count > 99 ? "99+" : count}
    </span>
  );
};
