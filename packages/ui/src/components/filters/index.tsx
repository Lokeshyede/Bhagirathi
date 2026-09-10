import React from "react";
import { cn } from "../../design-system/utils";
import { Select } from "../inputs";

// 1. DATE RANGE FILTER
export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="h-9.5 rounded-input border border-border px-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        title="Start Date"
      />
      <span className="text-[10px] font-bold text-text-secondary uppercase select-none">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="h-9.5 rounded-input border border-border px-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        title="End Date"
      />
    </div>
  );
};

// 2. REUSABLE SELECT / PICKER FILTER
export interface FilterPickerProps {
  label: string;
  value: string | number;
  onChange: (val: string | number) => void;
  options: { value: string | number; label: string }[];
  className?: string;
}

export const FilterPicker: React.FC<FilterPickerProps> = ({
  label,
  value,
  onChange,
  options,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
        {label}:
      </span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        className="h-9.5 py-1 text-xs min-w-[120px]"
      />
    </div>
  );
};

// 3. STATUS FILTER PILLS
export interface StatusFilterProps {
  options: { id: string; label: string; count?: number }[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  options,
  activeId,
  onChange,
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2 select-none border-b border-divider pb-3 dark:border-gray-800", className)}>
      {options.map((opt) => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition duration-150 cursor-pointer outline-none",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary hover:bg-border/60 hover:text-text-primary dark:bg-gray-850 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            )}
          >
            <span className="flex items-center gap-1.5">
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[8px] font-bold rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-border dark:bg-gray-800 text-text-secondary"
                  )}
                >
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
