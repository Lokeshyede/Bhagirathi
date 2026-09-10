import React from "react";
import { Eye } from "lucide-react";
import { Notice } from "@bhagirathi/types";
import { statusBadgeMap, priorityBadgeMap } from "./NoticeTable";
import { NoticeStatus } from "@bhagirathi/constants";
import { motion } from "framer-motion";

interface NoticeCardProps {
  notices: Notice[];
  onSelect: (id: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notices, onSelect }) => {
  if (notices.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {notices.map((n) => {
        const statusBadge = statusBadgeMap[n.status] ?? { label: n.status, className: "bg-gray-100 text-gray-800", dot: "bg-muted", icon: null };
        const priorityBadge = priorityBadgeMap[n.priority] ?? { label: n.priority, className: "bg-gray-100 text-gray-800", dot: "bg-muted" };

        return (
          <motion.div
            key={n.id}
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-card hover:shadow-card-hover transition flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="min-w-0 select-none">
                  <span className="font-mono text-[10px] font-bold text-muted dark:text-gray-550 bg-gray-50 dark:bg-gray-955 px-1.5 py-0.5 border border-border dark:border-gray-800 rounded select-all">
                    {n.notice_number}
                  </span>
                  <h4 className="font-bold text-sm text-primaryText dark:text-white leading-snug mt-2.5 truncate" title={n.title}>
                    {n.title}
                  </h4>
                </div>
                <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider select-none shrink-0 ${priorityBadge.className}`}>
                  <span className={`pg-badge-dot ${priorityBadge.dot}`} />
                  {priorityBadge.label}
                </span>
              </div>

              {/* Content */}
              <p className="text-xs text-secondaryText dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed h-8">
                {n.content}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs py-3 border-y border-gray-150/45 dark:border-gray-850/45 mb-4 select-none">
                <div>
                  <span className="text-[9px] text-muted dark:text-gray-500 uppercase font-bold tracking-wider">Publish Date</span>
                  <p className="font-bold text-primaryText dark:text-gray-300 mt-0.5 tabular-nums">
                    {n.publish_date ? new Date(n.publish_date).toLocaleDateString("en-IN") : "Immediate"}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-muted dark:text-gray-500 uppercase font-bold tracking-wider">Read Rate</span>
                  <p className="font-bold text-primaryText dark:text-gray-300 mt-0.5 tabular-nums">
                    {n.status === NoticeStatus.DRAFT || n.status === NoticeStatus.SCHEDULED ? (
                      <span className="text-[10px] italic text-muted">N/A</span>
                    ) : (
                      <span>
                        {n.read_count}/{n.target_count} ({n.read_rate !== undefined ? `${n.read_rate.toFixed(0)}%` : "0%"})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-muted dark:text-gray-500 uppercase font-bold tracking-wider">Status</span>
                  <div className="mt-1">
                    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${statusBadge.className}`}>
                      {statusBadge.icon}
                      <span>{statusBadge.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => onSelect(n.id)}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9.5 rounded-button bg-gray-50 hover:bg-gray-100 dark:bg-gray-955 border border-border dark:border-gray-800 text-xs font-bold text-secondaryText hover:text-primaryText dark:text-gray-300 transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 text-muted" />
              <span>Review Notice</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default NoticeCard;
