import React, { useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useNotifications, useNotificationMutations, useUnreadCount } from "../hooks/api/useNotification";
import { SearchBar } from "../components/SearchBar";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationList } from "../components/NotificationList";
import { Pagination } from "../components/Pagination";
import { PushNotificationCard } from "../components/PushNotificationCard";
import { useAuthStore } from "../../../store/auth";

export const NotificationCenterPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "MAINTENANCE";
  const limit = 10;

  const skip = (page - 1) * limit;

  const { data: notifications = [], isLoading, refetch, isFetching } = useNotifications({
    statusFilter,
    searchQuery,
    skip,
    limit: limit + 1
  });

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  const { markAsRead, markAllAsRead, archiveNotification, deleteNotification } = useNotificationMutations();

  const displayedNotifications = notifications.slice(0, limit);
  const hasNextPage = notifications.length > limit;

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Page Header card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs select-none">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 border border-red-200 dark:border-red-900/30">
            <Bell className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight uppercase tracking-wider">Alert Center</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mt-0.5">
              Manage your alerts and system log activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1.5 px-4 h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer uppercase tracking-wider"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            onClick={() => refetch()}
            className={`p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-950 text-stone-500 transition cursor-pointer ${
              isFetching ? "animate-spin" : ""
            }`}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Web Push Notification Settings & Permission Toggle */}
      <PushNotificationCard />

      {/* 2. Filters card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <NotificationFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />
        <div className="w-full md:w-72">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>
      </div>

      {/* 3. List card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-5">
          <NotificationList
            notifications={displayedNotifications}
            isLoading={isLoading}
            role={role}
            onMarkRead={(id) => markAsRead.mutate(id)}
            onArchive={(id) => archiveNotification.mutate(id)}
            onDelete={(id) => deleteNotification.mutate(id)}
          />
        </div>

        {!isLoading && notifications.length > 0 && (
          <div className="border-t border-slate-100 dark:border-zinc-800 p-[18px] bg-slate-50/50 dark:bg-zinc-950/20">
            <Pagination
              currentPage={page}
              hasNextPage={hasNextPage}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenterPage;
