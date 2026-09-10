import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../../../design-system/utils";
import { BreadcrumbItem } from "../../types";

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onItemClick,
  className,
}) => {
  return (
    <nav
      className={cn(
        "flex items-center gap-1.5 text-xs text-text-secondary select-none font-medium truncate",
        className
      )}
      aria-label="Breadcrumb"
    >
      <div 
        onClick={() => onItemClick?.({ label: "Home", href: "/" })}
        className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
      </div>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <div
              onClick={() => !isLast && onItemClick?.(item)}
              className={cn(
                "flex items-center gap-1 transition-colors truncate",
                isLast
                  ? "text-text-primary font-bold dark:text-white"
                  : "hover:text-text-primary cursor-pointer"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
