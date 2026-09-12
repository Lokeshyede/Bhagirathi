import React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../../../design-system/utils";
import { BhagirathiLogo } from "../../../components/brand";

export interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen?: boolean;
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
  isMenuOpen = false,
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
        "h-14 sm:h-16 px-3 sm:px-5 border-b border-border bg-white/95 backdrop-blur-md flex items-center justify-between z-10 shrink-0 sticky top-0 dark:bg-gray-900/95 dark:border-gray-800 select-none shadow-sm",
        className
      )}
    >
      {/* Left side:
          Mobile: Bhagirathi multicolor circular logo (clean & compact, approx 32px, NO text beside it)
          Desktop: Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Mobile Logo: Clean multicolor circular logo */}
        <div className="lg:hidden flex items-center shrink-0">
          <BhagirathiLogo size="sm" className="h-8 w-8 shrink-0" />
        </div>

        {/* Desktop Breadcrumb */}
        {breadcrumb && <div className="hidden lg:block min-w-0">{breadcrumb}</div>}
      </div>

      {/* Right side:
          Mobile: [Bell] [☰ Hamburger]
          Desktop: Search, Date, Theme Toggle, Notification Bell, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Desktop Search Bar */}
        {searchTrigger && <div className="hidden sm:block">{searchTrigger}</div>}

        {/* Desktop Date Display */}
        {showDate && (
          <span className="hidden xl:inline-flex items-center justify-center px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-background rounded-badge dark:bg-gray-800 select-none">
            {currentDate}
          </span>
        )}

        {/* Desktop Theme Toggle slot */}
        {themeToggle && <div className="hidden lg:flex items-center">{themeToggle}</div>}

        {/* Notifications slot (Visible on both Mobile & Desktop) */}
        {notificationDropdown && <div className="flex items-center">{notificationDropdown}</div>}

        {/* Desktop Divider line */}
        {(profileDropdown || notificationDropdown) && (
          <div className="hidden lg:block h-6 w-px bg-border dark:bg-gray-700 mx-1" />
        )}

        {/* Desktop Profile Dropdown slot */}
        {profileDropdown && <div className="hidden lg:flex items-center">{profileDropdown}</div>}

        {/* Mobile Hamburger / Sidebar button (Far Right) */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-text-secondary hover:bg-background dark:text-gray-400 dark:hover:bg-gray-800 transition shrink-0 cursor-pointer outline-none"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
