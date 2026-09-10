import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ArrowUpRight,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@bhagirathi/utils";
import { useDashboardRentCollection } from "../hooks/api/useDashboard";
import { RentCollectionTenantItem } from "../types";


interface TodayRentCollectionSectionProps {
  hostelId?: string;
  buildingId?: string;
}

export const TodayRentCollectionSection: React.FC<TodayRentCollectionSectionProps> = ({
  hostelId,
  buildingId,
}) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"due_today" | "overdue" | "upcoming">("due_today");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [upcomingSubFilter, setUpcomingSubFilter] = useState<"ALL" | "TOMORROW" | "NEXT_5_DAYS">("ALL");

  const { data, isLoading, isError, refetch, isFetching } = useDashboardRentCollection({
    hostelId,
    buildingId,
    search: searchQuery,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
  });

  const dueToday = data?.due_today || [];
  const overdue = data?.overdue || [];
  const upcoming = data?.upcoming || [];

  const dueTodayCount = data?.due_today_count ?? 0;
  const expectedAmount = data?.expected_amount ?? 0;
  const collectedAmount = data?.collected_amount ?? 0;
  const pendingAmount = data?.pending_amount ?? 0;
  const overdueCount = data?.overdue_count ?? 0;
  const upcomingCount = data?.upcoming_count ?? 0;

  const collectionRate =
    expectedAmount > 0 ? Math.min(100, Math.round((collectedAmount / expectedAmount) * 100)) : 0;

  // Filter upcoming list if sub-filter selected
  const filteredUpcoming = upcoming.filter((item) => {
    if (upcomingSubFilter === "TOMORROW") return item.days_until_due === 1;
    return true;
  });

  // Action handler
  const handleAction = (item: RentCollectionTenantItem) => {
    if (item.has_pending_payment && item.pending_payment_id) {
      navigate("/payments/submitted");
    } else {
      navigate("/rent/cash-collection");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":

        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            PAID
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            PARTIALLY PAID
          </span>
        );
      case "DUE_TODAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <Calendar className="w-3 h-3" />
            DUE TODAY
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-3 h-3" />
            OVERDUE
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Clock className="w-3 h-3" />
            UPCOMING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <div className="p-5 border-b border-border dark:border-gray-800 bg-gradient-to-r from-gray-50/70 via-white to-amber-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-sm">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-primaryText dark:text-white tracking-tight">
                  Today's Rent Collection
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Live IST
                </span>
              </div>
              <p className="text-xs text-muted dark:text-gray-400 mt-0.5">
                Real-time collection status, payments due today & overdue tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-border dark:border-gray-700 text-secondaryText dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-50"
              title="Refresh rent collection numbers"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-amber-600" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate("/rent/cash-collection")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition cursor-pointer"
            >
              <span>Collect Cash</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── 5 Metric Summary Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          {/* Card 1: Due Today Count */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider block truncate">
              Due Today
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-blue-900 dark:text-blue-200 tabular-nums">
                {dueTodayCount}
              </span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Tenants</span>
            </div>
            <span className="text-[10px] text-blue-700/70 dark:text-blue-400/80 font-semibold block mt-0.5 truncate">
              Target for today
            </span>
          </div>

          {/* Card 2: Expected Amount */}
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-950/40 border border-border dark:border-gray-800">
            <span className="text-[10px] font-black text-muted dark:text-gray-400 uppercase tracking-wider block truncate">
              Expected Today
            </span>
            <span className="text-xl font-black text-primaryText dark:text-white tabular-nums block mt-1 truncate">
              {formatCurrency(expectedAmount).split(".00")[0]}
            </span>
            <span className="text-[10px] text-secondaryText dark:text-gray-400 font-semibold block mt-0.5 truncate">
              Total obligation today
            </span>
          </div>

          {/* Card 3: Collected Amount */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Collected
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-300 tabular-nums block mt-1 truncate">
              {formatCurrency(collectedAmount).split(".00")[0]}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 bg-emerald-100 dark:bg-emerald-950/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                {collectionRate}%
              </span>
            </div>
          </div>

          {/* Card 4: Pending Amount */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block truncate">
              Pending Today
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-300 tabular-nums block mt-1 truncate">
              {formatCurrency(pendingAmount).split(".00")[0]}
            </span>
            <span className="text-[10px] text-amber-700/70 dark:text-amber-400/80 font-semibold block mt-0.5 truncate">
              {pendingAmount > 0 ? "Awaiting settlement" : "Fully settled"}
            </span>
          </div>

          {/* Card 5: Overdue Count */}
          <div className="col-span-2 md:col-span-1 p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
            <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider block truncate">
              Overdue
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-red-600 dark:text-red-400 tabular-nums">
                {overdueCount}
              </span>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400">Tenants</span>
            </div>
            <span className="text-[10px] text-red-700/70 dark:text-red-400/80 font-semibold block mt-0.5 truncate">
              Requires immediate action
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs & Filter Controls ───────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-border dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setActiveTab("due_today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "due_today"
                ? "bg-white dark:bg-gray-900 text-primaryText dark:text-white shadow-sm"
                : "text-muted dark:text-gray-400 hover:text-primaryText"
            }`}
          >
            <span>Due Today</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                activeTab === "due_today"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-gray-300/60 dark:bg-gray-700 text-secondaryText"
              }`}
            >
              {dueTodayCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "overdue"
                ? "bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-muted dark:text-gray-400 hover:text-red-600"
            }`}
          >
            <span>Overdue Rent</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                overdueCount > 0
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "bg-gray-300/60 dark:bg-gray-700 text-secondaryText"
              }`}
            >
              {overdueCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === "upcoming"
                ? "bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-muted dark:text-gray-400 hover:text-purple-600"
            }`}
          >
            <span>Upcoming (Next 5 Days)</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                upcomingCount > 0
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  : "bg-gray-300/60 dark:bg-gray-700 text-secondaryText"
              }`}
            >
              {upcomingCount}
            </span>
          </button>
        </div>

        {/* Filter / Search Inputs */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenant, room, building..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-border dark:border-gray-700 rounded-lg text-primaryText dark:text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 border border-border dark:border-gray-700 rounded-lg text-primaryText dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="DUE_TODAY">Due Today</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Sub-filters for Upcoming Tab ──────────────────────────────── */}
      {activeTab === "upcoming" && (
        <div className="px-5 py-2 bg-purple-50/30 dark:bg-purple-950/10 border-b border-border dark:border-gray-800 flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted dark:text-gray-400">Quick Filter:</span>
          <button
            onClick={() => setUpcomingSubFilter("ALL")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition ${
              upcomingSubFilter === "ALL"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-gray-900 border border-border dark:border-gray-700 text-muted hover:text-primaryText"
            }`}
          >
            All Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setUpcomingSubFilter("TOMORROW")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition ${
              upcomingSubFilter === "TOMORROW"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-gray-900 border border-border dark:border-gray-700 text-muted hover:text-primaryText"
            }`}
          >
            Due Tomorrow ({upcoming.filter((i) => i.days_until_due === 1).length})
          </button>
        </div>
      )}

      {/* ── Table Content Area ────────────────────────────────────────── */}
      <div className="overflow-x-auto min-h-[220px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <RefreshCw className="h-6 w-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs font-bold text-muted">Calculating rent collection metrics...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-bold text-primaryText dark:text-white">Failed to load rent collection data</p>
            <p className="text-xs text-muted mt-1">Please verify database connectivity and retry.</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : activeTab === "due_today" ? (
          /* TAB 1: DUE TODAY */
          dueToday.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center select-none">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-3 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-black text-primaryText dark:text-white">
                🎉 No rent collection due today
              </h3>
              <p className="text-xs text-muted dark:text-gray-400 mt-1 max-w-sm">
                All tenants are up to date. No outstanding collections scheduled for today.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-950 text-muted uppercase text-[10px] font-black tracking-wider border-b border-border dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Room & Building</th>
                  <th className="py-3 px-4">Rent Amount</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-800 font-medium">
                {dueToday.map((item) => (
                  <tr
                    key={item.rent_id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Tenant Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {item.tenant_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-primaryText dark:text-white truncate">
                            {item.tenant_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-muted">ID: {item.tenant_display_id}</span>
                            {item.tenant_mobile && (
                              <span className="text-[10px] text-muted truncate">· {item.tenant_mobile}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Room & Building */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-primaryText dark:text-white">
                        Room {item.room_number || "—"}
                        {item.bed_number ? ` (Bed ${item.bed_number})` : ""}
                      </p>
                      <p className="text-[10px] text-muted truncate">
                        {item.building_name || "Main Building"} {item.floor_name ? `· ${item.floor_name}` : ""}
                      </p>
                    </td>

                    {/* Rent Amount */}
                    <td className="py-3 px-4 tabular-nums font-bold text-primaryText dark:text-white">
                      {formatCurrency(item.rent_amount).split(".00")[0]}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-3 px-4 tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.paid_amount).split(".00")[0]}
                    </td>

                    {/* Remaining Amount */}
                    <td className="py-3 px-4 tabular-nums">
                      <span
                        className={`font-black ${
                          item.remaining_amount > 0
                            ? "text-amber-600 dark:text-amber-400 text-sm"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatCurrency(item.remaining_amount).split(".00")[0]}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 text-muted tabular-nums">
                      {new Date(item.due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(item.status)}
                        {item.has_pending_payment && (

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                            Verify Pending (₹{item.pending_payment_amount})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {item.has_pending_payment ? (
                        <button
                          onClick={() => handleAction(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-primaryText dark:text-white transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-muted" />
                          <span>View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : activeTab === "overdue" ? (
          /* TAB 2: OVERDUE */
          overdue.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center select-none">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full mb-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-black text-primaryText dark:text-white">
                No overdue tenants!
              </h3>
              <p className="text-xs text-muted dark:text-gray-400 mt-1 max-w-sm">
                Zero tenants currently exceed their rent payment deadline.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-400 uppercase text-[10px] font-black tracking-wider border-b border-red-100 dark:border-red-900/40">
                <tr>
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Room</th>
                  <th className="py-3 px-4">Original Rent</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Days Overdue</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-800 font-medium">
                {overdue.map((item) => (
                  <tr
                    key={item.rent_id}
                    className="hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {item.tenant_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-primaryText dark:text-white">{item.tenant_name}</p>
                          <p className="text-[10px] font-bold text-muted">ID: {item.tenant_display_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-primaryText dark:text-white">
                      Room {item.room_number || "—"}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-muted">
                      {formatCurrency(item.rent_amount).split(".00")[0]}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatCurrency(item.paid_amount).split(".00")[0]}
                    </td>

                    <td className="py-3 px-4 tabular-nums font-black text-red-600 dark:text-red-400 text-sm">
                      {formatCurrency(item.remaining_amount).split(".00")[0]}
                    </td>

                    <td className="py-3 px-4 text-muted tabular-nums">
                      {new Date(item.due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                        <AlertTriangle className="w-3 h-3" />
                        {item.days_overdue} days overdue
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAction(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-sm transition cursor-pointer"
                      >
                        <span>Collect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          /* TAB 3: UPCOMING */
          filteredUpcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center select-none">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-full mb-3 text-purple-600 dark:text-purple-400">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-black text-primaryText dark:text-white">
                No upcoming rent in next 5 days
              </h3>
              <p className="text-xs text-muted dark:text-gray-400 mt-1 max-w-sm">
                There are no rent obligations due within the upcoming 5-day reminder window.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-50/40 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 uppercase text-[10px] font-black tracking-wider border-b border-purple-100 dark:border-purple-900/40">
                <tr>
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Room & Building</th>
                  <th className="py-3 px-4">Rent Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-gray-800 font-medium">
                {filteredUpcoming.map((item) => (
                  <tr
                    key={item.rent_id}
                    className="hover:bg-purple-50/20 dark:hover:bg-purple-950/10 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {item.tenant_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-primaryText dark:text-white">{item.tenant_name}</p>
                          <p className="text-[10px] font-bold text-muted">ID: {item.tenant_display_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-primaryText dark:text-white">
                      Room {item.room_number || "—"}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-muted">
                      {formatCurrency(item.rent_amount).split(".00")[0]}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatCurrency(item.paid_amount).split(".00")[0]}
                    </td>

                    <td className="py-3 px-4 tabular-nums font-black text-purple-700 dark:text-purple-300 text-sm">
                      {formatCurrency(item.remaining_amount).split(".00")[0]}
                    </td>

                    <td className="py-3 px-4 text-muted tabular-nums">
                      {new Date(item.due_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          item.days_until_due === 1
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {item.days_until_due === 1 ? "Due Tomorrow" : `Due in ${item.days_until_due} days`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleAction(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-primaryText dark:text-white transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-muted" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </motion.div>
  );
};

export default TodayRentCollectionSection;
