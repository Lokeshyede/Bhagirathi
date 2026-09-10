import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

const BASE = "/api/v1/payments";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VerificationQueueItem {
  id: string;
  tenant_name: string;
  hostel_name: string;
  building_name: string;
  floor_name: string;
  room_number: string;
  bed_number: string | null;
  billing_month: string;
  rent_share: number;
  electricity_share: number;
  other_charges: number;
  total_amount: number;
  payment_reference: string | null;
  submitted_utr: string | null;
  payment_date: string | null;
  submission_time: string | null;
  status: string;
  verification_status: string | null;
  // AI fields
  confidence_score: number | null;
  confidence_label: string | null;
  recommendation: string | null;
  ai_summary: string | null;
  matched_rules: string[];
  failed_rules: string[];
  is_duplicate: boolean;
  is_fraud_flagged: boolean;
  // Bank
  bank_utr: string | null;
  bank_amount: number | null;
  bank_date: string | null;
}

export interface VerificationQueueResponse {
  total: number;
  items: VerificationQueueItem[];
}

export interface VerificationDashboardStats {
  pending_verification: number;
  ai_ready: number;
  manual_review_queue: number;
  rejected_count: number;
  verified_today: number;
  rejected_today: number;
  verification_accuracy: number;
  average_confidence: number;
  duplicate_alerts: number;
  fraud_alerts: number;
  total_submitted: number;
  total_verified: number;
}

export interface BulkActionResult {
  total: number;
  processed: number;
  skipped: number;
  failed: number;
  skipped_details: { payment_id: string; reason: string }[];
  message: string;
}

export interface ComparisonField {
  label: string;
  tenant_value: string | null;
  bank_value: string | null;
  match_status: "MATCHED" | "MISMATCH" | "MISSING" | "PARTIAL";
}

export interface ComparisonPanelData {
  payment: {
    payment_id: string;
    tenant_name: string;
    room_number: string;
    billing_month: string;
    amount: number;
    utr: string | null;
    payment_date: string | null;
    payment_reference: string | null;
    proof_image_url: string | null;
    status: string;
  };
  bank: {
    transaction_id: string | null;
    transaction_date: string | null;
    amount: number | null;
    utr: string | null;
    sender_name: string | null;
    narration: string | null;
    reference_number: string | null;
    account_number_masked: string | null;
    statement_file_name: string | null;
  } | null;
  comparison_fields: ComparisonField[];
  confidence_score: number | null;
  confidence_label: string | null;
  recommendation: string | null;
  ai_summary: string | null;
  rule_breakdown: any[] | null;
  ocr_result: any | null;
  is_fraud_flagged: boolean;
  fraud_flags: string[];
  is_duplicate: boolean;
}

