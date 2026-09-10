import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

export const useAdminUsers = () => {
  return useQuery<any[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/auth/admin/users");
      return response.data;
    }
  });
};

export const useAdminUserMutations = () => {
  const queryClient = useQueryClient();

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/auth/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  const resetPassword = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/api/v1/auth/admin/users/${id}/reset-password`, data);
      return response.data;
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/auth/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  return { updateUser, resetPassword, deleteUser };
};
