import React, { useState } from "react";
import { useRentStore } from "../store/useRentStore";
import { useRents, useRentDashboard, useRentMutations, useRentDetails } from "../hooks/api/useRent";
import { useTenants } from "../../tenant/hooks/api/useTenant";
import { RentTable } from "../components/RentTable";
import { RentCard } from "../components/RentCard";
import { RentForm } from "../components/RentForm";
import { RentDetailsDrawer } from "../components/RentDetailsDrawer";
import { RentDashboardCards } from "../components/RentDashboardCards";
import { StatisticsCards } from "../components/StatisticsCards";
import { DeleteDialog } from "../../hostel/components/DeleteDialog";

import { Button } from "@bhagirathi/ui";
import {
  Coins,
  Search,
  Grid,
  List as ListIcon,
  Filter,
  ShieldAlert,
  RotateCcw,
  Home,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";

export const RentManagementPage: React.FC = () => {
  const {
    selectedRentId,
    activeViewMode,
    searchQuery,
    filterStatus,
    filterMonth,
    filterYear,
    setSelectedRentId,
    setActiveViewMode,
    setSearchQuery,
    setFilterStatus,
    setFilterMonth,
    resetSelection
  } = useRentStore();

  // Queries
  const { data: rents, isLoading, isError, refetch } = useRents();
  const { data: tenants } = useTenants();
  const { data: dashboardStats } = useRentDashboard();
  const { data: activeRentDetails } = useRentDetails(selectedRentId);

  // Mutations
  const { createRent, updateRent, deleteRent, recordPayment } = useRentMutations();
  // Local dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  // Errors state (for rent create/update/delete operations)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRetry = () => {
    refetch();
  };

  const handleExport = async () => {
    // BUG-005 fix: call the real rent ledger export endpoint
    setExportLoading(true);
    setExportError(null);
    try {
      const { apiClient } = await import("@bhagirathi/api-client");

      // Apply current page filters to the export
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterMonth) params.set("month", String(filterMonth));
      if (filterYear) params.set("year", String(filterYear));
      const query = params.toString() ? `?${params.toString()}` : "";

      const response = await apiClient.get(`/api/v1/rents/export${query}`, {
        responseType: "blob",
      });

      // Trigger browser file download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const a = document.createElement("a");
      const contentDisposition = response.headers["content-disposition"] || "";
      const match = contentDisposition.match(/filename=(.+)/);
      const filename = match?.[1] || `rent_ledger_export.csv`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError("Failed to export rent ledger. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none">
        <div className="h-16 rounded-card bg-white dark:bg-gray-900 border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-card bg-white dark:bg-gray-900 border border-border" />
          ))}
        </div>
        <div className="h-96 rounded-card bg-white dark:bg-gray-900 border border-border" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card text-center shadow-card select-none">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 rounded-full mb-4">
          <ShieldAlert className="h-10 w-10 text-danger" />
        </div>
        <h3 className="text-base font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">
          Failed to load Rent Index
        </h3>
        <p className="text-xs text-muted dark:text-gray-550 max-w-sm mb-6 leading-relaxed">
          There was an error communicating with the rent repository APIs. Please check your network or configurations.
        </p>
        <Button onClick={handleRetry} className="inline-flex items-center gap-2 font-bold h-9.5 px-4 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  // Filter and search logic
  const filteredRents = rents?.filter((r) => {
    const tenant = tenants?.find((t) => t.id === r.tenant_id);
    const matchesSearch =
      (tenant?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant?.tenant_id || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchesMonth = filterMonth === 0 || r.rent_month === filterMonth;
    const matchesYear = filterYear === 0 || r.rent_year === filterYear;

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  }) || [];

  // Manual create/edit submit
  const handleRentSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      if (editItem) {
        await updateRent.mutateAsync({ id: editItem.id, data });
      } else {
        await createRent.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Operation failed. Duplicate monthly invoices detected.";
      setErrorMsg(Array.isArray(msg) ? msg[0]?.msg : msg);
    }
  };


  // Record payment collections
  const handlePaymentRecord = async (amount: number, method: string, remarks?: string) => {
    if (!selectedRentId) return;
    await recordPayment.mutateAsync({
      id: selectedRentId,
      payment: {
        amount_paid: amount,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: method,
        remarks: remarks || null
      }
    });
  };

  // Delete invoice
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setErrorMsg(null);
      await deleteRent.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Delete failed.";
      setErrorMsg(Array.isArray(msg) ? msg[0]?.msg : msg);
    }
  };

  const isFormSubmitting =
    createRent.isPending ||
    updateRent.isPending ||
    recordPayment.isPending;

  // Aggregate stats defaults
  const dashboardStatsObj = dashboardStats || {
    totalMonthlyRent: 0,
    collectedRent: 0,
    pendingRent: 0,
    overdueRent: 0,
    todayDue: 0,
    totalDue: 0,
    upcomingDue: 0,
    collectionPercentage: 100.0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Breadcrumbs Context Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-gray-900 border border-border dark:border-gray-800 p-3 sm:p-4 rounded-card shadow-card select-none">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
          <Home className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary" />
          <ChevronRight className="h-3 w-3" />
          <span className="text-primaryText dark:text-white">Rent Ledger</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={exportLoading}
            className="inline-flex items-center gap-1.5 font-bold cursor-pointer h-9 px-2 sm:px-3.5 disabled:opacity-60"
            title="Export CSV"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">
              {exportLoading ? "Exporting..." : "Export CSV"}
            </span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleRetry}
            className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="h-4 w-4 text-secondaryText" />
          </Button>


        </div>
      </div>

      {/* Export error banner */}
      {exportError && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-750 dark:text-amber-400 rounded-card select-none">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Export Failed:</span> {exportError}
          </div>
        </div>
      )}

      {/* 2. Error Display Banner */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-750 dark:text-red-400 rounded-card select-none">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-danger" />
          <div className="text-xs">
            <span className="font-bold">Error Exception:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* 3. Consolidated Search & Filters Console */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card p-5 select-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4.5 w-4.5 text-primary" />
            <div>
              <h4 className="text-sm font-bold text-primaryText dark:text-white">Ledger Filter Tools</h4>
              <p className="text-[11px] text-muted dark:text-gray-550 mt-0.5">Track collections, monthly cycles, and status breakdowns</p>
            </div>
          </div>

          <div className="flex flex-wrap flex-1 w-full items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0 sm:min-w-[150px]">
              <span className="absolute left-3 top-2.5 text-muted">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search tenant account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-4 bg-gray-50 border border-border dark:bg-gray-955 dark:border-gray-800 rounded-input text-xs text-primaryText placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Status Select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 border border-border dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Bills</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid In Full</option>
              <option value="OVERDUE">Overdue Invoices</option>
            </select>

            {/* Month Select */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="h-9 px-3 border border-border dark:border-gray-800 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText cursor-pointer focus:outline-none"
            >
              <option value="0">All Months</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>{new Date(2026, m - 1).toLocaleString("en-US", { month: "long" })}</option>
              ))}
            </select>

            {/* View switch */}
            <div className="flex items-center border border-border dark:border-gray-800 rounded p-0.5 bg-gray-50 dark:bg-gray-950 select-none shrink-0">
              <button
                onClick={() => setActiveViewMode("table")}
                className={`p-1.5 rounded transition cursor-pointer ${
                  activeViewMode === "table" ? "bg-white dark:bg-gray-800 text-primary shadow-sm" : "text-muted hover:text-secondaryText"
                }`}
                title="Table View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveViewMode("card")}
                className={`p-1.5 rounded transition cursor-pointer ${
                  activeViewMode === "card" ? "bg-white dark:bg-gray-800 text-primary shadow-sm" : "text-muted hover:text-secondaryText"
                }`}
                title="Cards Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Statistics and collections ratios gauges */}
      <RentDashboardCards stats={dashboardStatsObj} />
      <StatisticsCards stats={dashboardStatsObj} />

      {/* 5. Ledger Data visualization */}
      {filteredRents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card text-center h-[350px] transition-colors select-none">
          <Coins className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3 animate-pulse" />
          <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider mb-1">
            No Invoices Recorded
          </h4>
          <p className="text-xs text-muted dark:text-gray-550 max-w-sm leading-relaxed">
            No records matched your search parameters. Try clearing the filters console or trigger batch auto billing.
          </p>
        </div>
      ) : activeViewMode === "table" ? (
        <RentTable
          rents={filteredRents}
          tenants={tenants || []}
          onEdit={(r) => {
            setErrorMsg(null);
            setEditItem(r);
            setIsFormOpen(true);
          }}
          onDelete={setDeleteId}
          onSelect={setSelectedRentId}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRents.map((r) => (
            <RentCard
              key={r.id}
              rent={r}
              tenants={tenants || []}
              onEdit={(x) => {
                setErrorMsg(null);
                setEditItem(x);
                setIsFormOpen(true);
              }}
              onDelete={setDeleteId}
              onSelect={setSelectedRentId}
            />
          ))}
        </div>
      )}

      {/* 6. Form Modals / Slide Drawer triggers */}
      {isFormOpen && (
        <RentForm
          isOpen={true}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleRentSubmit}
          tenants={tenants || []}
          initialData={editItem}
          isLoading={isFormSubmitting}
        />
      )}


      {selectedRentId && activeRentDetails && (
        <RentDetailsDrawer
          isOpen={true}
          onClose={resetSelection}
          rent={activeRentDetails}
          tenant={tenants?.find((t) => t.id === activeRentDetails.tenant_id) || null}
          onRecordPayment={handlePaymentRecord}
          isLoading={isFormSubmitting}
        />
      )}

      {deleteId && (
        <DeleteDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Rent Record"
          message="Are you sure you want to delete this rent invoice? This operation soft-deletes the record and clears any associated payments logs."
          isLoading={deleteRent.isPending}
        />
      )}
    </motion.div>
  );
};

export default RentManagementPage;
