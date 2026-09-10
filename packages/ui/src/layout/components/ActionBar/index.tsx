import React from "react";
import { Search, RefreshCw, Download, Upload, Plus } from "lucide-react";
import { cn } from "../../../design-system/utils";
import { Button } from "../../../design-system/buttons";

export interface ActionBarProps {
  // Search state
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;

  // Actions
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  
  // Custom slots
  leftFilters?: React.ReactNode;
  rightActions?: React.ReactNode;
  
  // Primary/Secondary Action triggers
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  primaryActionIcon?: any;
  primaryActionDisabled?: boolean;
  
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  onRefresh,
  onExport,
  onImport,
  leftFilters,
  rightActions,
  primaryActionText,
  onPrimaryAction,
  primaryActionIcon: PrimaryActionIcon = Plus,
  primaryActionDisabled = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border bg-white rounded-card shadow-sm mb-6 dark:bg-gray-900 dark:border-gray-800 select-none",
        className
      )}
    >
      {/* Left side: Search & Custom Filters */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {onSearchChange && (
          <div className="relative flex-1 md:flex-none min-w-[200px] max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9.5 pr-4 h-9.5 w-full rounded-input border border-border bg-white text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition dark:bg-gray-850 dark:border-gray-800 dark:text-white"
            />
          </div>
        )}
        {leftFilters}
      </div>

      {/* Right side: Secondary Actions + Refresh/Export + Primary Action */}
      <div className="flex flex-wrap items-center gap-3">
        {rightActions}

        {/* secondary utility buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 h-9.5 w-9.5 flex items-center justify-center rounded-button border border-border bg-white text-text-secondary hover:bg-background hover:text-text-primary transition dark:bg-gray-850 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer outline-none"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onImport && (
            <button
              onClick={onImport}
              className="p-2 h-9.5 w-9.5 flex items-center justify-center rounded-button border border-border bg-white text-text-secondary hover:bg-background hover:text-text-primary transition dark:bg-gray-850 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer outline-none"
              title="Import Data"
            >
              <Upload className="h-4 w-4" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 h-9.5 w-9.5 flex items-center justify-center rounded-button border border-border bg-white text-text-secondary hover:bg-background hover:text-text-primary transition dark:bg-gray-850 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 cursor-pointer outline-none"
              title="Export Data"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        {primaryActionText && onPrimaryAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled}
            leftIcon={PrimaryActionIcon}
            className="h-9.5 font-bold uppercase tracking-wider text-[11px]"
          >
            {primaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActionBar;
