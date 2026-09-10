import React, { useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useNotifications, useNotificationMutations, useUnreadCount } from "../hooks/api/useNotification";
import { SearchBar } from "../components/SearchBar";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationList } from "../components/NotificationList";
import { Pagination } from "../components/Pagination";
import { useAuthStore } from "../../../store/auth";

export const NotificationCenterPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "ADMIN";
  const limit = 10;

  const skip = (page - 1) * limit;

  const { data: notifications = [], isLoading, refetch, isFetching } = useNotifications({
    statusFilter,
    searchQuery,
    skip,
    limit: limit + 1 // Request one more item to determine hasNextPage
  });

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  const { markAsRead, markAllAsRead, archiveNotification, deleteNotification } = useNotificationMutations();

  const displayedNotifications = notifications.slice(0, limit);
  const hasNextPage = notifications.length > limit;

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-1 md:p-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-650">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage your alerts and system log activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-2 px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </button>
          )}
          <button
            onClick={() => refetch()}
            className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 text-gray-650 transition cursor-pointer ${
              isFetching ? "animate-spin" : ""
            }`}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters and Search Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <NotificationFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />
        <div className="w-full md:w-72">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6">
          <NotificationList
            notifications={displayedNotifications}
            isLoading={isLoading}
            role={role}
            onMarkRead={(id) => markAsRead.mutate(id)}
            onArchive={(id) => archiveNotification.mutate(id)}
            onDelete={(id) => deleteNotification.mutate(id)}
          />
        </div>

        {/* Pagination Footer */}
        {!isLoading && notifications.length > 0 && (
          <Pagination
            currentPage={page}
            hasNextPage={hasNextPage}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
};
