import React from "react";
import { Menu } from "lucide-react";
import { cn } from "../../../design-system/utils";

export interface HeaderProps {
  onMenuToggle: () => void;
  breadcrumb?: React.ReactNode;
  mobileTitle?: string;
  searchTrigger?: React.ReactNode;
  themeToggle?: React.ReactNode;
  notificationDropdown?: React.ReactNode;
  profileDropdown?: React.ReactNode;
  className?: string;
  showDate?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  breadcrumb,
  mobileTitle,
  searchTrigger,
  themeToggle,
  notificationDropdown,
  profileDropdown,
  className,
  showDate = true,
}) => {
  const currentDate = showDate
    ? new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <header
      className={cn(
        "h-14 sm:h-16 px-3 sm:px-5 border-b border-border bg-white/85 backdrop-blur-md flex items-center justify-between z-10 shrink-0 sticky top-0 dark:bg-gray-900/85 dark:border-gray-800",
        className
      )}
    >
      {/* Left: Mobile hamburger menu toggle + Breadcrumb / Mobile Title */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-button text-text-secondary hover:bg-background dark:text-gray-400 dark:hover:bg-gray-800 transition shrink-0 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Breadcrumb */}
        {breadcrumb && <div className="hidden lg:block min-w-0">{breadcrumb}</div>}

        {/* Mobile Page Title */}
        {mobileTitle && (
          <span className="lg:hidden text-sm font-bold text-text-primary dark:text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-xs">
            {mobileTitle}
          </span>
        )}
      </div>

      {/* Right: Search, Date, Notification, Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Global Search Bar */}
        {searchTrigger && <div className="hidden sm:block">{searchTrigger}</div>}

        {/* Current Date Display */}
        {showDate && (
          <span className="hidden xl:inline-flex items-center justify-center px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-background rounded-badge dark:bg-gray-800 select-none">
            {currentDate}
          </span>
        )}

        {/* Theme Toggle slot */}
        {themeToggle && <div className="flex items-center">{themeToggle}</div>}

        {/* Notifications slot */}
        {notificationDropdown && <div className="flex items-center">{notificationDropdown}</div>}

        {/* Divider line */}
        {(profileDropdown || notificationDropdown) && (
          <div className="hidden sm:block h-6 w-px bg-border dark:bg-gray-700 mx-1" />
        )}

        {/* Profile Dropdown slot */}
        {profileDropdown && <div className="flex items-center">{profileDropdown}</div>}
      </div>
    </header>
  );
};

export default Header;
