import React from "react";
import { Link } from "react-router-dom";
import { Notification } from "@bhagirathi/types";
import { Receipt, CreditCard, Wrench, Megaphone, ShieldAlert, Check, Archive, Trash2 } from "lucide-react";
import { NotificationBadge } from "./NotificationBadge";

interface NotificationCardProps {
  notification: Notification;
  role: string;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

const getModuleIcon = (module: string) => {
  switch (module.toUpperCase()) {
    case "RENT":
      return <Receipt className="h-5 w-5 text-orange-600" />;
    case "PAYMENT":
      return <CreditCard className="h-5 w-5 text-green-600" />;
    case "COMPLAINT":
      return <Wrench className="h-5 w-5 text-blue-600" />;
    case "NOTICE":
      return <Megaphone className="h-5 w-5 text-purple-600" />;
    default:
      return <ShieldAlert className="h-5 w-5 text-gray-500" />;
  }
};

const getModuleLink = (module: string, role: string) => {
  const normModule = module.toUpperCase();
  const normRole = role.toUpperCase();

  if (normRole === "ADMIN") {
    switch (normModule) {
      case "RENT": return "/rent";
      case "PAYMENT": return "/payments";
      case "COMPLAINT": return "/complaints";
      case "NOTICE": return "/notices";
      default: return "/dashboard";
    }
  } else if (normRole === "TENANT") {
    switch (normModule) {
      case "RENT": return "/rent-details";
      case "PAYMENT": return "/payment-history";
      case "COMPLAINT": return "/complaints";
      case "NOTICE": return "/notices";
      default: return "/dashboard";
    }
  } else {
    switch (normModule) {
      case "COMPLAINT": return "/complaints";
      default: return "/dashboard";
    }
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  role,
  onMarkRead,
  onArchive,
  onDelete
}) => {
  const isUnread = notification.status === "UNREAD";
  const isArchived = notification.status === "ARCHIVED";
  const redirectLink = getModuleLink(notification.source_module, role);

  return (
    <div
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all duration-200 ${
        isUnread
          ? "bg-red-50/40 border-red-100 hover:border-red-200 shadow-sm dark:bg-red-950/5 dark:border-red-900/10 dark:hover:border-red-900/20"
          : "bg-white border-gray-155 hover:border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-760"
      }`}
    >
      {isUnread && (
        <span className="absolute top-4 left-2 flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
      )}

      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
        {getModuleIcon(notification.source_module)}
      </div>

      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <NotificationBadge type={notification.type} />
          <span className="text-xxs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {notification.source_module}
          </span>
          <span className="text-xxs text-gray-400 dark:text-gray-500 ml-auto">
            {formatRelativeTime(notification.created_at || "")}
          </span>
        </div>
        <Link to={redirectLink} className="block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors cursor-pointer">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
            {notification.title}
          </h4>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5 leading-relaxed break-words">
            {notification.message}
          </p>
        </Link>
      </div>

      <div className="absolute right-4 top-4 flex gap-1 items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 bg-inherit pl-2">
        {isUnread && (
          <button
            onClick={() => onMarkRead(notification.id)}
            title="Mark as Read"
            className="p-1 rounded-md text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        {!isArchived && (
          <button
            onClick={() => onArchive(notification.id)}
            title="Archive"
            className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <Archive className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          title="Delete"
          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
