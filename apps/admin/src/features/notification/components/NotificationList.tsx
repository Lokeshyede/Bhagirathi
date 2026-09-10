import React from "react";
import { Notification } from "@bhagirathi/types";
import { NotificationCard } from "./NotificationCard";
import { EmptyState } from "./EmptyState";

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  role: string;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  role,
  onMarkRead,
  onArchive,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-xl border border-gray-150 bg-white dark:bg-gray-900 dark:border-gray-800 animate-pulse"
          >
            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-5/6 bg-gray-250 dark:bg-gray-805 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif) => (
        <NotificationCard
          key={notif.id}
          notification={notif}
          role={role}
          onMarkRead={onMarkRead}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
