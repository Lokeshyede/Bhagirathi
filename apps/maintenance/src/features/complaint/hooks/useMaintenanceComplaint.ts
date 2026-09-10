import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Complaint, ComplaintHistoryItem } from "@bhagirathi/types";

export const useAssignedComplaints = (filters: {
  statusFilter?: string;
  priorityFilter?: string;
  searchQuery?: string;
}) => {
  return useQuery<Complaint[]>({
    queryKey: ["assigned-complaints", filters],
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

export const useUpdateStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      remarks,
      resolutionNotes
    }: {
      id: string;
      status: string;
      remarks?: string;
      resolutionNotes?: string;
    }) => {
      const response = await apiClient.post(`/api/v1/complaints/${id}/status`, {
        status,
        remarks,
        resolution_notes: resolutionNotes
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assigned-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["complaint-history", variables.id] });
    }
  });
};

export const useUploadWorkPhotos = () => {
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

export interface MaintenanceDashboardStats {
  assigned_tasks_count?: number;
  pending_tasks_count?: number;
  completed_today_count?: number;
  high_priority_count?: number;
  completion_percentage?: number;
  recent_activity?: Array<{
    id: string;
    complaint_id: string;
    complaint_number: string;
    complaint_title: string;
    status: string;
    remarks: string | null;
    action_at: string;
  }>;
  my_assigned_tasks?: number;
  open?: number;
  resolved?: number;
  total_complaints?: number;
  closed?: number;
  staff_count?: number;
}

export const useMaintenanceDashboardStats = () => {
  return useQuery<MaintenanceDashboardStats>({
    queryKey: ["maintenance-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/maintenance/dashboard");
      return response.data;
    }
  });
};

