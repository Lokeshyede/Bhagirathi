import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Tenant, CheckInHistory, TenantDocument } from "@bhagirathi/types";

export const useTenants = () => {
  return useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/tenants");
      return response.data;
    }
  });
};

export const useTenantDetails = (id?: string | null) => {
  return useQuery<Tenant>({
    queryKey: ["tenant", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/tenants/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useTenantHistory = (id?: string | null) => {
  return useQuery<CheckInHistory[]>({
    queryKey: ["tenant-history", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/tenants/${id}/history`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useTenantDocuments = (id?: string | null) => {
  return useQuery<TenantDocument[]>({
    queryKey: ["tenant-documents", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/tenants/${id}/documents`);
      return response.data;
    },
    enabled: !!id
  });
};

// --- Mutations ---
export const useTenantMutations = () => {
  const queryClient = useQueryClient();

  const createTenant = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/tenants", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    }
  });

  const updateTenant = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/tenants/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.id] });
    }
  });

  const deleteTenant = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/tenants/${id}`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
    }
  });

  const checkinTenant = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/tenants/checkin", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-history", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  const checkoutTenant = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/tenants/checkout", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["tenant-history", variables.tenant_id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  });

  const createTenantWithAccount = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/tenants/with-account", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    }
  });

  const restoreTenant = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/tenants/${id}/restore`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
    }
  });

  const bulkImportTenants = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/tenants/bulk-import", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    }
  });

  const renewContract = useMutation({
    mutationFn: async ({ contractId, data }: { contractId: string; data: any }) => {
      const response = await apiClient.post(`/api/v1/contracts/${contractId}/renew`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    }
  });

  const terminateContract = useMutation({
    mutationFn: async ({ contractId, data }: { contractId: string; data: any }) => {
      const response = await apiClient.post(`/api/v1/contracts/${contractId}/terminate`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    }
  });

  const addTenantDocument = useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: any }) => {
      const response = await apiClient.post(`/api/v1/tenants/${tenantId}/documents`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-documents", variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant360", variables.tenantId] });
    }
  });

  // Uploads a real file (PNG/JPG/WEBP/PDF) to the new multipart endpoint.
  // Sends multipart/form-data — Admin never needs to paste a Cloudinary URL manually.
  const uploadTenantDocument = useMutation({
    mutationFn: async ({ tenantId, documentType, file }: { tenantId: string; documentType: string; file: File }) => {
      const formData = new FormData();
      formData.append("document_type", documentType);
      formData.append("file", file);

      // apiClient has a global default Content-Type: application/json.
      // For multipart uploads we must DELETE this header so the browser sets
      // Content-Type: multipart/form-data; boundary=<auto-generated>
      // If the boundary is missing the backend cannot parse the form fields.
      const response = await apiClient.post(
        `/api/v1/tenants/${tenantId}/documents/upload`,
        formData,
        {
          headers: {
            "Content-Type": undefined, // forces Axios to remove the default and let the browser set it
          },
          transformRequest: (data) => data, // skip Axios JSON serialization — send FormData as-is
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-documents", variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant360", variables.tenantId] });
    }
  });

  const deleteTenantDocument = useMutation({
    mutationFn: async ({ tenantId, docId }: { tenantId: string; docId: string }) => {
      const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/documents/${docId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-documents", variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant360", variables.tenantId] });
    }
  });

  const updateTenantDocumentStatus = useMutation({
    mutationFn: async ({ tenantId, docId, status }: { tenantId: string; docId: string; status: string }) => {
      const formData = new FormData();
      formData.append("status_value", status);
      const response = await apiClient.patch(
        `/api/v1/tenants/${tenantId}/documents/${docId}/status`,
        formData,
        {
          headers: { "Content-Type": undefined },
          transformRequest: (data) => data,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-documents", variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant360", variables.tenantId] });
    }
  });

  return {
    createTenant,
    createTenantWithAccount,
    updateTenant,
    deleteTenant,
    restoreTenant,
    bulkImportTenants,
    checkinTenant,
    checkoutTenant,
    addTenantDocument,
    uploadTenantDocument,
    deleteTenantDocument,
    updateTenantDocumentStatus,
    renewContract,
    terminateContract
  };
};

export const useTenant360 = (id?: string | null) => {
  return useQuery({
    queryKey: ["tenant360", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/tenants/${id}/360`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useContracts = (tenantId?: string | null) => {
  return useQuery({
    queryKey: ["contracts", tenantId],
    queryFn: async () => {
      const url = tenantId ? `/api/v1/contracts?tenant_id=${tenantId}` : "/api/v1/contracts";
      const response = await apiClient.get(url);
      return response.data;
    }
  });
};

