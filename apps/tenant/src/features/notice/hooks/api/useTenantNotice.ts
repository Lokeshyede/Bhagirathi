import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Notice } from "@bhagirathi/types";

export const useTenantNotices = (filters: {
  priorityFilter?: string;
  searchQuery?: string;
}) => {
  return useQuery<Notice[]>({
    queryKey: ["tenant-notices", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.priorityFilter && filters.priorityFilter !== "ALL") {
        params.priority_filter = filters.priorityFilter;
      }
      if (filters.searchQuery) {
        params.search_query = filters.searchQuery;
      }
      const response = await apiClient.get("/api/v1/notices", { params });
      return response.data;
    }
  });
};

export const useTenantNoticeDetails = (id?: string | null) => {
  return useQuery<Notice>({
    queryKey: ["tenant-notice", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/notices/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useMarkNoticeReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/notices/${id}/mark-read`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-notices"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-notice", id] });
    }
  });
};
