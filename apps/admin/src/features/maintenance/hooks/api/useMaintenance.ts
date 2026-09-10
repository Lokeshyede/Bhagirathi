import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { MaintenanceStaff } from "@bhagirathi/types";

export const useMaintenanceStaff = () => {
  return useQuery<MaintenanceStaff[]>({
    queryKey: ["maintenance-staff"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/maintenance/staff");
      return response.data;
    }
  });
};

export const useMaintenanceMutations = () => {
  const queryClient = useQueryClient();

  const createStaff = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/maintenance/staff/with-account", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-staff"] });
    }
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/maintenance/staff/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-staff"] });
    }
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/maintenance/staff/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-staff"] });
    }
  });

  return { createStaff, updateStaff, deleteStaff };
};
