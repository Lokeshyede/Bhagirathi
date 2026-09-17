import { create } from "zustand";

interface DashboardUIState {
  dateRange: string;
  hostelId: string;
  buildingId: string;
  roomId: string;
  search: string;
  status: string;
  setDateRange: (range: string) => void;
  setHostelId: (id: string) => void;
  setBuildingId: (id: string) => void;
  setRoomId: (id: string) => void;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardUIState>((set) => ({
  dateRange: "30d",
  hostelId: "",
  buildingId: "",
  roomId: "",
  search: "",
  status: "",
  setDateRange: (dateRange) => set({ dateRange }),
  setHostelId: (hostelId) => set({ hostelId, buildingId: "", roomId: "" }), // Reset building and room when hostel changes
  setBuildingId: (buildingId) => set({ buildingId, roomId: "" }), // Reset room when building changes
  setRoomId: (roomId) => set({ roomId }),
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  resetFilters: () =>
    set({
      dateRange: "30d",
      hostelId: "",
      buildingId: "",
      roomId: "",
      search: "",
      status: "",
    }),
}));
