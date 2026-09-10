import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Notice, NoticeDashboardStats, NoticeReadStatistics, Hostel, Tenant } from "@bhagirathi/types";

export const useNotices = (filters: {
  statusFilter?: string;
  priorityFilter?: string;
  searchQuery?: string;
}) => {
  return useQuery<Notice[]>({
    queryKey: ["notices", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.statusFilter && filters.statusFilter !== "ALL") {
        params.status = filters.statusFilter;
      }
      if (filters.priorityFilter && filters.priorityFilter !== "ALL") {
        params.priority = filters.priorityFilter;
      }
      if (filters.searchQuery) {
        params.search = filters.searchQuery;
      }
      const response = await apiClient.get("/api/v1/notices", { params });
      return response.data;
    }
  });
};

export const useNoticeDetails = (id?: string | null) => {
  return useQuery<Notice>({
    queryKey: ["notice", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/notices/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useNoticeDashboard = () => {
  return useQuery<NoticeDashboardStats>({
    queryKey: ["notices-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/notices/dashboard");
      return response.data;
    }
  });
};

export const useNoticeReadStatistics = (id?: string | null) => {
  return useQuery<NoticeReadStatistics>({
    queryKey: ["notice-read-stats", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/notices/read-statistics/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useNoticeHostels = () => {
  return useQuery<Hostel[]>({
    queryKey: ["notice-hostels"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/hostels");
      return response.data;
    }
  });
};

export const useNoticeTenants = () => {
  return useQuery<Tenant[]>({
    queryKey: ["notice-tenants"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenants");
      return response.data;
    }
  });
};

export const useNoticeMutations = () => {
  const queryClient = useQueryClient();

  const createNotice = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/notices", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices-dashboard"] });
    }
  });

  const updateNotice = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/notices/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["notice-read-stats", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["notices-dashboard"] });
    }
  });

  const deleteNotice = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/notices/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices-dashboard"] });
    }
  });

  const publishNotice = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/notices/${id}/publish`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", id] });
      queryClient.invalidateQueries({ queryKey: ["notice-read-stats", id] });
      queryClient.invalidateQueries({ queryKey: ["notices-dashboard"] });
    }
  });

  const archiveNotice = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/notices/${id}/archive`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notice", id] });
      queryClient.invalidateQueries({ queryKey: ["notice-read-stats", id] });
      queryClient.invalidateQueries({ queryKey: ["notices-dashboard"] });
    }
  });

  const duplicateNotice = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/notices/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["notices-dashboard"] });
    }
  });

  return {
    createNotice,
    updateNotice,
    deleteNotice,
    publishNotice,
    archiveNotice,
    duplicateNotice
  };
};
