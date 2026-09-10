import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useReportFilterStore } from "../store/filters";

// ─── Select Field ─────────────────────────────────────────────────────────────
interface SelectOption { value: string; label: string }
interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ id, label, value, options, onChange, placeholder = "All" }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── Date Input ───────────────────────────────────────────────────────────────
interface FilterDateProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({ id, label, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </label>
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
    />
  </div>
);

// ─── Report Filters Panel ─────────────────────────────────────────────────────
const TENANT_STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE",      label: "Active"      },
  { value: "INACTIVE",    label: "Inactive"    },
  { value: "CHECKED_OUT", label: "Checked Out" },
];

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "PENDING",      label: "Pending"      },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "VERIFIED",     label: "Verified"     },
  { value: "REJECTED",     label: "Rejected"     },
  { value: "CANCELLED",    label: "Cancelled"    },
];

const COMPLAINT_STATUS_OPTIONS: SelectOption[] = [
  { value: "OPEN",        label: "Open"        },
  { value: "ASSIGNED",    label: "Assigned"    },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED",    label: "Resolved"    },
  { value: "CLOSED",      label: "Closed"      },
  { value: "REJECTED",    label: "Rejected"    },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: "LOW",      label: "Low"      },
  { value: "MEDIUM",   label: "Medium"   },
  { value: "HIGH",     label: "High"     },
  { value: "CRITICAL", label: "Critical" },
];

const NOTICE_STATUS_OPTIONS: SelectOption[] = [
  { value: "DRAFT",     label: "Draft"     },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
  { value: "EXPIRED",   label: "Expired"   },
  { value: "ARCHIVED",  label: "Archived"  },
];

const RENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "PENDING",        label: "Pending"        },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID",           label: "Paid"           },
  { value: "OVERDUE",        label: "Overdue"        },
  { value: "CANCELLED",      label: "Cancelled"      },
];

interface ReportFiltersProps {
  showTenantStatus?:    boolean;
  showPaymentStatus?:   boolean;
  showRentStatus?:      boolean;
  showComplaintStatus?: boolean;
  showPriority?:        boolean;
  showNoticeStatus?:    boolean;
  showDateRange?:       boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  showTenantStatus    = false,
  showPaymentStatus   = false,
  showRentStatus      = false,
  showComplaintStatus = false,
  showPriority        = false,
  showNoticeStatus    = false,
  showDateRange       = true,
}) => {
  const { filters, setFilters, resetFilters, isFilterOpen, toggleFilter } = useReportFilterStore();

  // Count active filters
  const activeCount = [
    filters.date_from,
    filters.date_to,
    filters.hostel_id,
    filters.tenant_status,
    filters.payment_status,
    filters.complaint_status,
    filters.priority,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Filter Header */}
      <button
        onClick={toggleFilter}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {isFilterOpen
          ? <ChevronUp   className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence initial={false}>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-3">
                {/* Date Range */}
                {showDateRange && (
                  <>
                    <FilterDate
                      id="filter-date-from"
                      label="Date From"
                      value={filters.date_from || ""}
                      onChange={(v) => setFilters({ date_from: v || undefined })}
                    />
                    <FilterDate
                      id="filter-date-to"
                      label="Date To"
                      value={filters.date_to || ""}
                      onChange={(v) => setFilters({ date_to: v || undefined })}
                    />
                  </>
                )}

                {/* Tenant Status */}
                {showTenantStatus && (
                  <FilterSelect
                    id="filter-tenant-status"
                    label="Tenant Status"
                    value={filters.tenant_status || ""}
                    options={TENANT_STATUS_OPTIONS}
                    onChange={(v) => setFilters({ tenant_status: v || undefined })}
                  />
                )}

                {/* Payment Status */}
                {showPaymentStatus && (
                  <FilterSelect
                    id="filter-payment-status"
                    label="Payment Status"
                    value={filters.payment_status || ""}
                    options={PAYMENT_STATUS_OPTIONS}
                    onChange={(v) => setFilters({ payment_status: v || undefined })}
                  />
                )}

                {/* Rent Status */}
                {showRentStatus && (
                  <FilterSelect
                    id="filter-rent-status"
                    label="Rent Status"
                    value={filters.payment_status || ""}
                    options={RENT_STATUS_OPTIONS}
                    onChange={(v) => setFilters({ payment_status: v || undefined })}
                  />
                )}

                {/* Complaint Status */}
                {showComplaintStatus && (
                  <FilterSelect
                    id="filter-complaint-status"
                    label="Complaint Status"
                    value={filters.complaint_status || ""}
                    options={COMPLAINT_STATUS_OPTIONS}
                    onChange={(v) => setFilters({ complaint_status: v || undefined })}
                  />
                )}

                {/* Priority */}
                {showPriority && (
                  <FilterSelect
                    id="filter-priority"
                    label="Priority"
                    value={filters.priority || ""}
                    options={PRIORITY_OPTIONS}
                    onChange={(v) => setFilters({ priority: v || undefined })}
                  />
                )}

                {/* Notice Status */}
                {showNoticeStatus && (
                  <FilterSelect
                    id="filter-notice-status"
                    label="Notice Status"
                    value={filters.tenant_status || ""}
                    options={NOTICE_STATUS_OPTIONS}
                    onChange={(v) => setFilters({ tenant_status: v || undefined })}
                  />
                )}
              </div>

              {/* Reset */}
              {activeCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
