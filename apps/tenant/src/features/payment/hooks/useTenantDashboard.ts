import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

export const useTenantDashboardSummary = () => {
  return useQuery<any>({
    queryKey: ["tenant-dashboard-summary"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenant/dashboard");
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useTenantProfile = () => {
  return useQuery<any>({
    queryKey: ["tenant-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenant/profile");
      return response.data;
    },
    refetchInterval: 10000,
  });
};

export const useTenantRoom = () => {
  return useQuery<any>({
    queryKey: ["tenant-room"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenant/room");
      return response.data;
    }
  });
};

export const useTenantContract = () => {
  return useQuery<any>({
    queryKey: ["tenant-contract"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenant/contract");
      return response.data;
    }
  });
};

export const useTenantDocumentsList = () => {
  return useQuery<any[]>({
    queryKey: ["tenant-documents-list"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenant/documents");
      return response.data;
    }
  });
};

export const useTenantPaymentSummary = () => {
  return useQuery<any>({
    queryKey: ["tenant-payment-summary"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/my-summary");
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useTenantCurrentBill = () => {
  return useQuery<any>({
    queryKey: ["tenant-current-bill"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/current");
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useTenantPaymentsHistory = () => {
  return useQuery<any[]>({
    queryKey: ["tenant-payments-history"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/history");
      return response.data;
    },
    refetchInterval: 5000,
  });
};

export const useSubmitPayment = () => {
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
      queryClient.invalidateQueries({ queryKey: ["tenant-payment-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-payments-history"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-dashboard-summary"] });
      // Canonical current-bill key — ensures PayRentPage and RentDetailsPage refresh
      queryClient.invalidateQueries({ queryKey: ["tenant-current-bill"] });
    }
  });
};

export const useUpdateTenantProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.put("/api/v1/tenant/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-dashboard-summary"] });
    }
  });
};

export const useUploadTenantDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("/api/v1/tenant/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-documents-list"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-dashboard-summary"] });
    }
  });
};
