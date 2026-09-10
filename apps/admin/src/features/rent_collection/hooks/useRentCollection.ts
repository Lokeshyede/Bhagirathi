import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

export interface RentCollectionItem {
  tenant_id: string;
  tenant_display_id: string;
  tenant_name: string;
  tenant_photo?: string | null;
  tenant_mobile: string;
  tenant_email: string;

  hostel_id?: string | null;
  hostel_name?: string | null;
  building_id?: string | null;
  building_name?: string | null;
  floor_id?: string | null;
  floor_name?: string | null;
  room_id?: string | null;
  room_number?: string | null;
  bed_id?: string | null;
  bed_number?: string | null;

  rent_id?: string | null;
  rent_month?: number | null;
  rent_year?: number | null;
  monthly_rent?: number | null;
  rent_due_date?: string | null;
  rent_status?: string | null;
  rent_paid_amount?: number | null;
  rent_total_amount?: number | null;
  days_remaining?: number | null;

  electricity_bill_id?: string | null;
  electricity_amount?: number | null;
  electricity_due_date?: string | null;
  electricity_status?: string | null;
  electricity_payment_status?: string | null;

  total_payable: number;
  total_paid: number;
  outstanding_balance: number;
  overall_status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
}

export interface RentCollectionSummary {
  today_due_count: number;
  today_due_amount: number;
  tomorrow_due_count: number;
  tomorrow_due_amount: number;
  this_week_due_count: number;
  this_week_due_amount: number;
  overdue_count: number;
  overdue_amount: number;
  today_expected_collection: number;
  pending_electricity_count: number;
  pending_electricity_amount: number;
  total_pending_amount: number;
  total_active_tenants: number;
}

export interface RentCollectionFilters {
  search?: string;
  hostel_id?: string;
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  rent_status?: string;
  electricity_status?: string;
  overall_status?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export const useRentCollectionSummary = () => {
  return useQuery<RentCollectionSummary>({
    queryKey: ["rent-collection-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/rent-collection/summary");
      const data = res.data;
      return {
        today_due_count: data.today_due_count ?? 0,
        today_due_amount: data.today_due_amount ?? 0,
        tomorrow_due_count: data.tomorrow_due_count ?? 0,
        tomorrow_due_amount: data.tomorrow_due_amount ?? 0,
        this_week_due_count: data.this_week_due_count ?? 0,
        this_week_due_amount: data.this_week_due_amount ?? 0,
        overdue_count: data.overdue ?? data.overdue_count ?? 0,
        overdue_amount: data.overdue_amount ?? 0,
        today_expected_collection: data.today_expected_collection ?? 0,
        pending_electricity_count: data.pending_electricity_count ?? 0,
        pending_electricity_amount: data.pending_electricity_amount ?? 0,
        total_pending_amount: data.total_pending_amount ?? ((data.total_expected ?? 0) - (data.total_collected ?? 0)),
        total_active_tenants: data.total_tenants ?? data.total_active_tenants ?? 0,
      } as any;
    },
    refetchInterval: 60_000,
  });
};

export const useRentCollection = (filters: RentCollectionFilters = {}) => {
  return useQuery<RentCollectionItem[]>({
    queryKey: ["rent-collection", filters],
    queryFn: async () => {
      const params: Record<string, any> = { limit: 500 };
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.hostel_id) params.hostel_id = filters.hostel_id;
      if (filters.building_id) params.building_id = filters.building_id;
      if (filters.floor_id) params.floor_id = filters.floor_id;
      if (filters.room_id) params.room_id = filters.room_id;
      if (filters.rent_status && filters.rent_status !== "ALL") params.rent_status = filters.rent_status;
      if (filters.electricity_status && filters.electricity_status !== "ALL") params.electricity_status = filters.electricity_status;
      if (filters.overall_status && filters.overall_status !== "ALL") params.overall_status = filters.overall_status;
      if (filters.due_date_from) params.due_date_from = filters.due_date_from;
      if (filters.due_date_to) params.due_date_to = filters.due_date_to;

      const res = await apiClient.get("/api/v1/rent-collection", { params });
      return res.data;
    },
    refetchInterval: 60_000,
  });
};

