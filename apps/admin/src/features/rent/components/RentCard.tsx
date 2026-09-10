import React from "react";
import { Rent, Tenant } from "@bhagirathi/types";
import { Calendar, User, ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@bhagirathi/utils";
import { motion } from "framer-motion";

interface RentCardProps {
  rent: Rent;
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

export const RentCard: React.FC<RentCardProps> = ({
  rent,
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
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNum - 1] || "N/A";
  };

  const balance = Number(rent.total_amount) - Number(rent.paid_amount);
  const status = statusConfig[rent.status] || statusConfig.PENDING;

  return (
    <motion.div
      whileHover={{ y: -2, shadow: "0 10px 20px -5px rgba(0,0,0,0.05)" }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-805 rounded-card p-5 shadow-card hover:shadow-card-hover transition flex flex-col justify-between h-64"
    >
      <div>
        <div className="flex items-center justify-between mb-4 select-none">
          <span className="text-[10px] font-bold text-muted dark:text-gray-500 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {getMonthName(rent.rent_month)} {rent.rent_year}
          </span>
          <span className={`pg-badge text-[9px] font-bold py-0.5 px-2 ${status.className}`}>
            <span className={`pg-badge-dot ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-4 select-none">
          <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-850 border border-border dark:border-gray-800 flex items-center justify-center overflow-hidden shrink-0">
            <User className="h-4.5 w-4.5 text-muted" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={() => onSelect(rent.id)}
              className="font-bold text-sm text-primaryText hover:text-primary dark:text-white dark:hover:text-red-400 truncate block text-left w-full cursor-pointer hover:underline"
            >
              {getTenantName(rent.tenant_id)}
            </button>
            <span className="text-[10px] font-bold text-muted dark:text-gray-500 uppercase tracking-wider block mt-0.5">Rent Invoice</span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-secondaryText dark:text-gray-400 mb-4 border-t border-b border-gray-150/45 dark:border-gray-850/45 py-3 select-none">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted dark:text-gray-550 uppercase text-[9px] tracking-wide">Bill Total</span>
            <span className="font-bold text-primaryText dark:text-white tabular-nums">{formatCurrency(Number(rent.total_amount)).split(".00")[0]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted dark:text-gray-555 uppercase text-[9px] tracking-wide">Paid Amount</span>
            <span className="font-bold text-success dark:text-green-450 tabular-nums">{formatCurrency(Number(rent.paid_amount)).split(".00")[0]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-muted dark:text-gray-555 uppercase text-[9px] tracking-wide">Balance Due</span>
            <span className={`font-black tabular-nums ${balance > 0 ? "text-danger" : "text-gray-450 dark:text-gray-550"}`}>
              {formatCurrency(balance).split(".00")[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3.5 border-t border-gray-150/40 dark:border-gray-850/40 select-none">
        <button
          onClick={() => onSelect(rent.id)}
          className="text-[11px] font-bold text-primary hover:text-red-700 cursor-pointer flex items-center gap-1 transition-colors"
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Ledger Details</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(rent)}
            className="p-1 rounded text-secondaryText hover:text-primaryText dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-805 transition cursor-pointer"
            title="Edit Invoice"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(rent.id)}
            className="p-1 rounded text-muted hover:text-danger hover:bg-red-50/10 transition cursor-pointer"
            title="Delete Invoice"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RentCard;
