import React from "react";
import { Rent, Tenant } from "@bhagirathi/types";
import { Edit2, Trash2, Calendar, Eye, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@bhagirathi/utils";
import { TableActionMenu } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface RentTableProps {
  rents: Rent[];
  tenants: Tenant[];
  onEdit: (rent: Rent) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const statusConfig: Record<Rent["status"], { label: string; className: string; dot: string }> = {
  PAID: {
    label: "Fully Paid",
    className: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    dot: "bg-success",
  },
  PARTIALLY_PAID: {
    label: "Part Paid",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-200 dark:border-amber-955/30",
    dot: "bg-warning",
  },
  PENDING: {
    label: "Unpaid Invoice",
    className: "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-955/30",
    dot: "bg-info",
  },
  OVERDUE: {
    label: "Overdue Balance",
    className: "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    dot: "bg-danger",
  },
  CANCELLED: {
    label: "Void/Cancelled",
    className: "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    dot: "bg-muted",
  },
};

export const RentTable: React.FC<RentTableProps> = ({
  rents,
  tenants,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const getTenantName = (tenantId: string) => {
    const t = tenants.find((x) => x.id === tenantId);
    return t ? t.full_name : "Unknown Tenant";
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthNum - 1] || "N/A";
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="pg-table">
          <thead>
            <tr className="select-none">
              <th className="pl-5">Tenant Name</th>
              <th>Billing Period</th>
              <th>Base Agreement</th>
              <th>Invoice Value</th>
              <th>Payments Cleared</th>
              <th>Balance Due</th>
              <th>Settlement State</th>
              <th className="text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rents.map((r, i) => {
              const balance = Number(r.total_amount) - Number(r.paid_amount);
              const status = statusConfig[r.status] || statusConfig.PENDING;

              const actions = [
                {
                  label: "Invoice Ledger Details",
                  icon: Eye,
                  onClick: () => onSelect(r.id),
                },
                {
                  label: "Edit Ledger Item",
                  icon: Edit2,
                  onClick: () => onEdit(r),
                },
                {
                  label: "Delete Ledger Record",
                  icon: Trash2,
                  onClick: () => onDelete(r.id),
                  variant: "danger" as const,
                },
              ];

              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
                >
                  {/* Tenant */}
                  <td className="pl-5 font-bold text-primaryText dark:text-white">
                    <button
                      onClick={() => onSelect(r.id)}
                      className="hover:underline hover:text-primary dark:hover:text-red-400 cursor-pointer text-left"
                    >
                      {getTenantName(r.tenant_id)}
                    </button>
                  </td>

                  {/* Period */}
                  <td>
                    <div className="flex items-center gap-1.5 text-secondaryText dark:text-gray-300 font-semibold select-none">
                      <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
                      <span className="tabular-nums">{getMonthName(r.rent_month)} {r.rent_year}</span>
                    </div>
                  </td>

                  {/* Base monthly rent */}
                  <td>
                    <span className="font-semibold text-secondaryText dark:text-gray-300 tabular-nums">
                      {formatCurrency(Number(r.monthly_rent)).split(".00")[0]}
                    </span>
                  </td>

                  {/* Total amount */}
                  <td>
                    <span className="font-bold text-primaryText dark:text-white tabular-nums">
                      {formatCurrency(Number(r.total_amount)).split(".00")[0]}
                    </span>
                  </td>

                  {/* Paid amount */}
                  <td>
                    <span className="font-bold text-success dark:text-green-400 tabular-nums">
                      {formatCurrency(Number(r.paid_amount)).split(".00")[0]}
                    </span>
                  </td>

                  {/* Balance due */}
                  <td>
                    <span className={`font-black tabular-nums ${balance > 0 ? "text-danger" : "text-secondaryText dark:text-gray-500"}`}>
                      {formatCurrency(balance).split(".00")[0]}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`pg-badge text-[10px] py-0.5 px-2 font-bold select-none ${status.className}`}>
                      <span className={`pg-badge-dot ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>

                  {/* Actions dropdown */}
                  <td className="text-right pr-5">
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => onSelect(r.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-secondaryText hover:text-primary dark:text-gray-400 dark:hover:text-red-450 transition cursor-pointer"
                        title="Timeline Detail"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                      <TableActionMenu actions={actions} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentTable;
