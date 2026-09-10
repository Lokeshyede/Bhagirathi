import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  DoorOpen,
  Bed,
  Banknote,
  CheckSquare,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      name: "Add Tenant",
      desc: "Check-in resident",
      icon: <UserPlus className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40",
      path: "/tenants",
    },
    {
      name: "Add Room",
      desc: "New room entry",
      icon: <DoorOpen className="h-4.5 w-4.5 text-yellow-600 dark:text-yellow-400" />,
      iconBg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/40",
      path: "/rooms?action=add-room",
    },
    {
      name: "Add Bed",
      desc: "Configure space",
      icon: <Bed className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40",
      path: "/rooms?action=add-bed",
    },
    {
      name: "Collect Rent",
      desc: "Record payment",
      icon: <Banknote className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />,
      iconBg: "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/40",
      path: "/rent/cash-collection",
    },
    {
      name: "Verify Payment",
      desc: "Confirm receipts",
      icon: <CheckSquare className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />,
      iconBg: "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/40",
      path: "/payments",
    },
    {
      name: "Register Complaint",
      desc: "Log service issue",
      icon: <ShieldAlert className="h-4.5 w-4.5 text-pink-600 dark:text-pink-400" />,
      iconBg: "bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/40",
      path: "/complaints",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm p-5 space-y-4 select-none flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-150/70 dark:border-gray-800">
        <div>
          <h3 className="font-black text-sm text-primaryText dark:text-white uppercase tracking-wider">
            Quick Actions
          </h3>
          <p className="text-[11px] text-muted dark:text-gray-400 mt-0.5">
            Frequent management workflows
          </p>
        </div>

        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      {/* Grid of Actions */}
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        {actions.map((act) => (
          <div
            key={act.name}
            onClick={() => navigate(act.path)}
            className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-950/40 hover:bg-white dark:hover:bg-gray-900 border border-border dark:border-gray-800 hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center border ${act.iconBg} transition-transform group-hover:scale-105`}
              >
                {act.icon}
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>

            <div>
              <span className="font-extrabold text-xs text-primaryText dark:text-white group-hover:text-primary transition-colors block truncate">
                {act.name}
              </span>
              <span className="text-[10px] text-secondaryText dark:text-gray-400 truncate block mt-0.5">
                {act.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Link */}
      <div className="pt-2 border-t border-gray-150/70 dark:border-gray-800">
        <button
          onClick={() => navigate("/rooms")}
          className="w-full text-center text-xs font-black text-primary hover:underline inline-flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Explore All Properties &rarr;</span>
        </button>
      </div>
    </motion.div>
  );
};

export default QuickActionsCard;
