import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  CheckSquare,
  BedDouble,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@bhagirathi/utils";
import { DashboardStatisticsData } from "../types";

interface ActionRequiredCardProps {
  stats: DashboardStatisticsData;
}

export const ActionRequiredCard: React.FC<ActionRequiredCardProps> = ({ stats }) => {
  const navigate = useNavigate();

  const pendingRent = stats.pending_rent;
  const openComplaints = stats.open_complaints;
  const pendingPayments = stats.pending_payments;
  const vacantBeds = stats.vacant_beds;

  const actions = [
    ...(pendingRent > 0
      ? [
          {
            id: "pending-rent",
            title: "Rent Payments Pending",
            desc: `${formatCurrency(pendingRent).split(".00")[0]} pending collection`,
            severity: "danger" as const,
            icon: <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />,
            badge: `${formatCurrency(pendingRent).split(".00")[0]} Due`,
            link: "/rent/cash-collection",
            buttonText: "Collect",
          },
        ]
      : []),
    ...(openComplaints > 0
      ? [
          {
            id: "open-complaints",
            title: "Complaints Unresolved",
            desc: `${openComplaints} service ${openComplaints === 1 ? "ticket" : "tickets"} awaiting action`,
            severity: "danger" as const,
            icon: <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />,
            badge: `${openComplaints} Open`,
            link: "/complaints",
            buttonText: "Resolve",
          },
        ]
      : []),
    ...(pendingPayments > 0
      ? [
          {
            id: "pending-verification",
            title: "Payments Awaiting Verification",
            desc: `${pendingPayments} payment ${pendingPayments === 1 ? "receipt" : "receipts"} to approve`,
            severity: "warning" as const,
            icon: <CheckSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
            badge: `${pendingPayments} Pending`,
            link: "/payments",
            buttonText: "Verify",
          },
        ]
      : []),
    ...(vacantBeds > 0
      ? [
          {
            id: "vacant-beds",
            title: "Beds Available for Allocation",
            desc: `${vacantBeds} ${vacantBeds === 1 ? "bed is" : "beds are"} ready for check-in`,
            severity: "info" as const,
            icon: <BedDouble className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
            badge: `${vacantBeds} Vacant`,
            link: "/rooms",
            buttonText: "Allocate",
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4 select-none flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-150/70 dark:border-gray-800">
        <div>
          <h3 className="font-black text-sm text-primaryText dark:text-white uppercase tracking-wider">
            Action Required
          </h3>
          <p className="text-[11px] text-muted dark:text-gray-400 mt-0.5">
            Tasks requiring administrative attention
          </p>
        </div>

        {actions.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {actions.length} Pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Clear
          </span>
        )}
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5 flex-1">
        {actions.length === 0 ? (
          <div className="py-8 text-center bg-gray-50/50 dark:bg-gray-950/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-xs text-primaryText dark:text-white">
              Everything is up to date
            </h4>
            <p className="text-[11px] text-muted dark:text-gray-400 max-w-xs mx-auto">
              No outstanding rent, pending verifications, or unresolved complaints require attention.
            </p>
          </div>
        ) : (
          actions.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.link)}
              className="p-3 bg-gray-50/70 dark:bg-gray-950/40 hover:bg-white dark:hover:bg-gray-900 border border-border dark:border-gray-800 hover:border-primary/40 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.severity === "danger"
                      ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40"
                      : item.severity === "warning"
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40"
                      : "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40"
                  }`}
                >
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs text-primaryText dark:text-white group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-secondaryText dark:text-gray-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-extrabold text-primary group-hover:underline flex items-center gap-0.5">
                  {item.buttonText}
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ActionRequiredCard;
