import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, MoreHorizontal, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../design-system/utils";

// 1. RE-EXPORTS FROM LAYOUT TO PREVENT DUPLICATION
export { ProfileDropdown } from "../../layout/components/Profile";
export type { ProfileDropdownProps } from "../../layout/components/Profile";
export { NotificationDropdown } from "../../layout/components/Notification";
export type { NotificationDropdownProps } from "../../layout/components/Notification";

// 2. MENU DROPDOWN
export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export interface MenuDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: "left" | "right";
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  trigger,
  items,
  className,
  align = "right",
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

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer flex">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute mt-2 w-48 rounded-dialog bg-white border border-border shadow-dropdown z-[100] overflow-hidden flex flex-col py-1 dark:bg-gray-900 dark:border-gray-800",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-850 dark:hover:text-white transition text-left cursor-pointer outline-none w-full disabled:opacity-50 disabled:pointer-events-none",
                    item.variant === "danger" && "text-danger hover:bg-danger-light/20 hover:text-danger dark:text-red-400 dark:hover:bg-red-950/20"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-text-muted" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 3. ACTION DROPDOWN (TABLE ROW ACTIONS MENU)
export interface ActionDropdownProps {
  items: DropdownItem[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  items,
  orientation = "vertical",
  className,
}) => {
  const TriggerIcon = orientation === "vertical" ? MoreVertical : MoreHorizontal;

  return (
    <MenuDropdown
      align="right"
      className={className}
      trigger={
        <button className="p-1.5 rounded-button text-text-secondary hover:bg-background hover:text-text-primary dark:text-gray-400 dark:hover:bg-gray-800 transition outline-none shrink-0 cursor-pointer">
          <TriggerIcon className="h-4 w-4" />
        </button>
      }
      items={items}
    />
  );
};

// 4. BACKWARD COMPATIBLE TABLE ACTION MENU
export interface TableActionItem {
  label: string;
  icon?: any;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
}

export interface TableActionMenuProps {
  actions: TableActionItem[];
  className?: string;
}

export const TableActionMenu: React.FC<TableActionMenuProps> = ({
  actions,
  className,
}) => {
  const items = actions.map((act) => ({
    label: act.label,
    onClick: act.onClick,
    icon: act.icon,
    variant: act.variant === "danger" ? ("danger" as const) : ("default" as const),
  }));

  return <ActionDropdown items={items} className={className} />;
};

export default MenuDropdown;

