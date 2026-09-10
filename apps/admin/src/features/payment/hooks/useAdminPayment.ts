import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

export interface AdminPaymentFilters {
  search?: string;
  hostel_id?: string;
  building_id?: string;
  room_id?: string;
  billing_month?: string;
  status?: string;
  submission_date?: string;
}

export const useAdminPayments = (filters: AdminPaymentFilters) => {
  return useQuery<any>({
    queryKey: ["admin-payments", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.hostel_id && filters.hostel_id !== "ALL") params.hostel_id = filters.hostel_id;
      if (filters.building_id && filters.building_id !== "ALL") params.building_id = filters.building_id;
      if (filters.room_id && filters.room_id !== "ALL") params.room_id = filters.room_id;
      if (filters.billing_month) params.billing_month = filters.billing_month;
      if (filters.status && filters.status !== "ALL") params.status = filters.status;
      if (filters.submission_date) params.submission_date = filters.submission_date;

      const response = await apiClient.get("/api/v1/admin/payments", { params });
      return response.data;
    }
  });
};

export const usePaymentSubmissions = (filters?: { status?: string; hostel_id?: string; building_id?: string; room_id?: string }) => {
  return useQuery<any[]>({
    queryKey: ["payment-submissions", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters?.status && filters.status !== "ALL") params.status = filters.status;
      if (filters?.hostel_id && filters.hostel_id !== "ALL") params.hostel_id = filters.hostel_id;
      if (filters?.building_id && filters.building_id !== "ALL") params.building_id = filters.building_id;
      if (filters?.room_id && filters.room_id !== "ALL") params.room_id = filters.room_id;

      const response = await apiClient.get("/api/v1/payments/submissions", { params });
      return response.data;
    },
    staleTime: 15_000,
  });
};

export const useAdminPaymentDetails = (paymentId?: string | null) => {
  return useQuery<any>({
    queryKey: ["admin-payment-details", paymentId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/admin/payments/${paymentId}`);
      return response.data;
    },
    enabled: !!paymentId
  });
};

export const useApprovePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await apiClient.patch(`/api/v1/admin/payments/${paymentId}/approve`);
      return response.data;
    },
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-details", paymentId] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-timeline", paymentId] });
    }
  });
};

export const useRejectPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, reason, remarks }: { paymentId: string; reason: string; remarks?: string }) => {
      const response = await apiClient.patch(`/api/v1/admin/payments/${paymentId}/reject`, {
        reason,
        remarks
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-details", variables.paymentId] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-timeline", variables.paymentId] });
    }
  });
};

export const useRequestClarification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, reason, message }: { paymentId: string; reason: string; message: string }) => {
      const response = await apiClient.patch(`/api/v1/admin/payments/${paymentId}/clarification`, {
        reason,
        message
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-details", variables.paymentId] });
      queryClient.invalidateQueries({ queryKey: ["admin-payment-timeline", variables.paymentId] });
    }
  });
};

export const usePaymentTimeline = (paymentId?: string | null) => {
  return useQuery<any[]>({
    queryKey: ["admin-payment-timeline", paymentId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/admin/payments/timeline/${paymentId}`);
      return response.data;
    },
    enabled: !!paymentId
  });
};
