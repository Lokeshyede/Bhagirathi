import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Megaphone,
  Home,
  Clock,
} from "lucide-react";
import { ActivityLogData } from "../types";

interface RecentActivityCardProps {
  activities?: ActivityLogData[];
}

const actionConfig: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
  "Tenant Added": {
    icon: <UserPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-100 dark:border-blue-900/40",
  },
  "Payment Verified": {
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/40",
  },
  "Complaint Raised": {
    icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-100 dark:border-amber-900/40",
  },
  "Complaint Resolved": {
    icon: <Wrench className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/40",
  },
  "Notice Published": {
    icon: <Megaphone className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />,
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-100 dark:border-purple-900/40",
  },
  "Room Assigned": {
    icon: <Home className="h-3.5 w-3.5 text-primary" />,
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-100 dark:border-red-900/40",
  },
};

const fallbackConfig = {
  icon: <Activity className="h-3.5 w-3.5 text-secondaryText" />,
  bg: "bg-gray-100 dark:bg-gray-800",
  border: "border-gray-200 dark:border-gray-700",
};

function formatTimeAgo(timestamp: string): string {
  try {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "Recent";
  }
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities = [] }) => {
  const displayActivities = activities.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4 select-none flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-150/70 dark:border-gray-800">
        <div>
          <h3 className="font-black text-sm text-primaryText dark:text-white uppercase tracking-wider">
            Recent Activity
          </h3>
          <p className="text-[11px] text-muted dark:text-gray-400 mt-0.5">
            Latest operational events & actions
          </p>
        </div>

        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-secondaryText">
          <Activity className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Activity Items List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] scrollbar-thin">
        {displayActivities.length === 0 ? (
          <div className="py-8 text-center bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
            <Clock className="h-8 w-8 text-muted mx-auto" />
            <h4 className="font-extrabold text-xs text-primaryText dark:text-white">
              No recent activity
            </h4>
            <p className="text-[11px] text-muted dark:text-gray-400 max-w-xs mx-auto">
              System events, tenant assignments, and payment verifications will appear here.
            </p>
          </div>
        ) : (
          displayActivities.map((act) => {
            const config = actionConfig[act.action] || fallbackConfig;

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${config.border} ${config.bg}`}
                >
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs text-primaryText dark:text-white truncate">
                      {act.action}
                    </span>
                    <span className="text-[10px] text-muted dark:text-gray-500 tabular-nums shrink-0 font-medium">
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondaryText dark:text-gray-400 leading-snug truncate mt-0.5">
                    {act.detail}
                  </p>
                  {act.user_name && (
                    <span className="text-[9px] text-muted dark:text-gray-500 font-semibold block mt-0.5">
                      by {act.user_name}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivityCard;
