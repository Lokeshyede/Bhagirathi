import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

const BASE = "/api/v1/receipts";

export interface ReceiptListItem {
  id: string;
  receipt_number: string;
  receipt_type: string;
  status: string;
  pdf_url: string | null;
  generated_at: string;
  payment_id: string;
  billing_month: string | null;
  total_amount: number;
  tenant_name: string;
}

export interface ReceiptResponse {
  id: string;
  receipt_number: string;
  receipt_type: string;
  status: string;
  pdf_url: string | null;
  cloudinary_public_id: string | null;
  generated_at: string;
  generated_by_name: string | null;
  payment_id: string;
  billing_month: string | null;
  payment_date: string | null;
  payment_method: string | null;
  submitted_utr: string | null;
  payment_reference: string | null;
  rent_share: number;
  electricity_share: number;
  other_charges: number;
  total_amount: number;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string | null;
  tenant_email: string | null;
  hostel_name: string | null;
  building_name: string | null;
  floor_name: string | null;
  room_number: string | null;
  bed_number: string | null;
  verification_status: string | null;
  verified_by_name: string | null;
  verified_at: string | null;
  ai_confidence: number | null;
  receipt_meta: any | null;
}

export interface ReceiptListResponse {
  total: number;
  items: ReceiptListItem[];
}

export interface ReceiptFilters {
  search?: string;
  receipt_type?: string;
  skip?: number;
  limit?: number;
}

export function useReceipts(filters: ReceiptFilters = {}) {
  return useQuery<ReceiptListResponse>({
    queryKey: ["receipts", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.receipt_type && filters.receipt_type !== "ALL") {
        params.receipt_type = filters.receipt_type;
      }
      if (filters.skip !== undefined) params.skip = filters.skip;
      if (filters.limit !== undefined) params.limit = filters.limit;

      const response = await apiClient.get(BASE, { params });
      return response.data;
    },
    staleTime: 20000,
  });
}

export function useReceiptById(receiptId: string | null) {
  return useQuery<ReceiptResponse>({
    queryKey: ["receipt", receiptId],
    queryFn: async () => {
      const response = await apiClient.get(`${BASE}/${receiptId}`);
      return response.data;
    },
    enabled: !!receiptId,
    staleTime: 30000,
  });
}

export function useReceiptByPayment(paymentId: string | null) {
  return useQuery<ReceiptResponse>({
    queryKey: ["receipt-by-payment", paymentId],
    queryFn: async () => {
      const response = await apiClient.get(`${BASE}/payment/${paymentId}`);
      return response.data;
    },
    enabled: !!paymentId,
    staleTime: 30000,
  });
}

export function useRegenerateReceipt() {
  const queryClient = useQueryClient();
  return useMutation<ReceiptResponse, Error, { payment_id: string }>({
    mutationFn: async (vars) => {
      const response = await apiClient.post(`${BASE}/regenerate`, {
        payment_id: vars.payment_id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["receipt", data.id] });
      queryClient.invalidateQueries({ queryKey: ["receipt-by-payment", data.payment_id] });
    },
  });
}

export function useReceiptDownload(receiptId: string | null) {
  return useQuery<{ pdf_url: string; receipt_number: string }>({
    queryKey: ["receipt-download", receiptId],
    queryFn: async () => {
      const response = await apiClient.get(`${BASE}/${receiptId}/download`);
      return response.data;
    },
    enabled: !!receiptId,
  });
}
