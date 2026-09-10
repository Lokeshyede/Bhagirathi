import React, { useState } from "react";
import { useComplaintStore } from "../store/useComplaintStore";
import {
  useComplaints,
  useComplaintDashboard,
  useComplaintMutations,
  useComplaintDetails
} from "../hooks/useComplaint";
import { StatisticsCards } from "../components/StatisticsCards";
import { SearchBar } from "../components/SearchBar";
import { FilterPanel } from "../components/FilterPanel";
import { ComplaintTable } from "../components/ComplaintTable";
import { ComplaintCard } from "../components/ComplaintCard";
import { ComplaintDetailsDrawer } from "../components/ComplaintDetailsDrawer";
import { AssignDialog } from "../components/AssignDialog";
import { StatusDialog } from "../components/StatusDialog";
import { Pagination } from "../components/Pagination";

import { Button, PageHeader } from "@bhagirathi/ui";
import {
  Grid,
  List as ListIcon,
  ShieldAlert,
  RotateCcw,
  Home,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";

export const ComplaintManagementPage: React.FC = () => {
  const {
    selectedComplaintId,
    searchQuery,
    filterStatus,
    filterPriority,
    filterCategory,
    isAssignDialogOpen,
    isStatusDialogOpen,
    setSelectedComplaintId,
    setSearchQuery,
    setFilterStatus,
    setFilterPriority,
    setFilterCategory,
    setAssignDialogOpen,
    setStatusDialogOpen,
    resetSelection
  } = useComplaintStore();

  const [activeViewMode, setActiveViewMode] = useState<"table" | "card">("table");

  // Queries
  const { data: complaints, isLoading, isError, refetch } = useComplaints({
    statusFilter: filterStatus,
    priorityFilter: filterPriority,
    categoryFilter: filterCategory,
    searchQuery: searchQuery
  });

  const { data: stats } = useComplaintDashboard();
  const { data: activeComplaint } = useComplaintDetails(selectedComplaintId);

  // Mutations
  const { assignComplaint, updateStatus } = useComplaintMutations();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleRetry = () => {
    refetch();
  };

  const handleExport = () => {
    alert("Exporting complaints logs...");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none">
        <div className="h-16 rounded-card bg-white dark:bg-gray-900 border border-border" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-card bg-white dark:bg-gray-900 border border-border" />
          ))}
        </div>
        <div className="h-96 rounded-card bg-white dark:bg-gray-900 border border-border" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card text-center shadow-card select-none">
        <div className="p-4 bg-red-50 dark:bg-red-955 text-red-650 rounded-full mb-4">
          <ShieldAlert className="h-10 w-10 text-danger" />
        </div>
        <h3 className="text-base font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">
          Failed to load complaints registry
        </h3>
        <p className="text-xs text-muted dark:text-gray-550 max-w-sm mb-6 leading-relaxed">
          There was an error communicating with the complaints database. Please check your network or configurations.
        </p>
        <Button onClick={handleRetry} className="inline-flex items-center gap-2 font-bold h-9.5 px-4 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  const list = complaints || [];
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = list.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAssign = async (maintenanceId: string) => {
    if (!selectedComplaintId) return;
    await assignComplaint.mutateAsync({
      id: selectedComplaintId,
      maintenanceId
    });
  };

  const handleStatusUpdate = async (data: { status: string; remarks: string }) => {
    if (!selectedComplaintId) return;
    await updateStatus.mutateAsync({
      id: selectedComplaintId,
      status: data.status,
      remarks: data.remarks
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Breadcrumbs Header */}
      <PageHeader
        title="Complaints Desk"
        description="Monitor, assign, and resolve maintenance issues across properties"
        breadcrumb={
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Home className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-red-500" />
            <ChevronRight className="h-3 w-3" />
            <span className="text-gradient-primary">Complaints Desk</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="secondary"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 font-bold cursor-pointer h-9 px-2 sm:px-3.5"
              title="Export CSV"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleRetry}
              className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
              title="Refresh Complaints"
            >
              <RefreshCw className="h-4 w-4 text-secondaryText" />
            </Button>
          </div>
        }
      />

      {/* 2. Summary statistics cards */}
      <StatisticsCards stats={stats} />

      {/* 3. Consolidated search & filter actions */}
      <div className="glass-panel p-5 select-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Search — fixed width, never shrinks */}
          <div className="flex-shrink-0 w-full lg:w-72 xl:w-80">
            <SearchBar
              value={searchQuery}
              onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            />
          </div>

          {/* Filters — takes remaining space, wraps onto new lines as needed */}
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-3">
            {/* Filter Tags Panel */}
            <FilterPanel
              statusFilter={filterStatus}
              priorityFilter={filterPriority}
              categoryFilter={filterCategory}
              onStatusChange={(s) => { setFilterStatus(s); setCurrentPage(1); }}
              onPriorityChange={(p) => { setFilterPriority(p); setCurrentPage(1); }}
              onCategoryChange={(c) => { setFilterCategory(c); setCurrentPage(1); }}
              onReset={() => {
                setSearchQuery("");
                setFilterStatus("ALL");
                setFilterPriority("ALL");
                setFilterCategory("ALL");
                setCurrentPage(1);
              }}
            />

            {/* Toggle view mode */}
            <div className="flex items-center border border-border dark:border-gray-800 rounded p-0.5 bg-gray-50 dark:bg-gray-950 shrink-0">
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

      {/* 4. Primary listings area */}
      <div className="space-y-4">
        {activeViewMode === "table" ? (
          <ComplaintTable complaints={paginatedList} onSelect={setSelectedComplaintId} />
        ) : (
          <ComplaintCard complaints={paginatedList} onSelect={setSelectedComplaintId} />
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={list.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Sidebar detail drawer */}
      {selectedComplaintId && (
        <ComplaintDetailsDrawer
          id={selectedComplaintId}
          onClose={resetSelection}
          onAssignCrew={() => setAssignDialogOpen(true)}
          onChangeStatus={() => setStatusDialogOpen(true)}
        />
      )}

      {/* Assignment Modal */}
      {isAssignDialogOpen && activeComplaint && (
        <AssignDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          complaint={activeComplaint}
          onAssign={handleAssign}
        />
      )}

      {/* Status Transition Modal */}
      {isStatusDialogOpen && activeComplaint && (
        <StatusDialog
          isOpen={isStatusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          complaint={activeComplaint}
          onUpdateStatus={handleStatusUpdate}
        />
      )}
    </motion.div>
  );
};

export default ComplaintManagementPage;
