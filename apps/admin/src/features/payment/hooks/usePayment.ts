import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Payment, PaymentDashboardStats, PaymentHistoryItem, PaymentReceiptDetails } from "@bhagirathi/types";

export const usePayments = (filters: {
  statusFilter?: string;
  tenantId?: string | null;
  searchQuery?: string;
}) => {
  return useQuery<Payment[]>({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.statusFilter && filters.statusFilter !== "ALL") {
        params.status_filter = filters.statusFilter;
      }
      if (filters.tenantId) {
        params.tenant_id = filters.tenantId;
      }
      if (filters.searchQuery) {
        params.search_query = filters.searchQuery;
      }
      const response = await apiClient.get("/api/v1/payments", { params });
      return response.data;
    }
  });
};

export const usePaymentDetails = (id?: string | null) => {
  return useQuery<Payment>({
    queryKey: ["payment", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/payments/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const usePaymentAuditHistory = (id?: string | null) => {
  return useQuery<PaymentHistoryItem[]>({
    queryKey: ["payment-audit", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/payments/${id}/history`);
      return response.data;
    },
    enabled: !!id
  });
};

export const usePaymentReceipt = (id?: string | null) => {
  return useQuery<PaymentReceiptDetails>({
    queryKey: ["payment-receipt", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/payments/receipt/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const usePaymentDashboard = () => {
  return useQuery<PaymentDashboardStats>({
    queryKey: ["payments-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/dashboard");
      return response.data;
    }
  });
};

export const usePaymentMutations = () => {
  const queryClient = useQueryClient();

  const verifyPayment = useMutation({
    mutationFn: async ({ id, remarks, verifiedAmount }: { id: string; remarks?: string; verifiedAmount?: number }) => {
      const response = await apiClient.post(`/api/v1/payments/${id}/verify`, {
        remarks,
        verified_amount: verifiedAmount
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payments-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payment-audit", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payment-receipt", variables.id] });
      // Rent views refresh
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rent-collection"] });
      queryClient.invalidateQueries({ queryKey: ["rent-collection-summary"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-today"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-current-obligation"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payment-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks: string }) => {
      const response = await apiClient.post(`/api/v1/payments/${id}/reject`, { remarks });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["payments-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payment-audit", variables.id] });
      // Rent views refresh on rejection too (outstanding reappears)
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rent-collection"] });
      queryClient.invalidateQueries({ queryKey: ["rent-collection-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-current-obligation"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });

  return { verifyPayment, rejectPayment };
};
