import React from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { UnreadCounter } from "./UnreadCounter";

export const NotificationBell: React.FC = () => {
  const toggleDrawer = useNotificationStore((state) => state.toggleDrawer);

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      className="bell-trigger-btn relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      <UnreadCounter />
    </button>
  );
};
