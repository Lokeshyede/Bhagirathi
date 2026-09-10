import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { BedAllocation, AllocationHistory } from "@bhagirathi/types";

export const useAllocations = () => {
  return useQuery<BedAllocation[]>({
    queryKey: ["allocations"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/allocations");
      return response.data;
    }
  });
};

export const useAllocationDetails = (id?: string | null) => {
  return useQuery<BedAllocation>({
    queryKey: ["allocation", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/allocations/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useAllocationHistory = (tenantId?: string | null) => {
  return useQuery<AllocationHistory>({
    queryKey: ["allocation-history", tenantId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/allocations/history/${tenantId}`);
      return response.data;
    },
    enabled: !!tenantId
  });
};

// --- Mutations ---
export const useAllocationMutations = () => {
  const queryClient = useQueryClient();

  const allocateBed = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/allocations", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["allocation-history", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  const updateAllocation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/allocations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["allocation", variables.id] });
    }
  });

  const transferRoom = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/allocations/transfer-room", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["allocation-history", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  const transferBed = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/allocations/transfer-bed", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["allocation-history", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  const checkoutTenant = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/allocations/check-out", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["allocation-history", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  return { allocateBed, updateAllocation, transferRoom, transferBed, checkoutTenant };
};
