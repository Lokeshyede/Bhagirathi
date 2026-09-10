import { create } from "zustand";

interface NoticeState {
  selectedNoticeId: string | null;
  searchQuery: string;
  filterStatus: string;
  filterPriority: string;
  isFormOpen: boolean;
  formMode: "create" | "edit";
  activeEditId: string | null;

  setSelectedNoticeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterPriority: (priority: string) => void;
  setFormOpen: (open: boolean, mode?: "create" | "edit", id?: string | null) => void;
  resetSelection: () => void;
}

export const useNoticeStore = create<NoticeState>((set) => ({
  selectedNoticeId: null,
  searchQuery: "",
  filterStatus: "ALL",
  filterPriority: "ALL",
  isFormOpen: false,
  formMode: "create",
  activeEditId: null,

  setSelectedNoticeId: (id) => set({ selectedNoticeId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFormOpen: (open, mode = "create", id = null) => set({
    isFormOpen: open,
    formMode: mode,
    activeEditId: id
  }),
  resetSelection: () => set({
    selectedNoticeId: null,
    isFormOpen: false,
    activeEditId: null
  })
}));
