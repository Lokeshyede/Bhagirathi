import React from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Database } from "lucide-react";
import { cn } from "../../design-system/utils";

// 1. TABLE CONTAINER
export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "w-full overflow-hidden border border-border bg-white rounded-card shadow-sm dark:bg-gray-900 dark:border-gray-800",
        className
      )}
      {...props}
    >
      <div className="overflow-x-auto w-full">{children}</div>
    </div>
  );
};

// 2. TABLE ELEMENT
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  stickyHeader?: boolean;
}

export const Table: React.FC<TableProps> = ({
  children,
  className,
  stickyHeader = false,
  ...props
}) => {
  return (
    <table
      className={cn(
        "w-full text-left border-collapse text-sm relative",
        stickyHeader && "table-layout-fixed",
        className
      )}
      {...props}
    >
      {children}
    </table>
  );
};

// 3. TABLE HEAD
export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <thead
      className={cn(
        "bg-background border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider select-none dark:bg-gray-850 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

// 4. TABLE BODY
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tbody
      className={cn(
        "divide-y divide-border bg-white text-text-primary dark:bg-gray-900 dark:divide-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
};

// 5. TABLE ROW
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tr
      className={cn(
        "hover:bg-background/40 dark:hover:bg-gray-800/10 transition-colors duration-150",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

// 6. TABLE CELL
export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <td className={cn("px-5 py-4 font-medium align-middle whitespace-nowrap", className)} {...props}>
      {children}
    </td>
  );
};

// 7. HEADER CELL (WITH SORTING)
export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
  sticky?: boolean;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className,
  sortable = false,
  sortDirection = null,
  onSort,
  sticky = false,
  ...props
}) => {
  return (
    <th
      className={cn(
        "px-5 py-4 font-bold text-xs text-text-secondary select-none whitespace-nowrap align-middle",
        sticky && "sticky top-0 bg-background dark:bg-gray-850 z-10",
        sortable && "cursor-pointer hover:text-text-primary transition-colors duration-150",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        {sortable && (
          <span className="shrink-0 text-text-muted">
            {sortDirection === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
            )}
          </span>
        )}
      </div>
    </th>
  );
};

// 8. TABLE TOOLBAR
export interface TableToolbarProps {
  title?: string;
  count?: number;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterButton?: React.ReactNode;
  actionsButton?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  count,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterButton,
  actionsButton,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border border-border bg-white rounded-card shadow-sm mb-5 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-2.5 select-none">
        {title && (
          <h4 className="text-sm font-extrabold text-text-primary uppercase tracking-wider dark:text-white">
            {title}
          </h4>
        )}
        {count !== undefined && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xxs font-extrabold text-text-secondary bg-background rounded-badge dark:bg-gray-800">
            {count}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 md:flex-none min-w-[200px] max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9.5 pr-4 h-9.5 w-full rounded-input border border-border bg-white text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        )}
        {filterButton}
        {actionsButton}
      </div>
    </div>
  );
};

// 9. TABLE PAGINATION
export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-white rounded-b-card select-none dark:bg-gray-900 dark:border-gray-800">
      <p className="text-xs text-text-secondary font-medium">
        Showing <span className="font-bold text-text-primary dark:text-gray-300">{totalItems === 0 ? 0 : startIdx}</span> to{" "}
        <span className="font-bold text-text-primary dark:text-gray-300">{endIdx}</span> of{" "}
        <span className="font-bold text-text-primary dark:text-gray-300">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-button border border-border text-text-secondary hover:bg-background hover:text-text-primary transition disabled:opacity-40 disabled:pointer-events-none dark:border-gray-850 dark:hover:bg-gray-800 cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>

        <span className="text-xs font-bold text-text-primary dark:text-white px-2">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-button border border-border text-text-secondary hover:bg-background hover:text-text-primary transition disabled:opacity-40 disabled:pointer-events-none dark:border-gray-855 dark:hover:bg-gray-800 cursor-pointer"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

// 10. TABLE ACTION MENU IS IMPORTED AND EXPORTED VIA @bhagirathi/ui/src/components/dropdowns/index.tsx


// 11. TABLE LOADING SKELETON IS IMPORTED AND EXPORTED VIA @bhagirathi/ui/src/components/loading/index.tsx


// 12. TABLE EMPTY STATE
export interface TableEmptyStateProps {
  title?: string;
  description?: string;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  title = "No records found",
  description = "Get started by adding a new record to the list.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none">
      <div className="p-4 bg-background dark:bg-gray-800 rounded-full text-text-muted mb-4 shrink-0">
        <Database className="h-10 w-10" />
      </div>
      <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default Table;
