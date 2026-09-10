import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useHostels,
  useBuildings,
  useFloors,
  useRooms,
  useRoomsSummary,
  useHostelMutations,
  useBuildingMutations,
  useFloorMutations,
  useRoomMutations,
  useBedMutations,
} from "../hooks/api/useHostel";
import { useAllocations } from "../../tenant/hooks/api/useAllocation";
import { useActivityLog } from "../../dashboard/hooks/api/useDashboard";

// UI Components
import { RoomKpiCards } from "../components/RoomKpiCards";
import { RoomFilterBar, FilterState } from "../components/RoomFilterBar";
import { RoomsTable } from "../components/RoomsTable";
import { RoomsCardsView } from "../components/RoomsCardsView";
import { HierarchyTreeView } from "../components/HierarchyTreeView";

// Forms & Action Modals
import { HostelForm } from "../components/HostelForm";
import { BuildingForm } from "../components/BuildingForm";
import { FloorForm } from "../components/FloorForm";
import { RoomForm } from "../components/RoomForm";
import { BedForm } from "../components/BedForm";
import { DeleteDialog } from "../components/DeleteDialog";

// UI Framework & Icons
import { Button } from "@bhagirathi/ui";
import { parseApiError } from "@bhagirathi/utils";
import { Hostel, Building as BuildingType, Floor, Room } from "@bhagirathi/types";
import {
  Plus,
  AlertTriangle,
  Table2,
  LayoutGrid,
  Network,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export const HostelManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Queries (real PostgreSQL data via FastAPI)
  const {
    data: hostels,
    isLoading: isLoadingHostels,
    refetch: refetchHostels,
  } = useHostels();
  const {
    data: allRooms,
    isLoading: isLoadingRooms,
    isError: isErrorRooms,
    refetch: refetchRooms,
  } = useRooms();

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    hostelId: "",
    buildingId: "",
    floorId: "",
    status: "ALL",
    search: "",
  });

  // Dependent Buildings and Floors queries
  const {
    data: buildings,
    isLoading: isLoadingBuildings,
    refetch: refetchBuildings,
  } = useBuildings(filterState.hostelId || null);
  const {
    data: floors,
    isLoading: isLoadingFloors,
    refetch: refetchFloors,
  } = useFloors(filterState.buildingId || null);

  // Allocations for tenant search & bed status
  const { data: allocations } = useAllocations();
  const { refetch: refetchActivities } = useActivityLog();

  // View Mode: 'table', 'cards', or 'tree'
  const [viewMode, setViewMode] = useState<"table" | "cards" | "tree">("table");

  // Selection state
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string>("room_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8; // Exactly 8 items per page matching reference layout

  // Modals & Action States
  // 1. PG/Hostel
  const [isHostelFormOpen, setIsHostelFormOpen] = useState(false);
  const [editHostelItem, setEditHostelItem] = useState<Hostel | null>(null);

  // 2. Building
  const [isBuildingFormOpen, setIsBuildingFormOpen] = useState(false);
  const [editBuildingItem, setEditBuildingItem] = useState<BuildingType | null>(null);
  const [targetHostelForBuilding, setTargetHostelForBuilding] = useState<Hostel | null>(null);

  // 3. Floor
  const [isFloorFormOpen, setIsFloorFormOpen] = useState(false);
  const [editFloorItem, setEditFloorItem] = useState<Floor | null>(null);
  const [targetBuildingForFloor, setTargetBuildingForFloor] = useState<BuildingType | null>(null);

  // 4. Room
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editRoomItem, setEditRoomItem] = useState<Room | null>(null);
  const [targetFloorForRoom, setTargetFloorForRoom] = useState<Floor | null>(null);

  // 5. Bed
  const [isBedFormOpen, setIsBedFormOpen] = useState(false);
  const [activeRoomForBed, setActiveRoomForBed] = useState<Room | null>(null);

  // 6. Unified Safe Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "hostel" | "building" | "floor" | "room" | "bed";
    id: string;
    name: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Mutations
  const { createHostel, updateHostel, deleteHostel } = useHostelMutations();
  const { createBuilding, updateBuilding, deleteBuilding } = useBuildingMutations();
  const { createFloor, updateFloor, deleteFloor } = useFloorMutations();
  const { createRoom, updateRoom, deleteRoom } = useRoomMutations();
  const { createBed, deleteBed } = useBedMutations();

  // Handle URL action parameters (e.g., ?action=add-room)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "add-room") {
      setEditRoomItem(null);
      setIsRoomFormOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete("action");
      setSearchParams(params, { replace: true });
    } else if (action === "add-pg" || action === "add-hostel") {
      setEditHostelItem(null);
      setIsHostelFormOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete("action");
      setSearchParams(params, { replace: true });
    } else if (action === "add-building") {
      setEditBuildingItem(null);
      setIsBuildingFormOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete("action");
      setSearchParams(params, { replace: true });
    } else if (action === "add-floor") {
      setEditFloorItem(null);
      setIsFloorFormOpen(true);
      const params = new URLSearchParams(searchParams);
      params.delete("action");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Handle Filter Changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    setSelectedRoomIds([]);
  };

  const handleClearFilters = () => {
    setFilterState({
      hostelId: "",
      buildingId: "",
      floorId: "",
      status: "ALL",
      search: "",
    });
    setCurrentPage(1);
    setSelectedRoomIds([]);
  };

  // Authoritative KPI Summary Query
  const { data: summaryData, isLoading: isLoadingSummary } = useRoomsSummary({
    hostel_id: filterState.hostelId || null,
    building_id: filterState.buildingId || null,
    floor_id: filterState.floorId || null,
  });

  // KPI calculations based on authoritative backend summary
  const kpiStats = useMemo(() => {
    let label = "Across all hostels";

    if (filterState.hostelId) {
      const selectedH = hostels?.find((h) => h.id === filterState.hostelId);
      label = selectedH ? `In ${selectedH.name}` : "In selected hostel";
    }
    if (filterState.buildingId) {
      const selectedB = buildings?.find((b) => b.id === filterState.buildingId);
      label = selectedB ? `In ${selectedB.name}` : "In selected building";
    }
    if (filterState.floorId) {
      const selectedF = floors?.find((f) => f.id === filterState.floorId);
      label = selectedF ? `On ${selectedF.name}` : "On selected floor";
    }

    return {
      totalRooms: summaryData?.total_rooms ?? 0,
      totalBeds: summaryData?.total_beds ?? 0,
      occupiedBeds: summaryData?.occupied_beds ?? 0,
      availableBeds: summaryData?.available_beds ?? 0,
      maintenanceRooms: summaryData?.maintenance_rooms ?? 0,
      scopeLabel: label,
    };
  }, [summaryData, filterState.hostelId, filterState.buildingId, filterState.floorId, hostels, buildings, floors]);

  // Filtered & Sorted Rooms List
  const filteredRooms = useMemo(() => {
    if (!allRooms) return [];

    return allRooms
      .filter((r) => {
        // Hostel filter
        if (filterState.hostelId && r.hostel_id !== filterState.hostelId) {
          return false;
        }

        // Building filter
        if (filterState.buildingId && r.building_id !== filterState.buildingId) {
          return false;
        }

        // Floor filter
        if (filterState.floorId && r.floor_id !== filterState.floorId) {
          return false;
        }

        // Status filter
        if (filterState.status && filterState.status !== "ALL") {
          const cap = r.capacity || 1;
          const occ = r.occupied_beds ?? 0;
          const isMaint = r.status === "MAINTENANCE";

          if (filterState.status === "AVAILABLE") {
            if (isMaint || occ > 0) return false;
          } else if (filterState.status === "OCCUPIED") {
            if (isMaint || occ < cap) return false;
          } else if (filterState.status === "PARTIAL") {
            if (isMaint || occ === 0 || occ >= cap) return false;
          } else if (filterState.status === "MAINTENANCE") {
            if (!isMaint) return false;
          }
        }

        // Search text matching
        if (filterState.search && filterState.search.trim()) {
          const q = filterState.search.toLowerCase().trim();
          const matchRoom = r.room_number.toLowerCase().includes(q);
          const matchBuilding = (r.building_name || "").toLowerCase().includes(q);
          const matchHostel = (r.hostel_name || "").toLowerCase().includes(q);
          const matchFloor = (r.floor_name || "").toLowerCase().includes(q);

          // Tenant matching from active allocations
          const roomAllocs = allocations?.filter((a) => a.room_id === r.id && a.status === "ACTIVE") || [];
          const matchTenant = roomAllocs.some((a) =>
            ((a as any).tenant_name || (a as any).tenant?.name || (a as any).tenant?.full_name || "")
              .toLowerCase()
              .includes(q)
          );

          if (!matchRoom && !matchBuilding && !matchHostel && !matchFloor && !matchTenant) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof Room] ?? "";
        let valB: any = b[sortField as keyof Room] ?? "";

        if (sortField === "room_number") {
          const numA = parseInt(a.room_number.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.room_number.replace(/\D/g, ""), 10) || 0;
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }

        if (sortField === "room_rent") {
          const rentA = Number(a.room_rent) || 0;
          const rentB = Number(b.room_rent) || 0;
          return sortDirection === "asc" ? rentA - rentB : rentB - rentA;
        }

        if (sortField === "hostel") {
          valA = a.hostel_name || "";
          valB = b.hostel_name || "";
        } else if (sortField === "building") {
          valA = a.building_name || "";
          valB = b.building_name || "";
        } else if (sortField === "floor") {
          valA = a.floor_name || "";
          valB = b.floor_name || "";
        }

        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [allRooms, filterState, allocations, sortField, sortDirection]);

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination calculation
  const totalItems = filteredRooms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  // Selection handlers
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRoomIds(filteredRooms.map((r) => r.id));
    } else {
      setSelectedRoomIds([]);
    }
  };

  const handleToggleSelectRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredRooms.length === 0) return;
    const headers = [
      "Room No.",
      "Hostel",
      "Building",
      "Floor",
      "Total Beds",
      "Occupied Beds",
      "Available Beds",
      "Status",
      "Rent",
    ];

    const rows = filteredRooms.map((r) => {
      const cap = r.capacity || 1;
      const occ = r.occupied_beds ?? 0;
      const avail = Math.max(0, cap - occ);
      let statusText = "AVAILABLE";
      if (r.status === "MAINTENANCE") statusText = "MAINTENANCE";
      else if (occ >= cap) statusText = "OCCUPIED";
      else if (occ > 0) statusText = "PARTIALLY OCCUPIED";

      return [
        r.room_number,
        r.hostel_name || "",
        r.building_name || "",
        r.floor_name || "",
        cap,
        occ,
        avail,
        statusText,
        r.room_rent || 0,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rooms_export_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CRUD SUBMISSION HANDLERS ---
  // 1. PG / Hostel Submit
  const handleHostelFormSubmit = async (formData: any) => {
    try {
      setGlobalError(null);
      if (editHostelItem) {
        await updateHostel.mutateAsync({ id: editHostelItem.id, data: formData });
      } else {
        await createHostel.mutateAsync(formData);
      }
      setIsHostelFormOpen(false);
      setEditHostelItem(null);
      refetchActivities();
      refetchHostels();
    } catch (err: any) {
      setGlobalError(parseApiError(err, "Failed to save PG/Hostel. Check unique constraints."));
    }
  };

  // 2. Building Submit
  const handleBuildingFormSubmit = async (formData: any) => {
    try {
      setGlobalError(null);
      if (editBuildingItem) {
        await updateBuilding.mutateAsync({ id: editBuildingItem.id, data: formData });
      } else {
        await createBuilding.mutateAsync(formData);
      }
      setIsBuildingFormOpen(false);
      setEditBuildingItem(null);
      setTargetHostelForBuilding(null);
      refetchActivities();
      refetchBuildings();
    } catch (err: any) {
      setGlobalError(parseApiError(err, "Failed to save building. Check duplicate name or code in this PG."));
    }
  };

  // 3. Floor Submit
  const handleFloorFormSubmit = async (formData: any) => {
    try {
      setGlobalError(null);
      if (editFloorItem) {
        await updateFloor.mutateAsync({ id: editFloorItem.id, data: formData });
      } else {
        await createFloor.mutateAsync(formData);
      }
      setIsFloorFormOpen(false);
      setEditFloorItem(null);
      setTargetBuildingForFloor(null);
      refetchActivities();
      refetchFloors();
    } catch (err: any) {
      setGlobalError(parseApiError(err, "Failed to save floor. Check duplicate floor number or name in this building."));
    }
  };

  // 4. Room Submit
  const handleRoomFormSubmit = async (formData: any) => {
    try {
      setGlobalError(null);
      if (editRoomItem) {
        await updateRoom.mutateAsync({ id: editRoomItem.id, data: formData });
      } else {
        await createRoom.mutateAsync(formData);
      }
      setIsRoomFormOpen(false);
      setEditRoomItem(null);
      setTargetFloorForRoom(null);
      refetchActivities();
      refetchRooms();
    } catch (err: any) {
      setGlobalError(parseApiError(err, "Failed to save room. Check constraints or duplicate room number on floor."));
    }
  };

  // 5. Bed Submit
  const handleBedFormSubmit = async (formData: any) => {
    try {
      setGlobalError(null);
      await createBed.mutateAsync(formData);
      setIsBedFormOpen(false);
      setActiveRoomForBed(null);
      refetchActivities();
      refetchRooms();
    } catch (err: any) {
      setGlobalError(parseApiError(err, "Failed to create bed."));
    }
  };

  // 6. Unified Safe Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteError(null);
      if (deleteTarget.type === "hostel") {
        await deleteHostel.mutateAsync(deleteTarget.id);
        if (filterState.hostelId === deleteTarget.id) {
          handleFilterChange({ hostelId: "", buildingId: "", floorId: "" });
        }
        refetchHostels();
      } else if (deleteTarget.type === "building") {
        await deleteBuilding.mutateAsync(deleteTarget.id);
        if (filterState.buildingId === deleteTarget.id) {
          handleFilterChange({ buildingId: "", floorId: "" });
        }
        refetchBuildings();
      } else if (deleteTarget.type === "floor") {
        await deleteFloor.mutateAsync(deleteTarget.id);
        if (filterState.floorId === deleteTarget.id) {
          handleFilterChange({ floorId: "" });
        }
        refetchFloors();
      } else if (deleteTarget.type === "room") {
        await deleteRoom.mutateAsync(deleteTarget.id);
      } else if (deleteTarget.type === "bed") {
        await deleteBed.mutateAsync(deleteTarget.id);
      }

      setDeleteTarget(null);
      refetchActivities();
      refetchRooms();
    } catch (err: any) {
      const msg = parseApiError(err, `Failed to delete ${deleteTarget.type}.`);
      setDeleteError(msg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-16 min-w-0"
    >
      {/* 1. Page Header with Breadcrumbs and All 4 Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none">
        <div>
          {/* Breadcrumb: PG & Rooms > Hierarchy */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
            <span>PG & Rooms</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Properties & Rooms</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            PG & Rooms Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your full property hierarchy: PG/Hostel → Building → Floor → Room → Bed
          </p>
        </div>

        {/* Action Buttons: [+ Add PG] [+ Add Building] [+ Add Floor] [+ Add Room] */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* + Add PG */}
          <button
            onClick={() => {
              setEditHostelItem(null);
              setIsHostelFormOpen(true);
            }}
            className="h-9 sm:h-10 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Add a new PG/Hostel"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add PG</span>
          </button>

          {/* + Add Building */}
          <button
            onClick={() => {
              setEditBuildingItem(null);
              setTargetHostelForBuilding(
                filterState.hostelId ? hostels?.find((h) => h.id === filterState.hostelId) || null : null
              );
              setIsBuildingFormOpen(true);
            }}
            className="h-9 sm:h-10 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Add Building under selected PG"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Building</span>
          </button>

          {/* + Add Floor */}
          <button
            onClick={() => {
              setEditFloorItem(null);
              setTargetBuildingForFloor(
                filterState.buildingId ? buildings?.find((b) => b.id === filterState.buildingId) || null : null
              );
              setIsFloorFormOpen(true);
            }}
            className="h-9 sm:h-10 px-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Add Floor under selected Building"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Floor</span>
          </button>

          {/* + Add Room (Bhagirathi red button) */}
          <button
            onClick={() => {
              setEditRoomItem(null);
              setTargetFloorForRoom(
                filterState.floorId ? floors?.find((f) => f.id === filterState.floorId) || null : null
              );
              setIsRoomFormOpen(true);
            }}
            className="h-9 sm:h-10 px-3 sm:px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Add Room under selected Floor"
          >
            <Plus className="h-4 w-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-3 text-xs text-red-700 dark:text-red-400 select-none">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{globalError}</div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-red-400 hover:text-red-600 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Summary KPI Cards (Row of 4) */}
      <RoomKpiCards
        stats={kpiStats}
        isLoading={isLoadingSummary || isLoadingRooms}
        onCardClick={(type) => {
          if (type === "maintenance") {
            handleFilterChange({ status: "MAINTENANCE" });
          } else if (type === "occupied") {
            handleFilterChange({ status: "OCCUPIED" });
          } else if (type === "available") {
            handleFilterChange({ status: "AVAILABLE" });
          } else if (type === "rooms") {
            handleFilterChange({ status: "ALL" });
          }
        }}
      />

      {/* 3. Filter Bar (Hostel, Building, Floor, Status, Search, Clear, Apply) */}
      <RoomFilterBar
        filters={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onApplyFilters={() => setCurrentPage(1)}
        hostels={hostels}
        buildings={buildings}
        floors={floors}
        isLoadingHierarchy={isLoadingHostels || isLoadingBuildings || isLoadingFloors}
        onEditHostel={(h) => {
          setEditHostelItem(h);
          setIsHostelFormOpen(true);
        }}
        onDeleteHostel={(h) => {
          setDeleteError(null);
          setDeleteTarget({ type: "hostel", id: h.id, name: h.name });
        }}
        onEditBuilding={(b) => {
          setEditBuildingItem(b);
          setIsBuildingFormOpen(true);
        }}
        onDeleteBuilding={(b) => {
          setDeleteError(null);
          setDeleteTarget({ type: "building", id: b.id, name: b.name });
        }}
        onEditFloor={(f) => {
          setEditFloorItem(f);
          setIsFloorFormOpen(true);
        }}
        onDeleteFloor={(f) => {
          setDeleteError(null);
          setDeleteTarget({ type: "floor", id: f.id, name: f.name });
        }}
      />

      {/* 4. Main Views: Table View / Card View / Hierarchy Tree View */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Card Header Strip */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {viewMode === "tree" ? "Hierarchy Structure" : `Rooms (${totalItems})`}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {viewMode === "tree"
                ? "Full visual structure of your Hostels, Buildings, Floors, Rooms, and Beds"
                : "View and manage all rooms in your hostel & PG properties"}
            </p>
          </div>

          {/* View Toggles & Export */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Toggle Table / Card / Tree View */}
            <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60">
              <button
                onClick={() => setViewMode("table")}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setViewMode("cards")}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>

              <button
                onClick={() => setViewMode("tree")}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "tree"
                    ? "bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                <span>Hierarchy Tree</span>
              </button>
            </div>

            {/* Export Button (for table/card views) */}
            {viewMode !== "tree" && (
              <button
                onClick={handleExportCSV}
                type="button"
                disabled={filteredRooms.length === 0}
                className="h-9 px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-gray-500" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode: Tree Mode */}
        {viewMode === "tree" ? (
          <div className="p-4 sm:p-5">
            <HierarchyTreeView
              hostels={hostels || []}
              buildings={buildings || []}
              floors={floors || []}
              rooms={allRooms || []}
              onAddBuilding={(h) => {
                setEditBuildingItem(null);
                setTargetHostelForBuilding(h);
                setIsBuildingFormOpen(true);
              }}
              onEditHostel={(h) => {
                setEditHostelItem(h);
                setIsHostelFormOpen(true);
              }}
              onDeleteHostel={(h) => {
                setDeleteError(null);
                setDeleteTarget({ type: "hostel", id: h.id, name: h.name });
              }}
              onAddFloor={(b) => {
                setEditFloorItem(null);
                setTargetBuildingForFloor(b);
                setIsFloorFormOpen(true);
              }}
              onEditBuilding={(b) => {
                setEditBuildingItem(b);
                setIsBuildingFormOpen(true);
              }}
              onDeleteBuilding={(b) => {
                setDeleteError(null);
                setDeleteTarget({ type: "building", id: b.id, name: b.name });
              }}
              onAddRoom={(f) => {
                setEditRoomItem(null);
                setTargetFloorForRoom(f);
                setIsRoomFormOpen(true);
              }}
              onEditFloor={(f) => {
                setEditFloorItem(f);
                setIsFloorFormOpen(true);
              }}
              onDeleteFloor={(f) => {
                setDeleteError(null);
                setDeleteTarget({ type: "floor", id: f.id, name: f.name });
              }}
              onAddBed={(r) => {
                setActiveRoomForBed(r);
                setIsBedFormOpen(true);
              }}
              onEditRoom={(r) => {
                setEditRoomItem(r);
                setIsRoomFormOpen(true);
              }}
              onDeleteRoom={(r) => {
                setDeleteError(null);
                setDeleteTarget({ type: "room", id: r.id, name: `Room ${r.room_number}` });
              }}
              onViewRoom={(r) => {
                navigate(`/rooms/${r.id}`);
              }}
            />
          </div>
        ) : (
          /* Card Body: Loading / Error / Empty / Table / Cards */
          <>
            {isLoadingRooms ? (
              <div className="p-12 text-center space-y-3">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-red-600 border-r-transparent" />
                <p className="text-xs font-semibold text-gray-500">Loading rooms from database...</p>
              </div>
            ) : isErrorRooms ? (
              <div className="p-12 text-center space-y-4 select-none">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Unable to load rooms</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    There was a problem communicating with the backend API.
                  </p>
                </div>
                <Button onClick={() => refetchRooms()} size="sm" variant="outline">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry
                </Button>
              </div>
            ) : totalItems === 0 ? (
              <div className="p-12 text-center select-none space-y-3">
                <FolderOpen className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {allRooms && allRooms.length > 0 ? "No rooms match your filters" : "No rooms found"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    {allRooms && allRooms.length > 0
                      ? "Try adjusting your search query, status, or property filters to see matching rooms."
                      : "No rooms have been added to the system yet. Click below to add your first room."}
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-2">
                  {allRooms && allRooms.length > 0 ? (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditRoomItem(null);
                        setIsRoomFormOpen(true);
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Add Room
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === "table" ? (
              <RoomsTable
                rooms={paginatedRooms}
                selectedRoomIds={selectedRoomIds}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleSelectRoom={handleToggleSelectRoom}
                onViewRoom={(room) => {
                  navigate(`/rooms/${room.id}`);
                }}
                onEditRoom={(room) => {
                  setEditRoomItem(room);
                  setIsRoomFormOpen(true);
                }}
                onAddBed={(room) => {
                  setActiveRoomForBed(room);
                  setIsBedFormOpen(true);
                }}
                onDeleteRoom={(room) => {
                  setDeleteError(null);
                  setDeleteTarget({ type: "room", id: room.id, name: `Room ${room.room_number}` });
                }}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            ) : (
              <RoomsCardsView
                rooms={paginatedRooms}
                onViewRoom={(room) => {
                  navigate(`/rooms/${room.id}`);
                }}
                onEditRoom={(room) => {
                  setEditRoomItem(room);
                  setIsRoomFormOpen(true);
                }}
                onAddBed={(room) => {
                  setActiveRoomForBed(room);
                  setIsBedFormOpen(true);
                }}
                onDeleteRoom={(room) => {
                  setDeleteError(null);
                  setDeleteTarget({ type: "room", id: room.id, name: `Room ${room.room_number}` });
                }}
              />
            )}

            {/* Card Footer: Pagination Controls matching reference */}
            {totalItems > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none text-xs text-gray-500 dark:text-gray-400">
                {/* Left: Showing 1 to 8 of 32 rooms */}
                <div>
                  Showing {startIndex + 1} to {endIndex} of {totalItems} rooms
                </div>

                {/* Right: << < 1 2 3 > >> */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 self-center sm:self-auto">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={validCurrentPage <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="First Page"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validCurrentPage <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* Page Number Pills */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        return p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 2;
                      })
                      .map((p, idx, arr) => {
                        const prevP = arr[idx - 1];
                        const showEllipsis = prevP && p - prevP > 1;

                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span className="px-1 text-gray-400">…</span>}
                            <button
                              onClick={() => setCurrentPage(p)}
                              className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                p === validCurrentPage
                                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 shadow-2xs"
                                  : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={validCurrentPage >= totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={validCurrentPage >= totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Last Page"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Modals & Drawers */}

      {/* 1. Add / Edit PG Modal */}
      {isHostelFormOpen && (
        <HostelForm
          isOpen={isHostelFormOpen}
          onClose={() => {
            setIsHostelFormOpen(false);
            setEditHostelItem(null);
          }}
          onSubmit={handleHostelFormSubmit}
          initialData={editHostelItem}
          isLoading={createHostel.isPending || updateHostel.isPending}
        />
      )}

      {/* 2. Add / Edit Building Modal */}
      {isBuildingFormOpen && (
        <BuildingForm
          isOpen={isBuildingFormOpen}
          onClose={() => {
            setIsBuildingFormOpen(false);
            setEditBuildingItem(null);
            setTargetHostelForBuilding(null);
          }}
          onSubmit={handleBuildingFormSubmit}
          hostelId={targetHostelForBuilding?.id || filterState.hostelId || ""}
          initialData={editBuildingItem}
          isLoading={createBuilding.isPending || updateBuilding.isPending}
        />
      )}

      {/* 3. Add / Edit Floor Modal */}
      {isFloorFormOpen && (
        <FloorForm
          isOpen={isFloorFormOpen}
          onClose={() => {
            setIsFloorFormOpen(false);
            setEditFloorItem(null);
            setTargetBuildingForFloor(null);
          }}
          onSubmit={handleFloorFormSubmit}
          buildingId={targetBuildingForFloor?.id || filterState.buildingId || ""}
          hostelId={targetBuildingForFloor?.hostel_id || filterState.hostelId || ""}
          initialData={editFloorItem}
          isLoading={createFloor.isPending || updateFloor.isPending}
        />
      )}

      {/* 4. Add / Edit Room Modal (Existing RoomForm) */}
      {isRoomFormOpen && (
        <RoomForm
          isOpen={isRoomFormOpen}
          onClose={() => {
            setIsRoomFormOpen(false);
            setEditRoomItem(null);
            setTargetFloorForRoom(null);
          }}
          onSubmit={handleRoomFormSubmit}
          floorId={editRoomItem?.floor_id || targetFloorForRoom?.id || filterState.floorId || ""}
          initialData={editRoomItem}
          isLoading={createRoom.isPending || updateRoom.isPending}
        />
      )}

      {/* 5. Add Bed Modal (Existing BedForm) */}
      {isBedFormOpen && activeRoomForBed && (
        <BedForm
          isOpen={isBedFormOpen}
          onClose={() => {
            setIsBedFormOpen(false);
            setActiveRoomForBed(null);
          }}
          onSubmit={handleBedFormSubmit}
          roomId={activeRoomForBed.id}
          isLoading={createBed.isPending}
        />
      )}

      {/* 6. Unified Safe Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteDialog
          isOpen={!!deleteTarget}
          onClose={() => {
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${
            deleteTarget.type === "hostel"
              ? "PG/Hostel"
              : deleteTarget.type === "building"
              ? "Building"
              : deleteTarget.type === "floor"
              ? "Floor"
              : deleteTarget.type === "room"
              ? "Room"
              : "Bed"
          } "${deleteTarget.name}"?`}
          message={
            deleteError ||
            `Are you sure you want to delete ${deleteTarget.name}? The system checks for active children or allocations and will safely block deletion if dependencies exist.`
          }
          isLoading={
            deleteHostel.isPending ||
            deleteBuilding.isPending ||
            deleteFloor.isPending ||
            deleteRoom.isPending ||
            deleteBed.isPending
          }
        />
      )}
    </motion.div>
  );
};

export default HostelManagementPage;
