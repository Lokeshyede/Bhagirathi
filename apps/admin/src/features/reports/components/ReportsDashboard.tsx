import React from "react";
import {
  Building2, Bed, Users, IndianRupee, CreditCard,
  MessageSquare, Megaphone, AlertTriangle, Loader2,
} from "lucide-react";
import { StatisticsCards } from "./StatisticsCards";
import { SummaryCards } from "./SummaryCards";
import { ChartsGrid } from "./Charts";
import { useReportsDashboard } from "../hooks/useReports";

// ─── Currency Formatter ───────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 100_000
    ? `₹${(n / 100_000).toFixed(1)}L`
    : n >= 1_000
    ? `₹${(n / 1_000).toFixed(1)}k`
    : `₹${n.toLocaleString()}`;

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const ReportsDashboard: React.FC = () => {
  const { data, isLoading, error } = useReportsDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed to load dashboard</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const m = data.metrics;

  // ── KPI Stats ────────────────────────────────────────────────────────────
  const kpiStats = [
    {
      title:      "Occupancy Rate",
      value:      `${m.occupancy_rate}%`,
      subtitle:   `${m.occupied_beds} / ${m.total_beds} beds occupied`,
      icon:       <Bed className="w-5 h-5" />,
      trend:      m.occupancy_rate >= 80 ? "up" as const : "down" as const,
      trendValue: `${m.vacant_beds} vacant`,
      color:      m.occupancy_rate >= 80 ? "green" as const : "amber" as const,
    },
    {
      title:      "Monthly Revenue",
      value:      fmt(m.monthly_revenue),
      subtitle:   `${m.rent_collection_rate}% collection rate`,
      icon:       <IndianRupee className="w-5 h-5" />,
      trend:      m.rent_collection_rate >= 80 ? "up" as const : "down" as const,
      trendValue: `${fmt(m.pending_rent)} pending`,
      color:      "red" as const,
    },
    {
      title:      "Active Tenants",
      value:      m.active_tenants.toLocaleString(),
      subtitle:   `${m.new_checkins} new this month`,
      icon:       <Users className="w-5 h-5" />,
      trend:      m.new_checkins > 0 ? "up" as const : "neutral" as const,
      trendValue: `${m.recent_checkouts} checkouts`,
      color:      "blue" as const,
    },
    {
      title:      "Pending Payments",
      value:      m.pending_payments.toLocaleString(),
      subtitle:   `${m.verified_payments} verified`,
      icon:       <CreditCard className="w-5 h-5" />,
      trend:      m.pending_payments === 0 ? "up" as const : "down" as const,
      trendValue: `${m.rejected_payments} rejected`,
      color:      m.pending_payments > 0 ? "amber" as const : "green" as const,
    },
    {
      title:      "Open Complaints",
      value:      m.open_complaints.toLocaleString(),
      subtitle:   `${m.resolved_complaints} resolved`,
      icon:       <MessageSquare className="w-5 h-5" />,
      trend:      m.open_complaints === 0 ? "up" as const : "down" as const,
      trendValue: `${m.pending_complaints} in progress`,
      color:      m.open_complaints > 5 ? "red" as const : "green" as const,
    },
    {
      title:      "Published Notices",
      value:      m.published_notices.toLocaleString(),
      subtitle:   `${m.total_notice_reads} total reads`,
      icon:       <Megaphone className="w-5 h-5" />,
      trend:      "neutral" as const,
      color:      "purple" as const,
    },
    {
      title:      "Overdue Rent",
      value:      fmt(m.overdue_rent),
      subtitle:   "Requires immediate action",
      icon:       <AlertTriangle className="w-5 h-5" />,
      trend:      m.overdue_rent === 0 ? "up" as const : "down" as const,
      trendValue: m.overdue_rent === 0 ? "All clear" : "Overdue",
      color:      m.overdue_rent > 0 ? "red" as const : "green" as const,
    },
    {
      title:      "Total Hostels",
      value:      m.total_hostels.toLocaleString(),
      subtitle:   `${m.total_rooms} rooms · ${m.total_beds} beds`,
      icon:       <Building2 className="w-5 h-5" />,
      color:      "gray" as const,
    },
  ];

  // ── Summary Cards ────────────────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Rent Overview",
      icon:  <IndianRupee className="w-4 h-4" />,
      items: [
        { label: "Total Billed",    value: fmt(m.monthly_revenue) },
        { label: "Collected",       value: fmt(m.collected_rent),  color: "text-green-600 dark:text-green-400" },
        { label: "Pending",         value: fmt(m.pending_rent),    color: "text-amber-600 dark:text-amber-400" },
        { label: "Overdue",         value: fmt(m.overdue_rent),    color: "text-red-600 dark:text-red-400" },
        { label: "Collection Rate", value: `${m.rent_collection_rate}%` },
      ],
    },
    {
      title: "Payment Status",
      icon:  <CreditCard className="w-4 h-4" />,
      items: [
        { label: "Verified",  value: m.verified_payments,  color: "text-green-600 dark:text-green-400" },
        { label: "Pending",   value: m.pending_payments,   color: "text-amber-600 dark:text-amber-400" },
        { label: "Rejected",  value: m.rejected_payments,  color: "text-red-600 dark:text-red-400" },
      ],
    },
    {
      title: "Complaint Status",
      icon:  <MessageSquare className="w-4 h-4" />,
      items: [
        { label: "Open",       value: m.open_complaints,     color: "text-red-600 dark:text-red-400" },
        { label: "In Progress",value: m.pending_complaints,  color: "text-amber-600 dark:text-amber-400" },
        { label: "Resolved",   value: m.resolved_complaints, color: "text-green-600 dark:text-green-400" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <StatisticsCards stats={kpiStats} columns={4} />

      {/* Summary Row */}
      <SummaryCards cards={summaryCards} columns={3} />

      {/* Charts Grid */}
      <ChartsGrid charts={data.charts} />
    </div>
  );
};
