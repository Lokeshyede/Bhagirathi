import React from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "../store/useDashboardStore";
import {
  useDashboardSummary,
  useDashboardStatistics,
  useDashboardCharts,
  useRecentPayments,
  useRecentComplaints,
  useRecentNotices,
  useActivityLog,
  useDashboardOccupancy,
} from "../hooks/api/useDashboard";
import { useHostels, useBuildings } from "../../hostel/hooks/api/useHostel";

// New Redesigned Dashboard Components
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardFilterBar } from "../components/DashboardFilterBar";
import { DashboardKPICards } from "../components/DashboardKPICards";
import { DashboardOccupancyCard } from "../components/DashboardOccupancyCard";
import { DashboardRentOverviewCard } from "../components/DashboardRentOverviewCard";
import { ActionRequiredCard } from "../components/ActionRequiredCard";
import { RecentActivityCard } from "../components/RecentActivityCard";
import { QuickActionsCard } from "../components/QuickActionsCard";
import { RentAlertPopup } from "../components/RentAlertPopup";
import { TodayRentCollectionSection } from "../components/TodayRentCollectionSection";
import { DashboardSkeleton } from "../components/DashboardSkeleton";

import { DashboardEmptyState } from "../components/DashboardEmptyState";

import { Button } from "@bhagirathi/ui";
import { RefreshCw, ShieldAlert } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const {
    dateRange,
    hostelId,
    buildingId,
    status,
    setDateRange,
    setHostelId,
    setBuildingId,
    setStatus,
    resetFilters,
  } = useDashboardStore();

  const filters = { dateRange, hostelId, buildingId, status };

  // Load Hostels & Buildings for filter toolbar
  const { data: hostels } = useHostels();
  const { data: buildings } = useBuildings(hostelId);

  // Load API data queries
  const summaryQuery = useDashboardSummary(filters);
  const statisticsQuery = useDashboardStatistics(filters);
  const chartsQuery = useDashboardCharts({ dateRange, hostelId, buildingId });
  const paymentsQuery = useRecentPayments(filters);
  const complaintsQuery = useRecentComplaints(filters);
  const noticesQuery = useRecentNotices(filters);
  const activityQuery = useActivityLog();
  const occupancyQuery = useDashboardOccupancy({ hostelId, buildingId, status });

  const isLoading =
    summaryQuery.isLoading ||
    statisticsQuery.isLoading ||
    chartsQuery.isLoading ||
    paymentsQuery.isLoading ||
    complaintsQuery.isLoading ||
    noticesQuery.isLoading ||
    activityQuery.isLoading ||
    occupancyQuery.isLoading;

  const isError =
    summaryQuery.isError &&
    statisticsQuery.isError &&
    chartsQuery.isError;

  const isFetching =
    summaryQuery.isFetching ||
    statisticsQuery.isFetching ||
    chartsQuery.isFetching ||
    activityQuery.isFetching;

  const handleRefresh = () => {
    summaryQuery.refetch();
    statisticsQuery.refetch();
    chartsQuery.refetch();
    paymentsQuery.refetch();
    complaintsQuery.refetch();
    noticesQuery.refetch();
    activityQuery.refetch();
    occupancyQuery.refetch();
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl text-center shadow-sm select-none">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-full mb-4">
          <ShieldAlert className="h-10 w-10 text-danger" />
        </div>
        <h3 className="text-base font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">
          Failed to load Dashboard
        </h3>
        <p className="text-xs text-muted dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
          There was an error communicating with the server endpoints. Please check your network connection and retry.
        </p>
        <Button onClick={handleRefresh} className="inline-flex items-center gap-2 font-bold h-9 px-4 cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  const hasData =
    summaryQuery.data ||
    statisticsQuery.data ||
    chartsQuery.data;

  if (!hasData) {
    return <DashboardEmptyState onResetFilters={handleResetFilters} />;
  }

  const stats = statisticsQuery.data;
  
  if (!stats) {
    return <DashboardSkeleton />;
  }

  const occupancyRate =
    summaryQuery.data?.occupancy_rate ??
    (stats.total_beds > 0 ? Math.round((stats.occupied_beds / stats.total_beds) * 100) : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-16"
    >
      {/* 🔔 Morning Rent Alert Popup (shows once per session) */}
      <RentAlertPopup />

      {/* 1. Header Greeting & Real-time Live Clock */}
      <DashboardHeader occupancyRate={occupancyRate} />

      {/* 2. Compact Horizontal Filter Bar */}
      <DashboardFilterBar
        hostels={hostels || []}
        buildings={buildings || []}
        hostelId={hostelId}
        buildingId={buildingId}
        status={status}
        dateRange={dateRange}
        onHostelChange={setHostelId}
        onBuildingChange={setBuildingId}
        onStatusChange={setStatus}
        onDateRangeChange={setDateRange}
        onReset={handleResetFilters}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {/* 3. KPI / Management Overview (6 Cards) */}
      <DashboardKPICards stats={stats} />

      {/* 4. Occupancy + Rent Overview (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DashboardOccupancyCard
          stats={stats}
          occupancyData={occupancyQuery.data}
        />

        <DashboardRentOverviewCard
          stats={stats}
          charts={chartsQuery.data}
        />
      </div>

      {/* 4b. Today's Rent Collection / Rent Reminder Section */}
      <TodayRentCollectionSection
        hostelId={hostelId}
        buildingId={buildingId}
      />

      {/* 5. Lower Section: Action Required + Recent Activity + Quick Actions (3 Columns) */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Column 1: Action Required (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <ActionRequiredCard stats={stats} />
        </div>

        {/* Column 2: Recent Activity (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <RecentActivityCard activities={activityQuery.data || []} />
        </div>

        {/* Column 3: Quick Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <QuickActionsCard />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
