import { create } from "zustand";

interface DashboardUIState {
  dateRange: string;
  hostelId: string;
  buildingId: string;
  status: string;
  setDateRange: (range: string) => void;
  setHostelId: (id: string) => void;
  setBuildingId: (id: string) => void;
  setStatus: (status: string) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardUIState>((set) => ({
  dateRange: "30d",
  hostelId: "",
  buildingId: "",
  status: "",
  setDateRange: (dateRange) => set({ dateRange }),
  setHostelId: (hostelId) => set({ hostelId, buildingId: "" }), // Reset building when hostel changes
  setBuildingId: (buildingId) => set({ buildingId }),
  setStatus: (status) => set({ status }),
  resetFilters: () => set({ dateRange: "30d", hostelId: "", buildingId: "", status: "" }),
}));
