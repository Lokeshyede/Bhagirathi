import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Tenant, CheckInHistory, TenantDocument, ArchivedTenantsListResponse, ArchivedTenantDossier } from "@bhagirathi/types";

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

export interface ArchivedTenantsQueryParams {
  search?: string;
  hostel_id?: string;
  building_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export const useArchivedTenants = (params?: ArchivedTenantsQueryParams) => {
  return useQuery<ArchivedTenantsListResponse>({
    queryKey: ["archived-tenants", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.hostel_id) searchParams.set("hostel_id", params.hostel_id);
      if (params?.building_id) searchParams.set("building_id", params.building_id);
      if (params?.date_from) searchParams.set("date_from", params.date_from);
      if (params?.date_to) searchParams.set("date_to", params.date_to);
      if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));

      const queryString = searchParams.toString();
      const url = queryString ? `/api/v1/tenants/archived?${queryString}` : "/api/v1/tenants/archived";
      const response = await apiClient.get(url);
      return response.data;
    }
  });
};

export const useArchivedTenantDossier = (id?: string | null) => {
  return useQuery<ArchivedTenantDossier>({
    queryKey: ["archived-tenant-dossier", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/tenants/${id}/archive-details`);
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
      queryClient.invalidateQueries({ queryKey: ["archived-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-availability"] });
    }
  });

  const archiveTenant = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.post(`/api/v1/tenants/${id}/archive`, { reason });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["archived-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-availability"] });
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
    mutationFn: async (params: string | { id: string; room_id?: string; bed_id?: string }) => {
      const tenantId = typeof params === "string" ? params : params.id;
      const body = typeof params === "string" ? {} : { room_id: params.room_id, bed_id: params.bed_id };
      const response = await apiClient.post(`/api/v1/tenants/${tenantId}/restore`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["archived-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-availability"] });
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
    archiveTenant,
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

