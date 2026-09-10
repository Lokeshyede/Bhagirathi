import React, { useState } from "react";
import { useNoticeStore } from "../store/useNoticeStore";
import {
  useNotices,
  useNoticeDashboard
} from "../hooks/api/useNotice";
import { NoticeDashboard as DashboardStats } from "../components/NoticeDashboard";
import { SearchBar } from "../components/SearchBar";
import { FilterPanel } from "../components/FilterPanel";
import { NoticeTable } from "../components/NoticeTable";
import { NoticeCard } from "../components/NoticeCard";
import { NoticeDetailsDrawer } from "../components/NoticeDetailsDrawer";
import { NoticeForm } from "../components/NoticeForm";
import { Pagination } from "../../complaint/components/Pagination";

import { Button } from "@bhagirathi/ui";
import {
  Grid,
  List as ListIcon,
  ShieldAlert,
  Plus,
  RotateCcw,
  Home,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";

export const NoticeManagementPage: React.FC = () => {
  const {
    selectedNoticeId,
    searchQuery,
    filterStatus,
    filterPriority,
    isFormOpen,
    activeEditId,
    setSelectedNoticeId,
    setSearchQuery,
    setFilterStatus,
    setFilterPriority,
    setFormOpen,
    resetSelection
  } = useNoticeStore();

  const [activeViewMode, setActiveViewMode] = useState<"table" | "card">("table");

  // Queries
  const { data: notices, isLoading, isError, refetch } = useNotices({
    statusFilter: filterStatus,
    priorityFilter: filterPriority,
    searchQuery: searchQuery
  });

  const { data: stats } = useNoticeDashboard();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleRetry = () => {
    refetch();
  };

  const handleExport = () => {
    alert("Exporting notice logs...");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none">
        <div className="h-16 rounded-card bg-white dark:bg-gray-900 border border-border" />
        <div className="h-28 rounded-card bg-white dark:bg-gray-900 border border-border" />
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
          Failed to load notices registry
        </h3>
        <p className="text-xs text-muted dark:text-gray-550 max-w-sm mb-6 leading-relaxed">
          Could not communicate with the notice board service database. Please check your network or configurations.
        </p>
        <Button onClick={handleRetry} className="inline-flex items-center gap-2 font-bold h-9.5 px-4 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  const list = notices || [];
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = list.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Breadcrumbs Header */}
      <div className="flex justify-between items-center glass-panel p-4 shadow-sm select-none">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Home className="h-4.5 w-4.5 text-red-500" />
          <ChevronRight className="h-3 w-3" />
          <span className="text-gradient-primary">Notice Board</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 font-bold cursor-pointer h-9 px-3.5"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleRetry}
            className="h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
            title="Refresh Notice Board"
          >
            <RefreshCw className="h-4 w-4 text-secondaryText" />
          </Button>

          <Button
            onClick={() => setFormOpen(true, "create", null)}
            className="inline-flex items-center gap-1.5 font-bold cursor-pointer h-9 px-3.5 text-white"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Draft Notice</span>
          </Button>
        </div>
      </div>

      {/* 2. Notice statistics summary block */}
      <DashboardStats stats={stats} />

      {/* 3. Consolidated search & filter console */}
      <div className="glass-panel p-5 select-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <SearchBar
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter tags panel */}
            <FilterPanel
              statusFilter={filterStatus}
              priorityFilter={filterPriority}
              onStatusChange={(s) => { setFilterStatus(s); setCurrentPage(1); }}
              onPriorityChange={(p) => { setFilterPriority(p); setCurrentPage(1); }}
              onReset={() => {
                setSearchQuery("");
                setFilterStatus("ALL");
                setFilterPriority("ALL");
                setCurrentPage(1);
              }}
            />

            {/* Toggle view mode */}
            <div className="flex items-center border border-border dark:border-gray-800 rounded p-0.5 bg-gray-50 dark:bg-gray-955 shrink-0">
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
          <NoticeTable notices={paginatedList} onSelect={setSelectedNoticeId} />
        ) : (
          <NoticeCard notices={paginatedList} onSelect={setSelectedNoticeId} />
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={list.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Sidebar details drawer */}
      {selectedNoticeId && (
        <NoticeDetailsDrawer
          id={selectedNoticeId}
          onClose={resetSelection}
          onEdit={(id) => setFormOpen(true, "edit", id)}
        />
      )}

      {/* Modal Draft/Edit Form */}
      {isFormOpen && (
        <NoticeForm
          isOpen={isFormOpen}
          onClose={() => setFormOpen(false)}
          editId={activeEditId}
        />
      )}
    </motion.div>
  );
};

export default NoticeManagementPage;
