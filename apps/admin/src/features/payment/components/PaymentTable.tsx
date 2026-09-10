import React from "react";
import { Eye, CreditCard } from "lucide-react";
import { Payment } from "@bhagirathi/types";
import { PaymentStatus } from "@bhagirathi/constants";
import { Button } from "@bhagirathi/ui";
import { motion } from "framer-motion";

interface PaymentTableProps {
  payments: Payment[];
  onSelect: (id: string) => void;
}

export const statusBadgeMap: Record<string, { label: string; className: string; dot: string }> = {
  [PaymentStatus.PENDING]: {
    label: "Pending Verification",
    className: "text-amber-700 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-955/30",
    dot: "bg-warning"
  },
  [PaymentStatus.UNDER_REVIEW]: {
    label: "Under Review",
    className: "text-blue-755 bg-blue-50 dark:bg-blue-955/20 border border-blue-200 dark:border-blue-955/30",
    dot: "bg-info"
  },
  [PaymentStatus.VERIFIED]: {
    label: "Verified Clear",
    className: "text-green-700 bg-green-50 dark:bg-green-955/20 border border-green-200 dark:border-green-955/30",
    dot: "bg-success"
  },
  [PaymentStatus.REJECTED]: {
    label: "Rejected Submission",
    className: "text-red-750 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-955/30",
    dot: "bg-danger"
  },
  [PaymentStatus.CANCELLED]: {
    label: "Cancelled Void",
    className: "text-secondaryText bg-gray-50 dark:bg-gray-800 border border-border dark:border-gray-800",
    dot: "bg-muted"
  }
};

export const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onSelect }) => {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card text-center h-[350px] select-none">
        <CreditCard className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3 animate-pulse" />
        <h3 className="text-sm font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">No Transaction Submissions</h3>
        <p className="text-xs text-muted dark:text-gray-500 max-w-sm leading-relaxed">
          No payments fit your criteria. Adjust the filters console to retrieve broader histories.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="pg-table">
          <thead>
            <tr className="select-none">
              <th className="pl-5">Tenant Info</th>
              <th>Rent Cycle</th>
              <th>Transacted Value</th>
              <th>Payment Date</th>
              <th>Transfer Method / UTR</th>
              <th>Clearance State</th>
              <th className="text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const badge = statusBadgeMap[p.status] || { label: p.status, className: "bg-gray-100 text-gray-800", dot: "bg-muted" };
              const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              const rentPeriod = p.rent_month ? `${monthNames[p.rent_month - 1]} ${p.rent_year}` : "-";

              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors"
                >
                  {/* Tenant */}
                  <td className="pl-5">
                    <div className="font-bold text-primaryText dark:text-white truncate max-w-[140px]">{p.tenant_name || "Unknown Tenant"}</div>
                    <span className="text-[9px] font-bold text-muted dark:text-gray-500 uppercase block tracking-wider mt-0.5 truncate max-w-[140px]">
                      {p.hostel_name || "Bhagirathi Hostel"}
                    </span>
                  </td>

                  {/* Period */}
                  <td>
                    <span className="font-semibold text-secondaryText dark:text-gray-300 select-none">{rentPeriod}</span>
                  </td>

                  {/* Amount */}
                  <td>
                    <span className="font-black text-primaryText dark:text-white tabular-nums">
                      ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </span>
                  </td>

                  {/* Date */}
                  <td>
                    <span className="font-semibold text-secondaryText dark:text-gray-350 tabular-nums">
                      {new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </td>

                  {/* Mode / UTR */}
                  <td>
                    <span className="font-bold text-muted dark:text-gray-550 text-[10px] uppercase block tracking-wider mb-0.5 select-none">{p.payment_mode}</span>
                    <code className="text-[10px] font-mono font-bold text-primary dark:text-red-400 select-all tracking-tight bg-gray-50 dark:bg-gray-950 px-1.5 py-0.5 rounded border border-border dark:border-gray-800">{p.utr_number}</code>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider select-none ${badge.className}`}>
                      <span className={`pg-badge-dot ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </td>

                  {/* Action Review */}
                  <td className="text-right pr-5">
                    <Button
                      variant="secondary"
                      onClick={() => onSelect(p.id)}
                      className="inline-flex items-center gap-1 h-8 text-[10px] px-2.5 font-bold cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-muted" />
                      <span>Review Details</span>
                    </Button>
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

export default PaymentTable;
