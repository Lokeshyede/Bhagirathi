import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Show at most 5 page buttons
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card">
      {/* Count */}
      <p className="text-xs text-secondaryText dark:text-gray-400">
        Showing{" "}
        <span className="font-bold text-primaryText dark:text-white">{startItem}</span>
        {" "}–{" "}
        <span className="font-bold text-primaryText dark:text-white">{endItem}</span>
        {" "}of{" "}
        <span className="font-bold text-primaryText dark:text-white">{totalItems}</span>
        {" "}results
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 inline-flex items-center justify-center rounded-button border border-border dark:border-gray-700 bg-white dark:bg-gray-900 text-secondaryText hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-button text-xs font-bold border transition cursor-pointer ${
              pageNum === currentPage
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-white dark:bg-gray-900 border-border dark:border-gray-700 text-secondaryText dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 inline-flex items-center justify-center rounded-button border border-border dark:border-gray-700 bg-white dark:bg-gray-900 text-secondaryText hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
