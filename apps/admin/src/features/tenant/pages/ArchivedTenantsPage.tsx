import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Archive,
  Search,
  RotateCcw,
  Eye,
  UserCheck,
  Home,
  ChevronRight,
  RefreshCw,
  Users,
  ShieldCheck,
  ArrowUpDown,
  X,
  BedDouble,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { Button, PageHeader, PageSkeleton } from "@bhagirathi/ui";
import { formatDate } from "@bhagirathi/utils";
import { useArchivedTenants } from "../hooks/api/useTenant";
import { useHostels, useBuildings } from "../../hostel/hooks/api/useHostel";
import { ArchivedTenantItem } from "@bhagirathi/types";
import { ArchivedTenantDossierModal } from "../components/ArchivedTenantDossierModal";
import { RestoreTenantDialog } from "../components/RestoreTenantDialog";

export const ArchivedTenantsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostelId, setSelectedHostelId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("archived_at_desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [selectedDossierTenantId, setSelectedDossierTenantId] = useState<string | null>(null);
  const [selectedRestoreTenant, setSelectedRestoreTenant] = useState<ArchivedTenantItem | null>(null);

  // Queries
  const { data: hostels } = useHostels();
  const { data: buildings } = useBuildings(selectedHostelId || null);

  const {
    data: archivedData,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useArchivedTenants({
    search: searchQuery || undefined,
    hostel_id: selectedHostelId || undefined,
    building_id: selectedBuildingId || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort_by: sortBy,
    page,
    limit: pageSize
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedHostelId("");
    setSelectedBuildingId("");
    setDateFrom("");
    setDateTo("");
    setSortBy("archived_at_desc");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedHostelId || selectedBuildingId || dateFrom || dateTo || sortBy !== "archived_at_desc"
  );

  const getInitials = (name: string) => {
    return (name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-16"
    >
      {/* 1. Page Header */}
      <PageHeader
        title="Archived Tenants Registry"
        description="Audit registry and complete historical record of deactivated residents. All contracts, rent ledgers, and payments are preserved."
        breadcrumb={
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Home className="h-4 w-4 text-primary" />
            <ChevronRight className="h-3 w-3" />
            <span
              onClick={() => navigate("/tenants")}
              className="hover:underline cursor-pointer text-slate-600 dark:text-slate-300"
            >
              Tenants
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-bold">Archived Registry</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate("/tenants")}
              className="inline-flex items-center gap-2 font-bold text-xs cursor-pointer"
            >
              <Users className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span>Active Registry</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh Registry"
              className="px-3 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        }
      />

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Total Archived
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white tabular-nums">
              {archivedData?.total ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Profiles safely deactivated
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Data Integrity
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              100%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Ledgers, payments & bills preserved
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Restoration Status
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              Conflict-Aware
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white hidden">
              Enabled
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Live bed vacancy validation
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Panel */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, tenant ID, or Aadhaar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="text-xs h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="archived_at_desc">Archived: Newest First</option>
              <option value="archived_at_asc">Archived: Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Cascading Location & Date Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {/* Hostel Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Hostel / Property
            </label>
            <select
              value={selectedHostelId}
              onChange={(e) => {
                setSelectedHostelId(e.target.value);
                setSelectedBuildingId("");
                setPage(1);
              }}
              className="w-full text-xs h-8.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Hostels</option>
              {hostels?.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Building Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Building
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => {
                setSelectedBuildingId(e.target.value);
                setPage(1);
              }}
              disabled={!selectedHostelId}
              className="w-full text-xs h-8.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">All Buildings</option>
              {buildings?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Archived From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs h-8.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Archived To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs h-8.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Active Filter Badges and Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-[11px] text-slate-500">
              Active filters applied
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Table / Content Section */}
      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/20">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            Failed to load archived tenants registry.
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 cursor-pointer font-bold text-xs"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : !archivedData?.items || archivedData.items.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-3">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Archive className="h-6 w-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            {hasActiveFilters ? "No Matching Archived Tenants" : "No Archived Tenants"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "No deactivated residents matched your search query and filter criteria. Try adjusting or clearing your filters."
              : "There are currently no archived or deactivated tenant records in the system. Active tenant deletions will safely appear here."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              className="cursor-pointer font-bold text-xs inline-flex items-center gap-2 mt-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 pl-5 pr-3">Resident</th>
                  <th className="py-3.5 px-3 hidden sm:table-cell">Contact</th>
                  <th className="py-3.5 px-3">Last Location</th>
                  <th className="py-3.5 px-3 hidden md:table-cell">Archival Record</th>
                  <th className="py-3.5 px-3 hidden lg:table-cell">Reason</th>
                  <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {archivedData.items.map((tenant: ArchivedTenantItem) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Resident Info */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden shrink-0">
                          {tenant.photo_url ? (
                            <img
                              src={tenant.photo_url}
                              alt={tenant.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(tenant.full_name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedDossierTenantId(tenant.id)}
                            className="font-bold text-slate-800 dark:text-white hover:text-primary transition-colors text-left block truncate"
                          >
                            {tenant.full_name}
                          </button>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                              {tenant.tenant_id}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                              ARCHIVED
                            </span>
                          </div>
                          {/* Mobile-only phone since Contact column is hidden on sm */}
                          {tenant.phone && (
                            <span className="sm:hidden text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
                              📱 {tenant.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-3 hidden sm:table-cell">
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {tenant.phone || "—"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {tenant.email || "—"}
                      </div>
                    </td>

                    {/* Last Location */}
                    <td className="py-3.5 px-3">
                      {tenant.last_room_number ? (
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
                            <BedDouble className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span>Room {tenant.last_room_number}</span>
                            {tenant.last_bed_number && (
                              <span className="text-slate-400 font-normal">
                                (Bed {tenant.last_bed_number})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {[tenant.last_building_name, tenant.last_hostel_name].filter(Boolean).join(" • ") || "Hostel Location"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Unallocated at archival
                        </span>
                      )}
                    </td>

                    {/* Archival Record */}
                    <td className="py-3.5 px-3 hidden md:table-cell">
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {tenant.archived_at ? formatDate(tenant.archived_at, true) : "—"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        By: <span className="font-semibold text-slate-600 dark:text-slate-300">{tenant.archived_by_name || "Admin"}</span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 hidden lg:table-cell">
                      <span className="inline-block max-w-[180px] text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {tenant.archive_reason || "Archived by Admin"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedDossierTenantId(tenant.id)}
                          className="h-8 px-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          title="View 11-Section Historical Dossier"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Dossier</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setSelectedRestoreTenant(tenant)}
                          className="h-8 px-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 cursor-pointer"
                          title="Restore Resident to Active Status"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800 dark:text-white">{(page - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-slate-800 dark:text-white">
                {Math.min(page * pageSize, archivedData.total)}
              </strong>{" "}
              of <strong className="text-slate-800 dark:text-white">{archivedData.total}</strong> archived residents
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2.5 text-xs font-bold cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
                Page {page} of {archivedData.total_pages || 1}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(archivedData.total_pages || 1, p + 1))}
                disabled={page >= (archivedData.total_pages || 1)}
                className="h-8 px-2.5 text-xs font-bold cursor-pointer disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Dossier Modal */}
      {selectedDossierTenantId && (
        <ArchivedTenantDossierModal
          tenantId={selectedDossierTenantId}
          isOpen={true}
          onClose={() => setSelectedDossierTenantId(null)}
          onRestoreTrigger={(dossier) => {
            setSelectedDossierTenantId(null);
            // Construct tenant item for restore dialog
            const item: ArchivedTenantItem = {
              id: dossier.tenant.id,
              tenant_id: dossier.tenant.tenant_id,
              full_name: dossier.tenant.full_name,
              phone: dossier.tenant.phone,
              email: dossier.tenant.email,
              photo_url: dossier.tenant.photo_url,
              status: dossier.tenant.status,
              original_status: dossier.tenant.original_status,
              archived_at: dossier.tenant.archived_at,
              archived_by: dossier.tenant.archived_by,
              archived_by_name: dossier.tenant.archived_by_name,
              archive_reason: dossier.tenant.archive_reason,
              last_hostel_name: dossier.room_history[0]?.hostel_name || null,
              last_room_number: dossier.room_history[0]?.room_number || null,
              last_bed_number: dossier.room_history[0]?.bed_number || null,
              created_at: dossier.tenant.created_at || ""
            };
            setSelectedRestoreTenant(item);
          }}
        />
      )}

      {/* 6. Restore Resident Dialog */}
      {selectedRestoreTenant && (
        <RestoreTenantDialog
          isOpen={true}
          onClose={() => setSelectedRestoreTenant(null)}
          tenant={selectedRestoreTenant}
          onSuccess={() => {
            setSelectedRestoreTenant(null);
            refetch();
          }}
        />
      )}
    </motion.div>
  );
};

export default ArchivedTenantsPage;
