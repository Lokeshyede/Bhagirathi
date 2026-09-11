import React from "react";
import { ChevronLeft, ChevronRight, LogOut, X, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../design-system/utils";
import { Navigation } from "../Navigation";
import { NavGroup, UserProfile } from "../../types";
import { BhagirathiLogo } from "../../../components/brand";

export interface SidebarProps {
  brandName: string;
  portalName: string;
  brandIcon?: any; // Optional icon fallback
  customLogo?: React.ReactNode;
  groups: NavGroup[];
  activePath: string;
  user: UserProfile | null;
  onLogout?: () => void;
  
  // Collapse state (controlled from layout state)
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  
  // Mobile drawer state
  isMobileOpen: boolean;
  onMobileClose: () => void;
  
  // Link component and click handlers
  LinkComponent?: any;
  onItemClick?: () => void; // call when navigation happens (useful to auto-close mobile drawer)
  avatarGradient?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  brandName,
  portalName,
  brandIcon: BrandIcon = Building2,
  customLogo,
  groups,
  activePath,
  user,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  LinkComponent,
  onItemClick,
  avatarGradient = "from-primary to-red-700",
}) => {
  const sidebarWidth = isCollapsed ? "w-[68px]" : "w-64";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // Sidebar Inner Content
  const sidebarContent = (mobile = false) => {
    const collapsed = mobile ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-sidebar border-r border-border select-none dark:bg-gray-950 dark:border-gray-900">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border flex-shrink-0 dark:border-gray-900">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {customLogo ? (
              customLogo
            ) : (
              <BhagirathiLogo
                size={collapsed ? "xs" : "md"}
                className={cn(
                  "shrink-0",
                  collapsed ? "h-7 w-auto max-h-[28px]" : "h-10 w-auto max-h-[40px]"
                )}
              />
            )}
            {!collapsed && (
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-text-primary dark:text-white leading-tight truncate">
                  {brandName}
                </p>
                <p className="text-[9px] text-text-secondary dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5 truncate">
                  {portalName}
                </p>
              </div>
            )}
          </div>

          {/* Close button for Mobile, Collapse toggle button for Desktop */}
          {mobile ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-button text-text-secondary hover:bg-background dark:hover:bg-gray-900 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-button text-text-secondary hover:bg-background dark:hover:bg-gray-800 transition cursor-pointer shrink-0"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          <Navigation
            groups={groups}
            activePath={activePath}
            isCollapsed={collapsed}
            onItemClick={() => {
              if (mobile) onMobileClose();
              onItemClick?.();
            }}
            LinkComponent={LinkComponent}
          />
        </div>

        {/* User profile footer */}
        <div className="flex-shrink-0 p-3 border-t border-border dark:border-gray-900">
          <div className={cn("flex items-center gap-3 px-2 py-2 mb-1", collapsed ? "justify-center" : "")}>
            <div className={cn(
              "h-8 w-8 rounded-full bg-gradient-to-br text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm uppercase",
              avatarGradient
            )}>
              {initials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary dark:text-white truncate leading-none">
                  {user?.name || "User Profile"}
                </p>
                <p className="text-[9px] text-text-muted mt-1 truncate">
                  {user?.email || ""}
                </p>
              </div>
            )}
          </div>

          {onLogout && !collapsed && (
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-bold uppercase tracking-wider text-text-secondary hover:bg-danger-light/20 hover:text-danger dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition duration-150 cursor-pointer outline-none"
            >
              <LogOut className="h-4 w-4 shrink-0 text-text-muted" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: isCollapsed ? 68 : 256 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={cn(
          "hidden lg:flex flex-col h-screen overflow-hidden z-20 shrink-0",
          sidebarWidth
        )}
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
              className="relative w-64 h-full flex flex-col z-10"
            >
              {sidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
