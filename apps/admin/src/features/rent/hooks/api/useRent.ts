import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Rent, RentHistory, RentDashboardStats } from "@bhagirathi/types";

export const useRents = () => {
  return useQuery<Rent[]>({
    queryKey: ["rents"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/rents");
      return response.data;
    }
  });
};

export const useRentDetails = (id?: string | null) => {
  return useQuery<Rent>({
    queryKey: ["rent", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/rents/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useTenantLedger = (tenantId?: string | null) => {
  return useQuery<Rent[]>({
    queryKey: ["tenant-ledger", tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/rents/ledger/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId
  });
};

export const useTenantRentHistory = (tenantId?: string | null) => {
  return useQuery<RentHistory[]>({
    queryKey: ["tenant-rent-history", tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/rents/history/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId
  });
};

export const useRentDashboard = () => {
  return useQuery<RentDashboardStats>({
    queryKey: ["rent-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/rents/dashboard");
      const d = response.data;
      // Map backend snake_case → camelCase RentDashboardStats
      // Backend already sends both aliases; we normalise definitively here.
      return {
        totalMonthlyRent:      Number(d.totalMonthlyRent      ?? d.total_monthly_rent      ?? 0),
        collectedRent:         Number(d.collectedRent          ?? d.total_collected          ?? 0),
        pendingRent:           Number(d.pendingRent            ?? d.total_pending_amount     ?? 0),
        overdueRent:           Number(d.overdueRent            ?? d.overdue_rent             ?? 0),
        todayDue:              Number(d.todayDue               ?? d.today_due                ?? 0),
        totalDue:              Number(d.totalDue               ?? d.total_pending_amount     ?? 0),
        upcomingDue:           Number(d.upcomingDue            ?? 0),
        collectionPercentage:  Number(d.collectionPercentage   ?? d.collection_rate          ?? 0),
      } satisfies RentDashboardStats;
    }
  });
};

// --- Mutations ---
export const useRentMutations = () => {
  const queryClient = useQueryClient();

  const createRent = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/rents", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
    }
  });

  const updateRent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/rents/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
    }
  });

  const deleteRent = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/rents/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
    }
  });

  const generateMonthlyRent = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/rents/generate-monthly", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
    }
  });

  const recordPayment = useMutation({
    mutationFn: async ({ id, payment }: { id: string; payment: any }) => {
      const response = await apiClient.post(`/api/v1/rents/${id}/payment`, payment);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rents"] });
      queryClient.invalidateQueries({ queryKey: ["rent", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["rent-dashboard"] });
      // Refresh rent collection views after a payment is recorded
      queryClient.invalidateQueries({ queryKey: ["rent-collection"] });
      queryClient.invalidateQueries({ queryKey: ["rent-collection-summary"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-today"] });
      queryClient.invalidateQueries({ queryKey: ["rent-alert-summary"] });
    }
  });

  return { createRent, updateRent, deleteRent, generateMonthlyRent, recordPayment };
};
