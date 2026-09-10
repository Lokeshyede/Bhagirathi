import { create } from "zustand";

interface ComplaintState {
  selectedComplaintId: string | null;
  searchQuery: string;
  filterStatus: string;
  filterPriority: string;
  filterCategory: string;
  isAssignDialogOpen: boolean;
  isStatusDialogOpen: boolean;

  setSelectedComplaintId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterPriority: (priority: string) => void;
  setFilterCategory: (category: string) => void;
  setAssignDialogOpen: (open: boolean) => void;
  setStatusDialogOpen: (open: boolean) => void;
  resetSelection: () => void;
}

export const useComplaintStore = create<ComplaintState>((set) => ({
  selectedComplaintId: null,
  searchQuery: "",
  filterStatus: "ALL",
  filterPriority: "ALL",
  filterCategory: "ALL",
  isAssignDialogOpen: false,
  isStatusDialogOpen: false,

  setSelectedComplaintId: (id) => set({ selectedComplaintId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setAssignDialogOpen: (open) => set({ isAssignDialogOpen: open }),
  setStatusDialogOpen: (open) => set({ isStatusDialogOpen: open }),
  resetSelection: () => set({
    selectedComplaintId: null,
    isAssignDialogOpen: false,
    isStatusDialogOpen: false
  })
}));
