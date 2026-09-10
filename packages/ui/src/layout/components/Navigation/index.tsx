import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../design-system/utils";
import { NavItem, NavGroup } from "../../types";

export interface NavigationProps {
  groups: NavGroup[];
  activePath: string;
  isCollapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
  LinkComponent?: any; // e.g. Link from react-router-dom
}

export const Navigation: React.FC<NavigationProps> = ({
  groups,
  activePath,
  isCollapsed = false,
  onItemClick,
  LinkComponent,
}) => {
  // Track which collapsible groups are open.
  // Default: open groups that contain the active path.
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initialOpen = new Set<string>();
    groups.forEach((group) => {
      if (group.collapsible) {
        const hasActive = group.items.some((item) =>
          activePath.startsWith(item.path)
        );
        if (hasActive) {
          initialOpen.add(group.label);
        }
      }
    });
    return initialOpen;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <nav className="space-y-6 select-none">
      {groups.map((group) => {
        // Skip rendering empty groups
        if (group.items.length === 0) return null;

        const isGroupCollapsible = group.collapsible === true && !isCollapsed;
        const isGroupOpen = !isGroupCollapsible || openGroups.has(group.label);
        const hasActiveItem = group.items.some((item) =>
          activePath.startsWith(item.path)
        );

        return (
          <div key={group.label} className="space-y-0.5">
            {/* Group header — either plain label or collapsible button */}
            {!isCollapsed ? (
              isGroupCollapsible ? (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "flex items-center justify-between w-full px-3.5 py-1 mb-1 rounded-button transition-colors duration-150",
                    "text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted",
                    "hover:bg-background dark:hover:bg-gray-850",
                    hasActiveItem && !isGroupOpen
                      ? "text-primary/80 dark:text-red-400/70"
                      : ""
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform duration-200 text-text-muted",
                      isGroupOpen ? "rotate-90" : ""
                    )}
                  />
                </button>
              ) : (
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted px-3.5 mb-2">
                  {group.label}
                </p>
              )
            ) : (
              <div className="border-t border-border/60 dark:border-gray-800/60 my-3 mx-2" />
            )}

            {/* Nav items — animated for collapsible groups */}
            <AnimatePresence initial={false}>
              {isGroupOpen && (
                <motion.div
                  key={`${group.label}-items`}
                  initial={isGroupCollapsible ? { height: 0, opacity: 0 } : false}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 pb-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activePath.startsWith(item.path);

                      const content = (
                        <>
                          {/* Active highlight side-bar indicator */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-primary rounded-r-full" />
                          )}

                          <span
                            className={cn(
                              "p-1.5 rounded-icon flex-shrink-0 transition-colors duration-150",
                              isActive
                                ? "bg-primary/10 dark:bg-red-950/30"
                                : "group-hover:bg-background dark:group-hover:bg-gray-850"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0 transition-colors duration-150",
                                isActive
                                  ? "text-primary dark:text-red-400"
                                  : "text-text-muted dark:text-gray-500 group-hover:text-text-secondary dark:group-hover:text-gray-300"
                              )}
                            />
                          </span>

                          {!isCollapsed && (
                            <span className="truncate pr-1">{item.name}</span>
                          )}

                          {!isCollapsed && item.badge !== undefined && (
                            <span
                              className={cn(
                                "ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide shrink-0 transition-colors duration-150",
                                isActive
                                  ? "bg-primary text-white"
                                  : "bg-background text-text-secondary dark:bg-gray-850 dark:text-gray-400"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      );

                      const baseClasses = cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-bold uppercase tracking-wider transition-all duration-150 relative group outline-none w-full text-left",
                        isCollapsed ? "justify-center" : "",
                        isActive
                          ? "bg-primary-light text-primary font-extrabold dark:bg-red-950/20 dark:text-red-400"
                          : "text-text-secondary dark:text-gray-400 hover:bg-background hover:text-text-primary dark:hover:bg-gray-850"
                      );

                      if (LinkComponent) {
                        return (
                          <LinkComponent
                            key={item.name}
                            to={item.path}
                            onClick={() => onItemClick?.(item)}
                            className={baseClasses}
                            title={isCollapsed ? item.name : undefined}
                          >
                            {content}
                          </LinkComponent>
                        );
                      }

                      return (
                        <button
                          key={item.name}
                          onClick={() => onItemClick?.(item)}
                          className={baseClasses}
                          title={isCollapsed ? item.name : undefined}
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
};

export default Navigation;
