import { create } from "zustand";

interface RentUIState {
  selectedRentId: string | null;
  activeViewMode: "table" | "card";
  searchQuery: string;
  filterStatus: string; // ALL, PENDING, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED
  filterMonth: number; // 0 for ALL, or 1-12
  filterYear: number; // 0 for ALL, or 2026...
  isFormOpen: boolean;
  isGenerateOpen: boolean;
  setSelectedRentId: (id: string | null) => void;
  setActiveViewMode: (mode: "table" | "card") => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterMonth: (month: number) => void;
  setFilterYear: (year: number) => void;
  setIsFormOpen: (open: boolean) => void;
  setIsGenerateOpen: (open: boolean) => void;
  resetSelection: () => void;
}

export const useRentStore = create<RentUIState>((set) => ({
  selectedRentId: null,
  activeViewMode: "table",
  searchQuery: "",
  filterStatus: "ALL",
  filterMonth: 0,
  filterYear: 0,
  isFormOpen: false,
  isGenerateOpen: false,
  setSelectedRentId: (id) => set({ selectedRentId: id }),
  setActiveViewMode: (mode) => set({ activeViewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterMonth: (month) => set({ filterMonth: month }),
  setFilterYear: (year) => set({ filterYear: year }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setIsGenerateOpen: (open) => set({ isGenerateOpen: open }),
  resetSelection: () => set({ selectedRentId: null, isFormOpen: false, isGenerateOpen: false }),
}));
