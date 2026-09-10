import { create } from "zustand";

interface NotificationFiltersState {
  statusFilter: string;
  searchQuery: string;
  page: number;
  limit: number;
}

interface NotificationStore {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  filters: NotificationFiltersState;
  setFilters: (filters: Partial<NotificationFiltersState>) => void;
  resetFilters: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  filters: {
    statusFilter: "ALL",
    searchQuery: "",
    page: 1,
    limit: 10,
  },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () =>
    set({
      filters: {
        statusFilter: "ALL",
        searchQuery: "",
        page: 1,
        limit: 10,
      },
    }),
}));
