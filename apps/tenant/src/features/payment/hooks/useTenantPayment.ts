import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Tenant, Rent, Payment, PaymentReceiptDetails, TenantRoomDetails, TenantDocument } from "@bhagirathi/types";

// ── Phase 8: Advance Payment Context types ───────────────────────────────────
export interface AdvancePaymentContext {
  eligible: boolean;
  reason: string | null;
  current_status: string;
  next_month: number | null;
  next_year: number | null;
  next_period_label: string | null;
  next_due_date: string | null;
  next_rent_amount: number;
  next_rent_id: string | null;
  next_paid_amount: number;
  next_outstanding: number;
  next_status: string;
}

export const useMyProfile = () => {
  return useQuery<Tenant>({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenants/profile/me");
      return response.data;
    }
  });
};

export const useMyRentLedger = (tenantId?: string) => {
  return useQuery<Rent[]>({
    queryKey: ["my-rent-ledger", tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/rents/ledger/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId
  });
};

export const useMyPaymentHistory = () => {
  return useQuery<Payment[]>({
    queryKey: ["tenant-payments-history"],
    queryFn: async () => {
      // ISSUE-010 fix: backend derives tenant from JWT — never pass tenantId in URL
      const response = await apiClient.get("/api/v1/payments/history");
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useCurrentBill = () => {
  return useQuery<any>({
    // Canonical key — matches useTenantCurrentBill in useTenantDashboard.ts
    queryKey: ["tenant-current-bill"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/current");
      return response.data;
    },
    staleTime: 15_000,
  });
};

export const useTenantReceipt = (paymentId?: string | null) => {
  return useQuery<PaymentReceiptDetails>({
    queryKey: ["tenant-payment-receipt", paymentId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/receipts/payment/${paymentId}`);
      return response.data;
    },
    enabled: !!paymentId
  });
};

export const usePayRentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("/api/v1/payments/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all bill and dashboard queries so every page reflects the
      // new payment state immediately without waiting for staleTime.
      queryClient.invalidateQueries({ queryKey: ["tenant-current-bill"] });
      queryClient.invalidateQueries({ queryKey: ["current-bill"] });
      queryClient.invalidateQueries({ queryKey: ["my-rent-ledger"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payments-history"] });
    }
  });
};

export const useMyRoomDetails = () => {
  return useQuery<TenantRoomDetails>({
    queryKey: ["my-room-details"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenants/profile/me/room");
      return response.data;
    }
  });
};

export const useMyDocuments = (tenantId?: string) => {
  return useQuery<TenantDocument[]>({
    queryKey: ["my-documents", tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/tenants/${tenantId}/documents`);
      return response.data;
    },
    enabled: !!tenantId
  });
};

// ── Phase 8: Advance Rent Payment Hooks ──────────────────────────────────────

/**
 * Fetches the server-authoritative advance payment eligibility context.
 * Used by PayRentPage to decide whether to show the "Pay Next Rent" section.
 */
export const useAdvancePaymentContext = () => {
  return useQuery<AdvancePaymentContext>({
    queryKey: ["advance-payment-context"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/advance-context");
      return response.data;
    },
    staleTime: 15_000,
    retry: false,
  });
};

/**
 * Submits an advance rent payment (targeting next billing period).
 * The server independently calculates the target period from the tenant's JWT.
 */
export const usePayAdvanceRentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("/api/v1/payments/submit-advance", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-current-bill"] });
      queryClient.invalidateQueries({ queryKey: ["current-bill"] });
      queryClient.invalidateQueries({ queryKey: ["advance-payment-context"] });
      queryClient.invalidateQueries({ queryKey: ["my-rent-ledger"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payments-history"] });
    },
  });
};
