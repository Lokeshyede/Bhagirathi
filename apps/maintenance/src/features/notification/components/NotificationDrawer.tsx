import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, CheckCheck, Bell } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useNotifications, useNotificationMutations, useUnreadCount } from "../hooks/api/useNotification";
import { NotificationList } from "./NotificationList";
import { useAuthStore } from "../../../store/auth";

export const NotificationDrawer: React.FC = () => {
  const { isOpen, closeDrawer } = useNotificationStore();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "MAINTENANCE";

  const { data: notifications = [], isLoading } = useNotifications({
    limit: 10,
    statusFilter: "UNREAD"
  });

  const { markAsRead, markAllAsRead, archiveNotification, deleteNotification } = useNotificationMutations();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDrawer]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        const isBellClicked = (event.target as HTMLElement).closest(".bell-trigger-btn");
        if (!isBellClicked) {
          closeDrawer();
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div 
          ref={drawerRef}
          className="w-screen max-w-md bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        >
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/20">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white" id="slide-over-title">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-500">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <CheckCheck className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-none space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider mb-2">
              <span>Unread alerts</span>
              <Link to="/notifications" onClick={closeDrawer} className="text-red-600 hover:underline">
                View History
              </Link>
            </div>
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              role={role}
              onMarkRead={(id) => markAsRead.mutate(id)}
              onArchive={(id) => archiveNotification.mutate(id)}
              onDelete={(id) => deleteNotification.mutate(id)}
            />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
            <Link
              to="/notifications"
              onClick={closeDrawer}
              className="flex w-full justify-center items-center px-4 py-2.5 border border-gray-200 dark:border-gray-800 text-sm font-bold rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition cursor-pointer bg-white dark:bg-gray-900"
            >
              See All Activity History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
