import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Clock,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import React, { useState } from "react";
import {
  useRoomPaymentSummary,
  usePaymentsFoundationHistory
} from "../hooks/usePaymentFoundation";
import { Button } from "@bhagirathi/ui";

export const PaymentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"rooms" | "pending">("rooms");

  // Queries
  const { data: roomSummary, isLoading: isRoomsLoading, isError: isRoomsError, refetch: refetchRooms } = useRoomPaymentSummary();
  const { data: history, isLoading: isHistoryLoading, isError: isHistoryError, refetch: refetchHistory } = usePaymentsFoundationHistory();

  const handleRetryAll = () => {
    refetchRooms();
    refetchHistory();
  };

  const pendingPayments = history?.filter(p => p.status === "Pending" || p.payment_status === "PENDING") || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-lg font-black text-primaryText dark:text-white leading-tight uppercase tracking-wider">Payment Overview</h1>
          <p className="text-xs text-muted mt-1 leading-normal font-medium">
            View room rent splits, utility shares, and pending payment obligations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/payments/cash-verification")}
            className="h-9.5 px-3 sm:px-4 flex items-center gap-1.5 font-bold cursor-pointer border border-emerald-500/20 bg-emerald-55/10 text-emerald-600 dark:text-emerald-400 text-xs"
          >
            <Coins className="h-4 w-4" />
            <span>Verify Cash Payments</span>
          </Button>
          <Button variant="outline" onClick={handleRetryAll} className="h-9.5 px-3 sm:px-4 flex items-center gap-1.5 font-bold cursor-pointer text-xs">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Primary Tab Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card select-none overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === "rooms"
              ? "bg-primary text-white shadow-sm"
              : "text-secondaryText dark:text-gray-400 hover:text-primaryText"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Room splits</span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            activeTab === "pending"
              ? "bg-primary text-white shadow-sm"
              : "text-secondaryText dark:text-gray-400 hover:text-primaryText"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Pending Dues ({pendingPayments.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <AnimatePresence>
        {activeTab === "rooms" && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-4"
          >
            {isRoomsLoading ? (
              <div className="h-44 rounded-card bg-white dark:bg-gray-900 border border-border animate-pulse" />
            ) : isRoomsError || !roomSummary ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 border border-border rounded-card text-center select-none">
                <AlertTriangle className="h-10 w-10 text-danger mb-3" />
                <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">Failed to Load Splits</h4>
                <p className="text-xs text-muted max-w-xs mb-4">Could not retrieve room-wise payment calculations.</p>
                <Button onClick={() => refetchRooms()} size="sm">Retry Connection</Button>
              </div>
            ) : roomSummary.length === 0 ? (
              <div className="text-center p-8 bg-white dark:bg-gray-900 border border-border rounded-card select-none text-xs text-muted">
                No active room definitions found in this PG campus.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomSummary.map((r: any) => (
                  <div
                    key={r.room_number}
                    className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-card space-y-4"
                  >
                    <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-850 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-primaryText dark:text-white uppercase">Room {r.room_number}</h4>
                        <span className="text-[9px] text-muted font-bold block uppercase mt-0.5">{r.hostel_name}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider py-0.5 px-2 bg-gray-55 text-muted dark:bg-gray-800 rounded border border-border">
                        {r.active_occupants} Occupants
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">Monthly Room Rent</span>
                        <span className="font-bold text-primaryText dark:text-white mt-1 block">₹{r.room_rent.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">Rent Split Share</span>
                        <span className="font-bold text-primary mt-1 block">₹{r.rent_share.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">Electricity Bill</span>
                        <span className="font-bold text-primaryText dark:text-white mt-1 block">₹{r.electricity_bill.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold block">Utility Share</span>
                        <span className="font-bold text-primary mt-1 block">₹{r.electricity_share.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-850 pt-3.5 flex justify-between items-baseline text-xs">
                      <span className="text-muted font-bold">Total Tenant Payable:</span>
                      <span className="text-sm font-black text-primaryText dark:text-white">₹{r.total_payable.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "pending" && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-4"
          >
            {isHistoryLoading ? (
              <div className="h-44 rounded-card bg-white dark:bg-gray-900 border border-border animate-pulse" />
            ) : isHistoryError ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 border border-border rounded-card text-center select-none">
                <AlertTriangle className="h-10 w-10 text-danger mb-3" />
                <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">Failed to Load History</h4>
                <p className="text-xs text-muted max-w-xs mb-4">Could not retrieve payment records.</p>
                <Button onClick={() => refetchHistory()} size="sm">Retry Connection</Button>
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="text-center p-8 bg-white dark:bg-gray-900 border border-border rounded-card select-none text-xs text-muted">
                No generated pending dues currently in this billing cycle.
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-950 text-muted uppercase font-bold select-none border-b border-border">
                      <tr>
                        <th className="px-5 py-3">Reference</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Rent Share</th>
                        <th className="px-5 py-3">Elec Share</th>
                        <th className="px-5 py-3">Total Payable</th>
                        <th className="px-5 py-3">Due Date</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                      {pendingPayments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-55/40 dark:hover:bg-gray-955/10">
                          <td className="px-5 py-4 font-black text-primaryText dark:text-gray-200 select-all">{p.payment_reference || "Pending"}</td>
                          <td className="px-5 py-4 font-bold uppercase text-primary">{p.payment_type}</td>
                          <td className="px-5 py-4 tabular-nums">₹{Number(p.rent_share).toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 tabular-nums">₹{Number(p.electricity_share).toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 tabular-nums font-black">₹{Number(p.total_amount).toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 select-none">
                            {p.due_date ? new Date(p.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                          </td>
                          <td className="px-5 py-4 text-right select-none">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-250">
                              <Clock className="h-3 w-3 animate-pulse" />
                              {p.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaymentManagementPage;
