import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import {
  AppPreferences,
  HostelProfile,
  UPIPaymentSettings,
  AdminProfile
} from "../types";

export const useAppPreferences = () => {
  return useQuery<AppPreferences>({
    queryKey: ["app-preferences"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/settings");
      return res.data;
    }
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AppPreferences>) => {
      const res = await apiClient.put("/api/v1/settings", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-preferences"] });
    }
  });
};

export const useHostelProfile = () => {
  return useQuery<HostelProfile>({
    queryKey: ["hostel-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/settings/hostel-profile");
      return res.data;
    }
  });
};

export const useUpdateHostelProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.put("/api/v1/settings/hostel-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-profile"] });
    }
  });
};

export const usePaymentSettings = () => {
  return useQuery<UPIPaymentSettings>({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/settings/payment");
      return res.data;
    }
  });
};

export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.put("/api/v1/settings/payment", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
    }
  });
};

export const useAdminProfile = () => {
  return useQuery<AdminProfile>({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/settings/profile");
      return res.data;
    }
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.put("/api/v1/settings/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    }
  });
};
