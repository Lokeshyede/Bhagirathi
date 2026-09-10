import { create } from "zustand";
import type { ReportFilters, ReportTab } from "../types";

// ─── Filter Store State ───────────────────────────────────────────────────────
interface ReportFilterStore {
  // Active report tab
  activeTab: ReportTab;
  setActiveTab: (tab: ReportTab) => void;

  // Global filters
  filters: ReportFilters;
  setFilters: (partial: Partial<ReportFilters>) => void;
  resetFilters: () => void;

  // Filter panel visibility
  isFilterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  toggleFilter: () => void;

  // Chart options
  chartType: "area" | "bar" | "line";
  setChartType: (type: "area" | "bar" | "line") => void;
}

const defaultFilters: ReportFilters = {
  page: 1,
  page_size: 50,
  sort_dir: "asc",
};

export const useReportFilterStore = create<ReportFilterStore>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) =>
    set({ activeTab: tab, filters: { ...defaultFilters } }),

  filters: { ...defaultFilters },
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial, page: 1 } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  isFilterOpen: false,
  setFilterOpen: (open) => set({ isFilterOpen: open }),
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),

  chartType: "area",
  setChartType: (type) => set({ chartType: type }),
}));
