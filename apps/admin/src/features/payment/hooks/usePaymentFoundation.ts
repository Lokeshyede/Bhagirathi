import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

export const useGenerateMonthlyPayments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ billing_month, billing_year }: { billing_month: number; billing_year: number }) => {
      const response = await apiClient.post("/api/v1/payments/generate-monthly", {
        billing_month,
        billing_year
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments-room-summary"] });
      queryClient.invalidateQueries({ queryKey: ["payments-foundation-history"] });
    }
  });
};

export const useRoomPaymentSummary = () => {
  return useQuery<any>({
    queryKey: ["payments-room-summary"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/room-summary");
      return response.data;
    }
  });
};

export const usePaymentsFoundationHistory = () => {
  return useQuery<any[]>({
    queryKey: ["payments-foundation-history"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/history");
      return response.data;
    }
  });
};
