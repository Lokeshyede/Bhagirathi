import React from "react";
import { cn } from "../../../design-system/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  actions,
  filters,
  className,
}) => {
  return (
    <div className={cn("space-y-4 mb-6 select-none", className)}>
      {/* Top row: Breadcrumb (if any) */}
      {breadcrumb && <div className="text-xs">{breadcrumb}</div>}

      {/* Middle row: Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-text-primary dark:text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>

      {/* Bottom row: Filters/Tabs */}
      {filters && (
        <div className="pt-2">
          {filters}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
