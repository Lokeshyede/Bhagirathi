import { create } from "zustand";

interface MaintenanceState {
  selectedStaffId: string | null;
  activeViewMode: "list" | "grid";
  searchQuery: string;
  setSelectedStaffId: (id: string | null) => void;
  setActiveViewMode: (mode: "list" | "grid") => void;
  setSearchQuery: (query: string) => void;
  resetSelection: () => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  selectedStaffId: null,
  activeViewMode: "list",
  searchQuery: "",
  setSelectedStaffId: (id) => set({ selectedStaffId: id }),
  setActiveViewMode: (mode) => set({ activeViewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetSelection: () => set({ selectedStaffId: null }),
}));