export interface VerificationQueueFilters {
  search?: string;
  hostel_id?: string;
  building_id?: string;
  room_id?: string;
  billing_month?: string;
  status?: string;
  ai_filter?: string;
  skip?: number;
  limit?: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useVerificationDashboard() {
  return useQuery<VerificationDashboardStats>({
    queryKey: ["verification-dashboard"],
    queryFn: () =>
      apiClient.get(`${BASE}/verification-dashboard`).then((r) => r.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useVerificationQueue(filters: VerificationQueueFilters = {}) {
  return useQuery<VerificationQueueResponse>({
    queryKey: ["verification-queue", filters],
    queryFn: () => {
      const params: Record<string, any> = {};
      if (filters.search) params.search = filters.search;
      if (filters.hostel_id && filters.hostel_id !== "ALL") params.hostel_id = filters.hostel_id;
      if (filters.building_id && filters.building_id !== "ALL") params.building_id = filters.building_id;
      if (filters.room_id && filters.room_id !== "ALL") params.room_id = filters.room_id;
      if (filters.billing_month) params.billing_month = filters.billing_month;
      if (filters.status && filters.status !== "ALL") params.status = filters.status;
      if (filters.ai_filter && filters.ai_filter !== "ALL") params.ai_filter = filters.ai_filter;
      if (filters.skip) params.skip = filters.skip;
      if (filters.limit) params.limit = filters.limit;
      return apiClient.get(`${BASE}/verification-queue`, { params }).then((r) => r.data);
    },
    staleTime: 10_000,
  });
}

export function useComparisonPanel(paymentId: string | null) {
  return useQuery<ComparisonPanelData>({
    queryKey: ["comparison-panel", paymentId],
    queryFn: () =>
      apiClient.get(`${BASE}/comparison/${paymentId}`).then((r) => r.data),
    enabled: !!paymentId,
    staleTime: 60_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

// All query keys in this list are verified against actual useQuery() calls in the codebase.
// Do NOT add keys that don't exist as actual queryKey values in hooks.
function useVerificationMutation<TVariables>(
  mutationFn: (vars: TVariables) => Promise<any>,
  invalidations: string[][] = [
    // Verification panel
    ["verification-dashboard"],   // useVerificationDashboard()
    ["verification-queue"],        // useVerificationQueue() — prefix matches all filter variants
    ["comparison-panel"],          // useComparisonPanel() — prefix matches all paymentId variants
    // Payment lists
    ["payments"],                  // usePayments() — prefix matches all filter variants
    ["payments-dashboard"],        // usePaymentDashboard()
    ["payment-audit"],             // usePaymentAuditHistory() — prefix matches all id variants
    ["payment-receipt"],           // usePaymentReceipt() — prefix matches all id variants
    // Rent lists
    ["rents"],                     // useRents()
    ["rent-dashboard"],            // useRentDashboard()
    // Rent collection views — must refresh immediately after any verification
    ["rent-collection"],           // useRentCollection() — prefix matches all filter variants
    ["rent-collection-summary"],   // useRentCollectionSummary()
    ["rent-alert-today"],          // useTodayRentAlert()
    ["rent-alert-summary"],        // useRentAlertSummary()
    ["dashboard", "rent-collection"], // useDashboardRentCollection()
    // Tenant obligation (used in Admin collection modal + Tenant portal)
    ["tenant-current-obligation"], // useTenantCurrentObligation()
    ["tenant-payment-history"],    // (if used)
  ],
) {
  const qc = useQueryClient();
  return useMutation<any, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      invalidations.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
  });
}

export function useVerifySelected() {
  return useVerificationMutation<{ payment_ids: string[] }>((vars) =>
    apiClient.post(`${BASE}/verify-selected`, { payment_ids: vars.payment_ids }).then((r) => r.data),
  );
}

export function useVerifyAllReady() {
  return useVerificationMutation<{ min_confidence?: number }>((vars) =>
    apiClient
      .post(`${BASE}/verify-all-ready`, {
        min_confidence: vars.min_confidence ?? 95,
        confirm: true,
      })
      .then((r) => r.data),
  );
}

export function useBulkReject() {
  return useVerificationMutation<{ payment_ids: string[]; reason: string; remarks?: string }>((vars) =>
    apiClient.post(`${BASE}/reject`, vars).then((r) => r.data),
  );
}

export function useMoveToManualReview() {
  return useVerificationMutation<{ payment_ids: string[]; reason: string }>((vars) =>
    apiClient.post(`${BASE}/move-to-manual-review`, vars).then((r) => r.data),
  );
}

export function useUndoVerification() {
  return useVerificationMutation<{ payment_id: string; reason?: string }>((vars) =>
    apiClient.post(`${BASE}/undo-verification`, vars).then((r) => r.data),
  );
}

export function useApproveFromManualReview() {
  return useVerificationMutation<{ payment_id: string }>((vars) =>
    apiClient.post(`${BASE}/manual-review/${vars.payment_id}/approve`).then((r) => r.data),
  );
}

export function useRejectFromManualReview() {
  return useVerificationMutation<{ payment_id: string; reason: string; remarks?: string }>((vars) =>
    apiClient
      .post(`${BASE}/manual-review/${vars.payment_id}/reject`, {
        reason: vars.reason,
        remarks: vars.remarks,
      })
      .then((r) => r.data),
  );
}

export function useVerifySinglePayment() {
  return useVerificationMutation<{ payment_id: string }>((vars) =>
    apiClient.post(`${BASE}/${vars.payment_id}/verify`).then((r) => r.data),
  );
}

export function useRejectSinglePayment() {
  return useVerificationMutation<{ payment_id: string; remarks?: string }>((vars) =>
    apiClient.post(`${BASE}/${vars.payment_id}/reject`, { remarks: vars.remarks }).then((r) => r.data),
  );
}


