import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink, ShieldAlert, Sparkles, Info, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../design-system/utils";
import { NotificationItem } from "../../types";

export interface NotificationDropdownProps {
  items: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onItemClick?: (item: NotificationItem) => void;
  onViewAllClick?: () => void;
  className?: string;
}

const typeIcons = {
  info: Info,
  success: Check,
  warning: ShieldAlert,
  danger: ShieldAlert,
  maintenance: Wrench,
  reserved: Sparkles,
};

const typeColors = {
  info: "text-info bg-info-light dark:bg-blue-950/20 dark:text-blue-400",
  success: "text-success bg-success-light dark:bg-green-950/20 dark:text-green-400",
  warning: "text-warning bg-warning-light dark:bg-amber-950/20 dark:text-amber-400",
  danger: "text-danger bg-danger-light dark:bg-red-950/20 dark:text-red-400",
  maintenance: "text-maintenance bg-gray-200 dark:bg-gray-850 dark:text-gray-400",
  reserved: "text-reserved bg-purple-100 dark:bg-purple-950/20 dark:text-purple-400",
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  items,
  onMarkAllAsRead,
  onItemClick,
  onViewAllClick,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = items.filter((i) => !i.isRead).length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-button text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-850 transition outline-none cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-gray-900 animate-in zoom-in duration-200">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 rounded-dialog bg-white border border-border shadow-dropdown z-30 overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-800 select-none">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary dark:text-white">
                Notifications
              </h4>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                    setIsOpen(false);
                  }}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-divider dark:divide-gray-850">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center select-none">
                  <p className="text-xs font-semibold text-text-secondary">All caught up!</p>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">
                    You have no new alerts or notifications.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const Icon = typeIcons[item.type || "info"] || Info;
                  const colorClass = typeColors[item.type || "info"];

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onItemClick?.(item);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex gap-3 p-3.5 hover:bg-background transition duration-150 cursor-pointer text-left relative dark:hover:bg-gray-850",
                        !item.isRead && "bg-primary-light/5"
                      )}
                    >
                      {/* Unread indicator dot */}
                      {!item.isRead && (
                        <span className="absolute top-4.5 right-4 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}

                      {/* Icon */}
                      <span className={cn("p-2 h-8 w-8 rounded-icon flex items-center justify-center shrink-0", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </span>

                      {/* Content */}
                      <div className="overflow-hidden pr-2">
                        <p className={cn(
                          "text-xs font-semibold truncate leading-tight",
                          item.isRead ? "text-text-primary dark:text-white" : "text-primary font-bold"
                        )}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1 font-semibold uppercase tracking-wider select-none">
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {onViewAllClick && (
              <button
                onClick={() => {
                  onViewAllClick();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 w-full py-3 border-t border-border bg-sidebar text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-background transition dark:bg-gray-900/50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <span>View all notifications</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
