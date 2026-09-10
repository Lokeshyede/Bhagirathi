import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Complaint, ComplaintDashboardStats, ComplaintHistoryItem, User } from "@bhagirathi/types";

export const useComplaints = (filters: {
  statusFilter?: string;
  priorityFilter?: string;
  categoryFilter?: string;
  tenantId?: string | null;
  searchQuery?: string;
}) => {
  return useQuery<Complaint[]>({
    queryKey: ["complaints", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.statusFilter && filters.statusFilter !== "ALL") {
        params.status = filters.statusFilter;
      }
      if (filters.priorityFilter && filters.priorityFilter !== "ALL") {
        params.priority = filters.priorityFilter;
      }
      if (filters.categoryFilter && filters.categoryFilter !== "ALL") {
        params.category = filters.categoryFilter;
      }
      if (filters.tenantId) {
        params.tenant_id = filters.tenantId;
      }
      if (filters.searchQuery) {
        params.search = filters.searchQuery;
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

export const useComplaintDashboard = () => {
  return useQuery<ComplaintDashboardStats>({
    queryKey: ["complaints-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/complaints/dashboard");
      return response.data;
    }
  });
};

export const useMaintenanceStaff = () => {
  return useQuery<User[]>({
    queryKey: ["maintenance-staff"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/auth/maintenance-staff");
      return response.data;
    }
  });
};

export const useComplaintMutations = () => {
  const queryClient = useQueryClient();

  const assignComplaint = useMutation({
    mutationFn: async ({ id, maintenanceId }: { id: string; maintenanceId: string }) => {
      const response = await apiClient.post(`/api/v1/complaints/${id}/assign`, {
        maintenance_staff_id: maintenanceId
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["complaints-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-history", variables.id] });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      remarks,
      resolutionNotes
    }: {
      id: string;
      status: string;
      notes?: string;
      remarks?: string;
      resolutionNotes?: string;
    }) => {
      const response = await apiClient.post(`/api/v1/complaints/${id}/status`, {
        status,
        notes: notes || remarks || resolutionNotes || "Status updated.",
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["complaints-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-history", variables.id] });
    }
  });

  const deleteComplaint = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/complaints/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaints-dashboard"] });
    }
  });

  return { assignComplaint, updateStatus, deleteComplaint };
};
