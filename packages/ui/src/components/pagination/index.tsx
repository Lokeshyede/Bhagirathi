import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../design-system/utils";
import { Select } from "../inputs";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 select-none text-xs text-text-secondary dark:text-gray-400",
        className
      )}
    >
      {/* Left: Records status + Rows per page selector */}
      <div className="flex flex-wrap items-center gap-4">
        <span>
          Showing <span className="font-bold text-text-primary dark:text-white">{startIdx}-{endIdx}</span> of{" "}
          <span className="font-bold text-text-primary dark:text-white">{totalItems}</span> records
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Rows:</span>
            <Select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              options={itemsPerPageOptions.map((opt) => ({ value: opt, label: String(opt) }))}
              className="h-8 py-0.5 text-xs w-16"
            />
          </div>
        )}
      </div>

      {/* Right: Page trigger buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-button border border-border bg-white text-text-secondary hover:bg-background disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-850"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="font-semibold text-text-primary dark:text-gray-250 select-none">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-button border border-border bg-white text-text-secondary hover:bg-background disabled:opacity-50 disabled:pointer-events-none transition cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-850"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
