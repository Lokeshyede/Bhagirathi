import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Complaint, ComplaintHistoryItem, Tenant } from "@bhagirathi/types";

export const useMyProfile = () => {
  return useQuery<Tenant>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenants/profile/me");
      return response.data;
    }
  });
};

export const useMyComplaints = (filters: {
  statusFilter?: string;
  priorityFilter?: string;
  categoryFilter?: string;
  searchQuery?: string;
}) => {
  return useQuery<Complaint[]>({
    queryKey: ["my-complaints", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.statusFilter && filters.statusFilter !== "ALL") {
        params.status_filter = filters.statusFilter;
      }
      if (filters.priorityFilter && filters.priorityFilter !== "ALL") {
        params.priority_filter = filters.priorityFilter;
      }
      if (filters.categoryFilter && filters.categoryFilter !== "ALL") {
        params.category_filter = filters.categoryFilter;
      }
      if (filters.searchQuery) {
        params.search_query = filters.searchQuery;
      }
      const response = await apiClient.get("/api/v1/complaints", { params });
      return response.data;
    }
  });
};

export const useComplaintDetails = (id?: string | null) => {
  return useQuery<Complaint>({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/complaints/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useComplaintHistory = (id?: string | null) => {
  return useQuery<ComplaintHistoryItem[]>({
    queryKey: ["complaint-history", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/complaints/history/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useRaiseComplaintMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("/api/v1/complaints", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaints-dashboard"] });
    }
  });
};

export const useUploadAdditionalPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await apiClient.post(`/api/v1/complaints/${id}/upload-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["complaint-history", variables.id] });
    }
  });
};

export const useUpdateComplaintStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await apiClient.post(`/api/v1/complaints/${id}/status`, { status, notes });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["complaint-history", variables.id] });
    }
  });
};
