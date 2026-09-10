import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

// ── Types ──────────────────────────────────────────────────────────

export interface Bill {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  tenant_phone?: string;
  room_id: string | null;
  room_number?: string | null;
  rent_month: number;
  rent_year: number;
  monthly_rent: number;
  amount: number;
  discount: number;
  late_fee: number;
  total_amount: number;
  paid_amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  due_date: string | null;
  remarks: string | null;
  created_at: string | null;
}

export interface BillingPeriodSummary {
  month: number;
  year: number;
  total_bills: number;
  paid: number;
  pending: number;
  overdue: number;
  total_expected: number;
  total_collected: number;
  total_outstanding: number;
  collection_rate: number;
}

export interface BillingOverallSummary {
  total_bills: number;
  paid: number;
  pending: number;
  overdue: number;
  total_collected: number;
  total_outstanding: number;
  collection_rate: number;
}

export interface BillingDashboard {
  overall: BillingOverallSummary;
  current_month: BillingPeriodSummary;
  period: BillingPeriodSummary | null;
}

export interface GenerateResult {
  month: number;
  year: number;
  dry_run: boolean;
  generated: number;
  skipped: number;
  hostel_id: string | null;
  preview: Bill[];
  skipped_details: Array<{ tenant_id: string; tenant_name: string; room_number: string; reason: string }>;
}

// ── Query Hooks ───────────────────────────────────────────────────

export const useBillingDashboard = (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery<BillingDashboard>({
    queryKey: ["billing-dashboard", month, year],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/billing/dashboard${qs}`);
      return response.data;
    },
    staleTime: 30_000,
  });
};

export const useBills = (filters?: {
  month?: number;
  year?: number;
  status?: string;
  tenant_id?: string;
  room_id?: string;
  hostel_id?: string;
  skip?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.month) params.append("month", String(filters.month));
  if (filters?.year) params.append("year", String(filters.year));
  if (filters?.status) params.append("status", filters.status);
  if (filters?.tenant_id) params.append("tenant_id", filters.tenant_id);
  if (filters?.room_id) params.append("room_id", filters.room_id);
  if (filters?.hostel_id) params.append("hostel_id", filters.hostel_id);
  if (filters?.skip !== undefined) params.append("skip", String(filters.skip));
  if (filters?.limit) params.append("limit", String(filters.limit));

  return useQuery<Bill[]>({
    queryKey: ["bills", filters],
    queryFn: async () => {
      const qs = params.toString() ? `?${params.toString()}` : "";
      const response = await apiClient.get(`/api/v1/billing/bills${qs}`);
      return response.data;
    },
    staleTime: 30_000,
  });
};

export const useBill = (billId?: string | null) => {
  return useQuery<Bill>({
    queryKey: ["bill", billId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/billing/bills/${billId}`);
      return response.data;
    },
    enabled: !!billId,
  });
};

export const useTenantBillingLedger = (tenantId?: string | null) => {
  return useQuery<Bill[]>({
    queryKey: ["tenant-billing-ledger", tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/billing/tenant/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId,
  });
};

export const useRoomBillingSummary = (roomId?: string | null, month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append("month", String(month));
  if (year) params.append("year", String(year));
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery<Bill[]>({
    queryKey: ["room-billing", roomId, month, year],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/billing/room/${roomId}${qs}`);
      return response.data;
    },
    enabled: !!roomId,
  });
};

// ── Mutation Hooks ────────────────────────────────────────────────
// Phase 21: generateBills and generateDryRun removed.
// Rent generation is no longer a manual operation.
// Rent Ledger records are created on-demand during payment submission.

export const useBillingMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["bills"] });
    queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["tenant-billing-ledger"] });
  };

  const markOverdue = useMutation({
    mutationFn: async (data?: { as_of_date?: string }) => {
      const response = await apiClient.post("/api/v1/billing/mark-overdue", data || {});
      return response.data;
    },
    onSuccess: invalidateAll,
  });

  const recalculateRoom = useMutation({
    mutationFn: async (data: { room_id: string; month: number; year: number }) => {
      const response = await apiClient.post("/api/v1/billing/recalculate-room", data);
      return response.data;
    },
    onSuccess: invalidateAll,
  });

  const updateBill = useMutation({
    mutationFn: async ({
      billId,
      data,
    }: {
      billId: string;
      data: { discount?: number; late_fee?: number; remarks?: string; due_date?: string };
    }) => {
      const response = await apiClient.put(`/api/v1/billing/bills/${billId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bill", variables.billId] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] });
    },
  });

  return { markOverdue, recalculateRoom, updateBill };
};
