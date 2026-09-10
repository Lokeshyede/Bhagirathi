import React, { useState } from "react";
import { useTenantStore } from "../store/useTenantStore";
import { useTenants, useTenantMutations } from "../hooks/api/useTenant";
import { useAllocationMutations } from "../hooks/api/useAllocation";
import { TenantTable } from "../components/TenantTable";
import { TenantCard } from "../components/TenantCard";
import { TenantForm } from "../components/TenantForm";
import { CheckInDialog } from "../components/CheckInDialog";
import { CheckOutDialog } from "../components/CheckOutDialog";
import { AllocationWizard } from "../components/AllocationWizard";
import { TransferRoomDialog } from "../components/TransferRoomDialog";
import { TransferBedDialog } from "../components/TransferBedDialog";
import { TenantProfile } from "../components/TenantProfile";
import { StatisticsCards } from "../components/StatisticsCards";
import { DeleteDialog } from "../../hostel/components/DeleteDialog";

import { Button, PageHeader, PageSkeleton, NoTenant, NoSearchResult } from "@bhagirathi/ui";
import { parseApiError } from "@bhagirathi/utils";
import {
  Search,
  Plus,
  Grid,
  List as ListIcon,
  Filter,
  ShieldAlert,
  RotateCcw,
  ChevronRight,
  Home,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";

export const TenantManagementPage: React.FC = () => {
  const {
    selectedTenantId,
    activeViewMode,
    searchQuery,
    filterStatus,
    setSelectedTenantId,
    setActiveViewMode,
    setSearchQuery,
    setFilterStatus,
    resetSelection
  } = useTenantStore();

  // Queries
  const { data: tenants, isLoading, isError, refetch } = useTenants();

  // Mutations
  const { createTenant, updateTenant, deleteTenant, checkinTenant } = useTenantMutations();
  const { allocateBed, transferRoom, transferBed, checkoutTenant: newCheckoutTenant } = useAllocationMutations();

  // Dialogs local triggers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isTransferRoomOpen, setIsTransferRoomOpen] = useState(false);
  const [isTransferBedOpen, setIsTransferBedOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [activeTenantContext, setActiveTenantContext] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Errors state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRetry = () => {
    refetch();
  };

  const { bulkImportTenants } = useTenantMutations();
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/v1/tenants/export", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tenants_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to export tenant registry CSV.");
    }
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    try {
      setBulkError(null);
      // Parse CSV lines: full_name, email, phone, gender, aadhaar_number, company_college
      const lines = csvText.trim().split("\n");
      const tenantsList = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("full_name") || line.startsWith("Name")) continue;

        const parts = line.split(",").map(p => p.trim().replace(/^"/, "").replace(/"$/, ""));
        if (parts.length >= 3) {
          tenantsList.push({
            full_name: parts[0],
            email: parts[1],
            phone: parts[2],
            gender: parts[3] || "MALE",
            aadhaar_number: parts[4] || undefined,
            company_college: parts[5] || undefined
          });
        }
      }

      if (tenantsList.length === 0) {
        setBulkError("No valid tenant rows found. Check format.");
        return;
      }

      const result = await bulkImportTenants.mutateAsync({ tenants: tenantsList });
      alert(`Bulk Import Complete: ${result.imported_count} imported, ${result.skipped_records?.length || 0} skipped.`);
      setIsBulkImportOpen(false);
      setCsvText("");
      refetch();
    } catch (err: any) {
      setBulkError(parseApiError(err, "Bulk import failed."));
    }
  };


  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card text-center shadow-card select-none">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 rounded-full mb-4">
          <ShieldAlert className="h-10 w-10 text-danger" />
        </div>
        <h3 className="text-base font-extrabold text-primaryText dark:text-white mb-1 uppercase tracking-wider">
          Failed to load Tenant Registry
        </h3>
        <p className="text-xs text-muted dark:text-gray-500 max-w-sm mb-6 leading-relaxed">
          There was an error communicating with the tenant repository APIs. Please check your network or configurations.
        </p>
        <Button onClick={handleRetry} className="inline-flex items-center gap-2 font-bold h-9.5 px-4 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          Retry Request
        </Button>
      </div>
    );
  }

  // Calculate statistics counts
  const stats = {
    total: tenants?.length || 0,
    active: tenants?.filter((t) => t.status === "ACTIVE").length || 0,
    checkedOut: tenants?.filter((t) => t.status === "CHECKED_OUT").length || 0,
    inactive: tenants?.filter((t) => t.status === "INACTIVE").length || 0,
  };

  // Filter and Search evaluations
  const filteredTenants = tenants?.filter((t) => {
    const matchesSearch =
      (t.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tenant_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.mobile || "").includes(searchQuery) ||
      (t.phone || "").includes(searchQuery) ||
      (t.aadhaar_number || "").includes(searchQuery);

    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;

    return matchesSearch && matchesStatus;
  }) || [];

  // Submit profile addition/edit
  const handleProfileSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      if (editItem) {
        await updateTenant.mutateAsync({ id: editItem.id, data });
      } else {
        await createTenant.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Operation failed. Duplicate mobile, email, or Aadhaar detected."));
    }
  };

  // Submit allocation check-in
  const handleCheckInSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      await checkinTenant.mutateAsync(data);
      setIsCheckInOpen(false);
      setActiveTenantContext(null);
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Check-in failed. Target bed might be occupied."));
    }
  };

  // Submit checkout
  const handleCheckOutSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      await newCheckoutTenant.mutateAsync(data);
      setIsCheckOutOpen(false);
      setActiveTenantContext(null);
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Check-out failed."));
    }
  };

  // Submit Room Transfer
  const handleTransferRoomSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      await transferRoom.mutateAsync(data);
      setIsTransferRoomOpen(false);
      setActiveTenantContext(null);
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Room transfer failed."));
    }
  };

  // Submit Bed Transfer
  const handleTransferBedSubmit = async (data: any) => {
    try {
      setErrorMsg(null);
      await transferBed.mutateAsync(data);
      setIsTransferBedOpen(false);
      setActiveTenantContext(null);
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Bed transfer failed."));
    }
  };

  // Delete profile confirm
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setErrorMsg(null);
      await deleteTenant.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      setErrorMsg(parseApiError(err, "Delete failed."));
    }
  };

  const isFormSubmitting =
    createTenant.isPending ||
    updateTenant.isPending ||
    checkinTenant.isPending ||
    newCheckoutTenant.isPending ||
    allocateBed.isPending ||
    transferRoom.isPending ||
    transferBed.isPending;

  // Render detail profile dossier view instead of tables if a tenant is selected
  const activeTenantDetails = tenants?.find((t) => t.id === selectedTenantId);
  if (selectedTenantId && activeTenantDetails) {
    return (
      <TenantProfile
        tenant={activeTenantDetails}
        onBack={resetSelection}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <PageHeader
        title="Tenant Registry"
        description="Manage all resident profiles, check-ins, check-outs, and room allocations"
        breadcrumb={
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Home className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary" />
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">Registry</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsBulkImportOpen(true)}
              title="Bulk Import"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk Import</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              title="Export CSV"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleRetry}
              title="Refresh Registry"
              className="px-3"
            >
              <RefreshCw className="h-4 w-4 text-text-secondary" />
            </Button>
            <Button
              onClick={() => {
                setErrorMsg(null);
                setEditItem(null);
                setIsFormOpen(true);
              }}
              title="Onboard Tenant"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Onboard Tenant</span>
            </Button>
          </div>
        }
      />

      {/* 2. Error Display Banner */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-750 dark:text-red-400 rounded-card select-none">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-danger" />
          <div className="text-xs">
            <span className="font-bold">Error Exception:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* 3. Consolidated Search & Filter Panel */}
      <div className="glass-panel p-4 sm:p-5 select-none space-y-3 sm:space-y-4 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl flex-shrink-0">
              <Filter className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Registry Filters</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block font-bold">Filter by status and keywords</p>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row flex-1 sm:max-w-lg w-full items-stretch xs:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-2.5 text-muted">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search name, phone, Aadhaar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-9 pr-4 bg-gray-50 border border-border dark:bg-gray-950 dark:border-gray-800 rounded-input text-xs text-primaryText placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all font-semibold"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Status Selector */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="admin-select flex-shrink-0 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              {/* View switcher */}
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
      </div>

      {/* 4. Statistics cards */}
      <StatisticsCards stats={stats} />

      {/* 5. Data View Switcher */}
      {tenants && tenants.length === 0 ? (
        <NoTenant onAction={() => setIsFormOpen(true)} />
      ) : filteredTenants.length === 0 ? (
        <NoSearchResult onAction={() => { setSearchQuery(""); setFilterStatus("ALL"); }} actionText="Clear Filters" />
      ) : activeViewMode === "table" ? (
        <TenantTable
          tenants={filteredTenants}
          onEdit={(t) => {
            setErrorMsg(null);
            setEditItem(t);
            setIsFormOpen(true);
          }}
          onDelete={setDeleteId}
          onSelect={setSelectedTenantId}
          onCheckIn={(t) => {
            setErrorMsg(null);
            setActiveTenantContext(t);
            setIsCheckInOpen(true);
          }}
          onCheckOut={(t) => {
            setErrorMsg(null);
            setActiveTenantContext(t);
            setIsCheckOutOpen(true);
          }}
          onTransferRoom={(t) => {
            setErrorMsg(null);
            setActiveTenantContext(t);
            setIsTransferRoomOpen(true);
          }}
          onTransferBed={(t) => {
            setErrorMsg(null);
            setActiveTenantContext(t);
            setIsTransferBedOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTenants.map((t) => (
            <TenantCard
              key={t.id}
              tenant={t}
              onEdit={(x) => {
                setErrorMsg(null);
                setEditItem(x);
                setIsFormOpen(true);
              }}
              onDelete={setDeleteId}
              onSelect={setSelectedTenantId}
              onCheckIn={(x) => {
                setErrorMsg(null);
                setActiveTenantContext(x);
                setIsCheckInOpen(true);
              }}
              onCheckOut={(x) => {
                setErrorMsg(null);
                setActiveTenantContext(x);
                setIsCheckOutOpen(true);
              }}
              onTransferRoom={(x) => {
                setErrorMsg(null);
                setActiveTenantContext(x);
                setIsTransferRoomOpen(true);
              }}
              onTransferBed={(x) => {
                setErrorMsg(null);
                setActiveTenantContext(x);
                setIsTransferBedOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* 6. Form Modals / Checkins / Checkouts dialog allocations */}
      {isFormOpen && (
        editItem ? (
          <TenantForm
            isOpen={true}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleProfileSubmit}
            initialData={editItem}
            isLoading={isFormSubmitting}
          />
        ) : (
          <AllocationWizard
            isOpen={true}
            onClose={() => setIsFormOpen(false)}
          />
        )
      )}

      {isCheckInOpen && activeTenantContext && (
        <CheckInDialog
          isOpen={true}
          onClose={() => setIsCheckInOpen(false)}
          onSubmit={handleCheckInSubmit}
          tenantId={activeTenantContext.id}
          tenantName={activeTenantContext.full_name}
          isLoading={isFormSubmitting}
        />
      )}

      {isCheckOutOpen && activeTenantContext && (
        <CheckOutDialog
          isOpen={true}
          onClose={() => setIsCheckOutOpen(false)}
          onSubmit={handleCheckOutSubmit}
          tenantId={activeTenantContext.id}
          tenantName={activeTenantContext.full_name}
          isLoading={isFormSubmitting}
        />
      )}

      {isTransferRoomOpen && activeTenantContext && (
        <TransferRoomDialog
          isOpen={true}
          onClose={() => setIsTransferRoomOpen(false)}
          onSubmit={handleTransferRoomSubmit}
          tenantId={activeTenantContext.id}
          tenantName={activeTenantContext.full_name}
          isLoading={isFormSubmitting}
        />
      )}

      {isTransferBedOpen && activeTenantContext && (
        <TransferBedDialog
          isOpen={true}
          onClose={() => setIsTransferBedOpen(false)}
          onSubmit={handleTransferBedSubmit}
          tenantId={activeTenantContext.id}
          tenantName={activeTenantContext.full_name}
          roomId={activeTenantContext.room_id || ""}
          isLoading={isFormSubmitting}
        />
      )}

      {deleteId && (
        <DeleteDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Tenant Profile"
          message="Are you sure you want to permanently delete this tenant profile? This operation cannot be undone."
          isLoading={deleteTenant.isPending}
        />
      )}

      {/* Bulk Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none">
          <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 max-w-xl w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-primaryText dark:text-white">
                Bulk Import Tenants (CSV Format)
              </h3>
              <button onClick={() => setIsBulkImportOpen(false)} className="text-muted hover:text-primaryText p-1">
                ✕
              </button>
            </div>

            {bulkError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {bulkError}
              </div>
            )}

            <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-secondaryText dark:text-gray-300 block mb-1">
                  CSV Data Payload (full_name, email, phone, gender, aadhaar_number, company_college)
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`full_name,email,phone,gender,aadhaar_number,company_college\nRohan Sharma,rohan@example.com,9876543210,MALE,123456789012,Delhi University\nAarav Patel,aarav@example.com,9876543211,MALE,123456789013,TCS`}
                  className="w-full p-3 font-mono border border-border dark:border-gray-800 rounded bg-gray-50 dark:bg-gray-950 text-primaryText dark:text-gray-200 text-xs"
                  required
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-muted">
                <span>Header row is optional. Minimum required columns: full_name, email, phone</span>
                <button
                  type="button"
                  onClick={() => setCsvText("full_name,email,phone,gender,aadhaar_number,company_college\nRohan Sharma,rohan@example.com,9876543210,MALE,123456789012,Delhi University\nAarav Patel,aarav@example.com,9876543211,MALE,123456789013,TCS")}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Load Sample Template
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsBulkImportOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={bulkImportTenants.isPending}>Import Tenants Batch</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};


export default TenantManagementPage;
