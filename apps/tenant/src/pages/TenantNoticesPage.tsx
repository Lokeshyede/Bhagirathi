import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useTenantNotices,
  useTenantNoticeDetails,
  useMarkNoticeReadMutation
} from "../features/notice/hooks/api/useTenantNotice";
import { NoticePriority } from "@bhagirathi/constants";
import { Button, Drawer } from "@bhagirathi/ui";
import { Megaphone, X, AlertCircle, Eye, Info, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const TenantNoticesPage: React.FC = () => {
  const navigate = useNavigate();
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Queries
  const { data: notices, isLoading, isError, refetch } = useTenantNotices({
    priorityFilter,
    searchQuery
  });

  const { data: activeNotice } = useTenantNoticeDetails(selectedId);
  const markReadMutation = useMarkNoticeReadMutation();

  // Mark notice as read upon select
  useEffect(() => {
    if (selectedId) {
      markReadMutation.mutate(selectedId);
    }
  }, [selectedId]);

  const unreadCount = notices?.filter((n) => !n.is_read).length ?? 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case NoticePriority.EMERGENCY:
        return "text-red-700 bg-red-50 border-red-250 dark:bg-red-955/10 dark:text-red-400 animate-pulse font-black";
      case NoticePriority.URGENT:
        return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-955/15 dark:text-orange-400 font-black";
      case NoticePriority.IMPORTANT:
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-955/15 dark:text-blue-400 font-black";
      default:
        return "text-stone-500 bg-slate-50 border-slate-200 dark:bg-zinc-800 dark:text-stone-400 dark:border-zinc-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto pb-12"
    >
      {/* Title */}
      <div className="flex flex-col gap-4 select-none">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
            </button>
            <div>
              <h1 className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-wider leading-tight flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-red-655" />
                <span>Notice Billboard</span>
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
                Stay updated with hostel bulletins, emergency alerts, and updates.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[9px] font-black text-red-700 animate-pulse shrink-0">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{unreadCount} New Notices</span>
            </div>
          )}
        </div>

        {/* Toolbar filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-zinc-900 p-4 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-2.5 text-stone-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              className="h-10 w-full pl-9 pr-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-stone-850 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-black text-stone-400 dark:text-stone-500 uppercase tracking-wide">Priority Range:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 px-3 bg-slate-55/65 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-stone-700 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value={NoticePriority.NORMAL}>Normal</option>
              <option value={NoticePriority.IMPORTANT}>Important</option>
              <option value={NoticePriority.URGENT}>Urgent</option>
              <option value={NoticePriority.EMERGENCY}>Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notice List */}
      {isLoading ? (
        <div className="space-y-6 pb-12 animate-pulse select-none">
          <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
          <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to load notice feed</h3>
          <Button onClick={() => refetch()} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer mt-4 text-white">Retry Request</Button>
        </div>
      ) : notices && notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedId(n.id)}
              className={`p-5 bg-white dark:bg-zinc-900 border rounded-3xl shadow-sm cursor-pointer hover:border-red-650/40 transition relative flex flex-col justify-between ${
                !n.is_read ? "border-red-600/60 ring-1 ring-red-600/10" : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              {/* Unread indicator */}
              {!n.is_read && (
                <span className="absolute top-5 right-5 h-2 w-2 bg-red-600 rounded-full animate-ping select-none" />
              )}

              <div className="space-y-2.5">
                <div className="flex justify-between items-center select-none">
                  <span className="font-mono text-[9px] font-black text-stone-400 bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 border border-slate-200 dark:border-zinc-800 rounded-lg select-all">
                    #{n.notice_number}
                  </span>
                  <span className={`text-[8.5px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider ${getPriorityBadge(n.priority)}`}>
                    {n.priority}
                  </span>
                </div>

                <h4 className="font-black text-sm text-stone-850 dark:text-white leading-snug line-clamp-2">
                  {n.title}
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-450 line-clamp-3 leading-relaxed font-semibold">
                  {n.content}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800/80 pt-3 mt-4 text-[10px] text-stone-400 font-black select-none">
                <span>Published: {n.publish_date ? new Date(n.publish_date).toLocaleDateString("en-IN") : "Immediate"}</span>
                <span className="text-red-655 inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> <span>Read Notice</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm text-center select-none max-w-sm mx-auto">
          <Info className="h-10 w-10 text-stone-300 dark:text-stone-700 mb-3 animate-pulse" />
          <h3 className="text-sm font-black text-stone-850 dark:text-white mb-2 uppercase tracking-wider">Notice Board Clear</h3>
          <p className="text-xs text-stone-450 dark:text-stone-500 leading-relaxed font-semibold max-w-[250px]">No announcements or bulletins are active for you currently.</p>
        </div>
      )}

      {/* Popup Notice content drawer */}
      <Drawer
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Announcement View"
      >
        {activeNotice && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
              <div>
                <span className="font-mono text-[9px] font-black text-stone-400 bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 border border-slate-200 dark:border-zinc-800 rounded-lg select-all">
                  #{activeNotice.notice_number}
                </span>
                <h3 className="font-black text-sm text-stone-850 dark:text-white mt-3">
                  {activeNotice.title}
                </h3>
              </div>
            </div>

            <div className="flex justify-between items-center select-none">
              <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider">Priority Level</span>
              <span className={`text-[8.5px] font-black py-0.5 px-2 border rounded-full uppercase tracking-wider ${getPriorityBadge(activeNotice.priority)}`}>
                {activeNotice.priority}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block mb-1.5 select-none">Announcement details</span>
              <p className="text-xs text-stone-655 dark:text-stone-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 font-semibold text-wrap-safe">
                {activeNotice.content}
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-stone-400 font-black border-t border-slate-100 dark:border-zinc-800 pb-4 pt-4 select-none">
              <span>Published: {activeNotice.publish_date ? new Date(activeNotice.publish_date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Immediate"}</span>
              {activeNotice.expiry_date && (
                <span className="text-red-600">Expiry: {new Date(activeNotice.expiry_date).toLocaleDateString("en-IN")}</span>
              )}
            </div>

            {/* Acknowledge Action */}
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 select-none">
              <Button onClick={() => setSelectedId(null)} className="btn-primary-tenant w-full font-bold h-10 text-xs rounded-xl cursor-pointer">
                Acknowledge Notice
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
};

export default TenantNoticesPage;
