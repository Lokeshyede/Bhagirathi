import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import {
  DashboardSummaryData,
  DashboardStatisticsData,
  DashboardChartsData,
  RecentPaymentData,
  RecentComplaintData,
  RecentNoticeData,
  ActivityLogData
} from "../../types";

export interface DashboardFilters {
  dateRange: string;
  hostelId?: string;
  buildingId?: string;
  status?: string;
}

export const useDashboardSummary = (filters: DashboardFilters) => {
  return useQuery<DashboardSummaryData>({
    queryKey: ["dashboard", "summary", filters.dateRange, filters.hostelId, filters.buildingId, filters.status],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/summary", {
        params: {
          date_range: filters.dateRange || undefined,
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined,
          status: filters.status || undefined
        }
      });
      return response.data;
    }
  });
};

export const useDashboardStatistics = (filters: DashboardFilters) => {
  return useQuery<DashboardStatisticsData>({
    queryKey: ["dashboard", "summary", filters.dateRange, filters.hostelId, filters.buildingId, filters.status],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/summary", {
        params: {
          date_range: filters.dateRange || undefined,
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined,
          status: filters.status || undefined
        }
      });
      return response.data;
    },
    select: (data: any) => (data?.statistics ?? {}) as DashboardStatisticsData
  });
};

export const useDashboardCharts = (filters: { dateRange: string; hostelId?: string; buildingId?: string }) => {
  return useQuery<DashboardChartsData>({
    queryKey: ["dashboard", "charts", filters.dateRange, filters.hostelId, filters.buildingId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/charts", {
        params: {
          date_range: filters.dateRange || undefined,
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined
        }
      });
      return response.data;
    }
  });
};

export const useRecentPayments = (filters: DashboardFilters) => {
  return useQuery<RecentPaymentData[]>({
    queryKey: ["dashboard", "summary", filters.dateRange, filters.hostelId, filters.buildingId, filters.status],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/summary", {
        params: {
          date_range: filters.dateRange || undefined,
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined,
          status: filters.status || undefined
        }
      });
      return response.data;
    },
    select: (data: any) => (data?.recent_payments ?? []) as RecentPaymentData[]
  });
};

export const useRecentComplaints = (filters: DashboardFilters) => {
  return useQuery<RecentComplaintData[]>({
    queryKey: ["dashboard", "summary", filters.dateRange, filters.hostelId, filters.buildingId, filters.status],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/summary", {
        params: {
          date_range: filters.dateRange || undefined,
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined,
          status: filters.status || undefined
        }
      });
      return response.data;
    },
    select: (data: any) => (data?.recent_complaints ?? []) as RecentComplaintData[]
  });
};

export const useRecentNotices = (filters: DashboardFilters) => {
  return useQuery<RecentNoticeData[]>({
    queryKey: ["dashboard", "summary", filters.dateRange, filters.hostelId, filters.buildingId, filters.status],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/summary", {
        params: {
          date_range: filters.dateRange || undefined,
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined,
          status: filters.status || undefined
        }
      });
      return response.data;
    },
    select: (data: any) => (data?.recent_notices ?? []) as RecentNoticeData[]
  });
};

export const useActivityLog = () => {
  return useQuery<ActivityLogData[]>({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/activities", {
        params: { limit: 10 }
      });
      return response.data;
    }
  });
};

export const useDashboardOccupancy = (filters: { hostelId?: string; buildingId?: string; status?: string }) => {
  return useQuery<any>({
    queryKey: ["dashboard", "occupancy", filters.hostelId, filters.buildingId, filters.status],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/dashboard/occupancy", {
        params: {
          hostel_id: filters.hostelId || undefined,
          building_id: filters.buildingId || undefined,
          status: filters.status || undefined
        }
      });
      return response.data;
    }
  });
};
