import React, { useState } from "react";
import { useMaintenanceStore } from "../store/useMaintenanceStore";
import { useMaintenanceStaff, useMaintenanceMutations } from "../hooks/api/useMaintenance";
import { MaintenanceTable } from "../components/MaintenanceTable";
import { MaintenanceCard } from "../components/MaintenanceCard";
import { MaintenanceStaffForm } from "../components/MaintenanceStaffForm";
import { Button } from "@bhagirathi/ui";
import {
  Users, Search, Plus, Grid, List as ListIcon, ShieldAlert,
  RotateCcw, RefreshCw, Briefcase, Building
} from "lucide-react";

export const MaintenanceManagementPage: React.FC = () => {
  const {
    activeViewMode,
    searchQuery,
    setActiveViewMode,
    setSearchQuery
  } = useMaintenanceStore();

  const { data: staffList, isLoading, isError, refetch } = useMaintenanceStaff();
  const { createStaff, updateStaff, deleteStaff } = useMaintenanceMutations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const handleEdit = (staff: any) => {
    setEditItem(staff);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member and deactivate their login?")) {
      deleteStaff.mutate(id);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editItem) {
        await updateStaff.mutateAsync({ id: editItem.id, data });
      } else {
        await createStaff.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch (err) {
      alert("An error occurred. Please verify your fields.");
    }
  };

  const filteredStaff = staffList?.filter(staff => {
    const q = searchQuery.toLowerCase();
    return (
      (staff.full_name || "").toLowerCase().includes(q) ||
      (staff.email || "").toLowerCase().includes(q) ||
      (staff.staff_id || "").toLowerCase().includes(q) ||
      (staff.phone || "").toLowerCase().includes(q) ||
      (staff.department || "").toLowerCase().includes(q)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-16 rounded-card bg-white dark:bg-gray-900 border border-border dark:border-gray-800" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-28 rounded-card bg-white dark:bg-gray-900 border border-border" />
          <div className="h-28 rounded-card bg-white dark:bg-gray-900 border border-border" />
          <div className="h-28 rounded-card bg-white dark:bg-gray-900 border border-border" />
        </div>
        <div className="h-64 rounded-card bg-white dark:bg-gray-900 border border-border" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 border border-border rounded-card">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Failed to Load Maintenance Staff</h3>
        <p className="text-xs text-secondaryText mt-1">Please verify connection parameters or database health.</p>
        <Button onClick={() => refetch()} className="mt-4 font-bold inline-flex items-center gap-1.5 cursor-pointer">
          <RotateCcw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-sm">
        <div className="flex items-center gap-3 select-none">
          <div className="h-11 w-11 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Maintenance Staff</h2>
            <p className="text-xxs text-secondaryText dark:text-gray-400 font-semibold mt-0.5">Bhagirathi Hostel & PG Management Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditItem(null);
              setIsFormOpen(true);
            }}
            className="font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
          <Button
            variant="secondary"
            onClick={() => refetch()}
            className="p-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-955/20 text-red-500 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-450 uppercase font-black tracking-wider block">Total Staff</span>
            <span className="text-xl font-black text-gray-900 dark:text-white block mt-0.5">{staffList?.length || 0}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-955/20 text-orange-500 flex items-center justify-center shrink-0">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-455 uppercase font-black tracking-wider block">Active Departments</span>
            <span className="text-xl font-black text-gray-900 dark:text-white block mt-0.5">
              {new Set(staffList?.map(s => s.department)).size}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-955/20 text-green-500 flex items-center justify-center shrink-0">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-455 uppercase font-black tracking-wider block">Duty Assignees</span>
            <span className="text-xl font-black text-gray-900 dark:text-white block mt-0.5">
              {staffList?.filter(s => s.status === "ACTIVE").length || 0} Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-450 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 border border-border dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-red-500 transition-colors shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-end sm:self-auto select-none border border-border/10">
          <button
            onClick={() => setActiveViewMode("list")}
            className={`p-1.5 rounded-md transition ${
              activeViewMode === "list"
                ? "bg-white dark:bg-gray-900 text-red-650 dark:text-red-400 shadow-sm"
                : "text-gray-400 hover:text-gray-650"
            }`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActiveViewMode("grid")}
            className={`p-1.5 rounded-md transition ${
              activeViewMode === "grid"
                ? "bg-white dark:bg-gray-900 text-red-650 dark:text-red-400 shadow-sm"
                : "text-gray-400 hover:text-gray-650"
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeViewMode === "list" ? (
        <MaintenanceTable
          staffList={filteredStaff}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full py-12 text-center text-secondaryText dark:text-gray-400 border border-dashed border-border dark:border-gray-800 rounded-card font-semibold text-xs">
              No staff members match the query filters.
            </div>
          ) : (
            filteredStaff.map((staff) => (
              <MaintenanceCard
                key={staff.id}
                staff={staff}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      <MaintenanceStaffForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editItem}
        isLoading={createStaff.isPending || updateStaff.isPending}
      />
    </div>
  );
};

export default MaintenanceManagementPage;
