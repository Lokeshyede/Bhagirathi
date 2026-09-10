import React from "react";
import { Eye } from "lucide-react";
import { Complaint } from "@bhagirathi/types";
import { statusBadgeMap, priorityBadgeMap } from "./ComplaintTable";
import { motion } from "framer-motion";

interface ComplaintCardProps {
  complaints: Complaint[];
  onSelect: (id: string) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaints, onSelect }) => {
  if (complaints.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {complaints.map((c) => {
        const statusBadge = statusBadgeMap[c.status] ?? { label: c.status, className: "bg-gray-100 text-gray-800", dot: "bg-muted", icon: null };
        const priorityBadge = priorityBadgeMap[c.priority] ?? { label: c.priority, className: "bg-gray-100 text-gray-800", dot: "bg-muted" };

        return (
          <motion.div
            key={c.id}
            whileHover={{ y: -2, shadow: "0 10px 20px -5px rgba(0,0,0,0.05)" }}
            className="bg-white dark:bg-gray-900 border border-border dark:border-gray-805 rounded-card p-5 shadow-card hover:shadow-card-hover transition flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="min-w-0 select-none">
                  <span className="font-mono text-[10px] font-bold text-muted dark:text-gray-500 bg-gray-50 dark:bg-gray-955 px-1.5 py-0.5 border border-border dark:border-gray-800 rounded select-all">
                    {c.complaint_number}
                  </span>
                  <h4 className="font-bold text-sm text-primaryText dark:text-white leading-snug mt-2.5 truncate" title={c.title}>
                    {c.title}
                  </h4>
                </div>
                <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider select-none shrink-0 ${priorityBadge.className}`}>
                  <span className={`pg-badge-dot ${priorityBadge.dot}`} />
                  {priorityBadge.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-secondaryText dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed h-8">
                {c.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs py-3 border-y border-gray-150/45 dark:border-gray-850/45 mb-4 select-none">
                <div>
                  <span className="text-[9px] text-muted dark:text-gray-500 uppercase font-bold tracking-wider">Tenant</span>
                  <p className="font-bold text-primaryText dark:text-gray-300 mt-0.5 truncate">{c.tenant_name}</p>
                </div>
                <div>
                  <span className="text-[9px] text-muted dark:text-gray-500 uppercase font-bold tracking-wider">Category / Room</span>
                  <p className="font-bold text-primaryText dark:text-gray-305 mt-0.5 leading-tight">
                    {c.category}{" "}
                    <span className="text-[10px] font-extrabold text-primary dark:text-red-400 block">Room {c.room_number || "N/A"}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-muted dark:text-gray-500 uppercase font-bold tracking-wider">Assigned Staff</span>
                  <p className="font-bold text-primaryText dark:text-gray-300 mt-0.5 truncate">
                    {c.maintenance_name || <span className="text-[10px] font-bold text-warning italic">Unassigned</span>}
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

            {/* Action */}
            <button
              onClick={() => onSelect(c.id)}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9.5 rounded-button bg-gray-50 hover:bg-gray-100 dark:bg-gray-955 border border-border dark:border-gray-800 text-xs font-bold text-secondaryText hover:text-primaryText dark:text-gray-300 transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 text-muted" />
              <span>Review Request</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ComplaintCard;
