import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../design-system/utils";
import { UserProfile } from "../../types";

export interface ProfileDropdownProps {
  user: UserProfile | null;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
  avatarGradient?: string;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onLogout,
  onSettingsClick,
  onProfileClick,
  className,
  avatarGradient = "from-primary to-red-700",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 px-2.5 py-1.5 rounded-button hover:bg-background transition group cursor-pointer outline-none select-none dark:hover:bg-gray-800"
      >
        <div className={cn(
          "h-7 w-7 rounded-full bg-gradient-to-br text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm uppercase",
          avatarGradient
        )}>
          {initials}
        </div>
        <div className="hidden md:block text-left min-w-0 max-w-[120px]">
          <p className="text-xs font-bold text-text-primary dark:text-white truncate leading-none">
            {user?.name || "Guest User"}
          </p>
          <p className="text-[10px] text-text-secondary mt-0.5 font-medium truncate capitalize">
            {user?.role || "Visitor"}
          </p>
        </div>
        <ChevronDown className={cn(
          "hidden md:block h-3.5 w-3.5 text-text-muted transition duration-150 shrink-0",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-52 rounded-dialog bg-white border border-border shadow-dropdown z-30 overflow-hidden flex flex-col py-1 dark:bg-gray-900 dark:border-gray-800"
          >
            {/* Header user info */}
            <div className="px-3.5 py-2.5 border-b border-border dark:border-gray-800 select-none">
              <p className="text-xs font-bold text-text-primary dark:text-white truncate">
                {user?.name || "Guest User"}
              </p>
              <p className="text-[10px] text-text-muted truncate mt-0.5">
                {user?.email || "guest@bhagirathi.com"}
              </p>
            </div>

            {/* Menu Items */}
            {onProfileClick && (
              <button
                onClick={() => {
                  onProfileClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white transition text-left cursor-pointer outline-none font-semibold"
              >
                <User className="h-4 w-4 shrink-0 text-text-muted" />
                <span>My Profile</span>
              </button>
            )}

            {onSettingsClick && (
              <button
                onClick={() => {
                  onSettingsClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white transition text-left cursor-pointer outline-none font-semibold"
              >
                <Settings className="h-4 w-4 shrink-0 text-text-muted" />
                <span>Settings</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-danger hover:bg-danger-light/20 transition text-left cursor-pointer outline-none font-bold border-t border-divider dark:border-gray-850"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
