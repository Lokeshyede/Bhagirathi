import { create } from "zustand";

interface TenantUIState {
  selectedTenantId: string | null;
  activeViewMode: "table" | "card";
  searchQuery: string;
  filterStatus: string; // ALL, ACTIVE, INACTIVE, CHECKED_OUT
  isFormOpen: boolean;
  isCheckInOpen: boolean;
  isCheckOutOpen: boolean;
  setSelectedTenantId: (id: string | null) => void;
  setActiveViewMode: (mode: "table" | "card") => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setIsFormOpen: (open: boolean) => void;
  setIsCheckInOpen: (open: boolean) => void;
  setIsCheckOutOpen: (open: boolean) => void;
  resetSelection: () => void;
}

export const useTenantStore = create<TenantUIState>((set) => ({
  selectedTenantId: null,
  activeViewMode: "table",
  searchQuery: "",
  filterStatus: "ALL",
  isFormOpen: false,
  isCheckInOpen: false,
  isCheckOutOpen: false,
  setSelectedTenantId: (id) => set({ selectedTenantId: id }),
  setActiveViewMode: (mode) => set({ activeViewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setIsCheckInOpen: (open) => set({ isCheckInOpen: open }),
  setIsCheckOutOpen: (open) => set({ isCheckOutOpen: open }),
  resetSelection: () => set({ selectedTenantId: null, isFormOpen: false, isCheckInOpen: false, isCheckOutOpen: false }),
}));