export const useRentCollectionTenant = (tenantId?: string | null) => {
  return useQuery<RentCollectionItem>({
    queryKey: ["rent-collection-tenant", tenantId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/rent-collection/${tenantId}`);
      return res.data;
    },
    enabled: !!tenantId,
  });
};

export const useRentCollectionToday = () => {
  return useQuery<RentCollectionItem[]>({
    queryKey: ["rent-collection-today"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/rent-collection/today");
      return res.data;
    },
  });
};

export const useRentCollectionOverdue = () => {
  return useQuery<RentCollectionItem[]>({
    queryKey: ["rent-collection-overdue"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/rent-collection/overdue");
      return res.data;
    },
  });
};

// ─── NEW: Today's Rent Alert Types ────────────────────────────────────────────

export interface RentAlertTenant {
  rent_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_mobile: string;
  tenant_email: string;
  tenant_photo?: string | null;

  // Location
  hostel_id?: string | null;
  hostel_name?: string | null;
  building_id?: string | null;
  building_name?: string | null;
  floor_id?: string | null;
  floor_name?: string | null;
  room_number?: string | null;
  bed_number?: string | null;

  // Financials
  monthly_rent: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  late_fee: number;

  // Dates
  due_date: string;
  rent_month?: number | null;
  rent_year?: number | null;
  last_payment_date?: string | null;

  // Status
  rent_status: string;
  payment_status: "DUE_TODAY" | "OVERDUE" | "PENDING" | "PAID";
  days_overdue: number;
  priority_color: "GREEN" | "YELLOW" | "ORANGE" | "RED";
}

export interface RentAlertSummary {
  total_due_today: number;
  total_due_today_amount: number;
  total_overdue: number;
  total_overdue_amount: number;
  expected_collection: number;
  pending_amount: number;
  tenant_count: number;
  as_of_date: string;
}

export interface RentAlertResponse {
  summary: RentAlertSummary;
  tenants: RentAlertTenant[];
}

export interface RentAlertFilters {
  hostel_id?: string;
  building_id?: string;
  floor_id?: string;
  payment_status?: string;
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
}

// ─── NEW: Today's Rent Alert Hooks ────────────────────────────────────────────

/** Full tenant list + KPI summary for the alert page. Auto-refreshes every 5 min. */
export const useTodayRentAlert = (filters: RentAlertFilters = {}) => {
  return useQuery<RentAlertResponse>({
    queryKey: ["rent-alert-today", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.hostel_id) params.hostel_id = filters.hostel_id;
      if (filters.building_id) params.building_id = filters.building_id;
      if (filters.floor_id) params.floor_id = filters.floor_id;
      if (filters.payment_status && filters.payment_status !== "ALL")
        params.payment_status = filters.payment_status;
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.due_date_from) params.due_date_from = filters.due_date_from;
      if (filters.due_date_to) params.due_date_to = filters.due_date_to;

      const res = await apiClient.get("/api/v1/rent-collection/today-alert", { params });
      return res.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 4 * 60 * 1000,
  });
};

/** Lightweight KPI-only summary for dashboard widget. Auto-refreshes every 5 min. */
export const useRentAlertSummary = () => {
  return useQuery<RentAlertSummary>({
    queryKey: ["rent-alert-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/rent-collection/alert-summary");
      return res.data;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });
};

/** Mark a rent reminder as sent — updates remarks in DB. */
export const useMarkReminderSent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rentId: string) => {
      const res = await apiClient.post(`/api/v1/rent-collection/mark-reminder/${rentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rent-alert-today"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-summary"] });
    },
  });
};

/** Record cash payment collected by admin. */
export const useRecordCashCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      tenant_id: string;
      amount: number;
      remarks?: string;
      billing_month?: number;
      billing_year?: number;
      payment_type?: "RENT" | "ELECTRICITY";
      electricity_bill_id?: string;
    }) => {
      const res = await apiClient.post("/api/v1/payments/cash-collection", data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      // Rent collection views
      queryClient.invalidateQueries({ queryKey: ["rent-collection"] });
      queryClient.invalidateQueries({ queryKey: ["rent-collection-summary"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-today"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-summary"] });
      // Electricity views
      queryClient.invalidateQueries({ queryKey: ["electricity-stats"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-dues"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-pending-verification"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-payment-history"] });
      // Verification queue (cash creates a verified payment, so queue changes)
      queryClient.invalidateQueries({ queryKey: ["verification-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["verification-queue"] });
      // Payment lists
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payments-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cash-pending-payments"] });
      // Rent ledger
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
      // Tenant-specific obligation
      if (variables.tenant_id) {
        queryClient.invalidateQueries({ queryKey: ["tenant-current-obligation", variables.tenant_id] });
        queryClient.invalidateQueries({ queryKey: ["tenant-payment-history", variables.tenant_id] });
        queryClient.invalidateQueries({ queryKey: ["rent-collection-tenant", variables.tenant_id] });
      }
    },
  });
};

/** Fetch pending cash payment records. */
export const usePendingCashPayments = () => {
  return useQuery<any[]>({
    queryKey: ["cash-pending-payments"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/payments/cash-pending");
      return res.data;
    },
  });
};

/** Fetch current rent obligation for a tenant (respects Phase 21 on-demand logic). */
export const useTenantCurrentObligation = (tenantId?: string | null) => {
  return useQuery<any>({
    queryKey: ["tenant-current-obligation", tenantId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/payments/current-obligation/${tenantId}`);
      return res.data;
    },
    enabled: !!tenantId,
  });
};

