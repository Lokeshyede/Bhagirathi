import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

const BASE = "/api/v1/payments";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RuleBreakdownItem {
  rule: string;
  status: "MATCHED" | "PARTIAL" | "MISSING" | "MISMATCH" | "OCR_FAILED" | "LOW_CONFIDENCE" | "DUPLICATE";
  score: number;
  max_score: number;
  detail: string | null;
  submitted_value: string | null;
  bank_value: string | null;
}

export interface OCRExtractedData {
  utr: string | null;
  amount: number | null;
  date: string | null;
  time: string | null;
  receiver_upi: string | null;
  sender_name: string | null;
  reference_number: string | null;
  transaction_id: string | null;
  payment_remarks: string | null;
  raw_text: string | null;
  confidence: number | null;
  ocr_available: boolean;
  low_confidence: boolean;
}

export interface MatchTimelineEvent {
  title: string;
  description: string;
  timestamp: string | null;
  status: "completed" | "pending" | "failed";
}

export interface PaymentBasicInfo {
  id: string;
  payment_reference: string | null;
  tenant_name: string;
  room_number: string | null;
  billing_month: string | null;
  submitted_amount: number;
  submitted_utr: string | null;
  payment_date: string | null;
  proof_image_url: string | null;
  status: string;
}

export interface BankTransactionBasicInfo {
  id: string;
  transaction_date: string | null;
  amount: number;
  utr: string | null;
  sender_name: string | null;
  narration: string | null;
  reference_number: string | null;
  account_number_masked: string | null;
  statement_file_name: string | null;
}

export interface ReconciliationDetail {
  payment: PaymentBasicInfo;
  bank_transaction: BankTransactionBasicInfo | null;
  reconciliation_status: string;
  confidence_score: number;
  confidence_label: string;
  recommendation: string;
  rule_breakdown: RuleBreakdownItem[];
  matched_rules: string[];
  failed_rules: string[];
  partial_rules: string[];
  ai_summary: string;
  ocr_result: OCRExtractedData | null;
  is_duplicate: boolean;
  is_fraud_flagged: boolean;
  fraud_flags: string[];
  match_timeline: MatchTimelineEvent[];
  reconciled_at: string | null;
}

export interface ConfidenceDistribution {
  very_high: number;
  high: number;
  low: number;
  unprocessed: number;
}

export interface ReconciliationReport {
  total_submitted_payments: number;
  total_bank_transactions: number;
  reconciled_count: number;
  matched_count: number;
  unmatched_count: number;
  duplicate_count: number;
  fraud_flagged_count: number;
  manual_review_count: number;
  ready_to_verify_count: number;
  needs_review_count: number;
  confidence_distribution: ConfidenceDistribution;
  last_reconciled_at: string | null;
}

export interface ManualReviewItem {
  log_id: string;
  payment_id: string;
  payment_reference: string | null;
  tenant_name: string;
  room_number: string | null;
  billing_month: string | null;
  submitted_amount: number;
  submitted_utr: string | null;
  confidence_score: number;
  confidence_label: string;
  recommendation: string;
  failed_rules: string[];
  ai_summary: string;
  is_fraud_flagged: boolean;
  reconciled_at: string | null;
}

export interface ManualReviewResponse {
  total: number;
  items: ManualReviewItem[];
}

export interface ReconcileRequest {
  statement_id?: string | null;
  payment_ids?: string[] | null;
}

export interface ReconcileResponse {
  task_id: string;
  message: string;
  payments_queued: number;
  status: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useReconciliationReport() {
  return useQuery<ReconciliationReport>({
    queryKey: ["reconciliation-report"],
    queryFn: () =>
      apiClient.get(`${BASE}/reconciliation-report`).then((r) => r.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useReconciliationDetail(paymentId: string | null) {
  return useQuery<ReconciliationDetail>({
    queryKey: ["reconciliation-detail", paymentId],
    queryFn: () =>
      apiClient.get(`${BASE}/reconciliation/${paymentId}`).then((r) => r.data),
    enabled: !!paymentId,
    staleTime: 30_000,
  });
}

export function useManualReviewQueue(skip = 0, limit = 50) {
  return useQuery<ManualReviewResponse>({
    queryKey: ["manual-review-queue", skip, limit],
    queryFn: () =>
      apiClient
        .get(`${BASE}/manual-review?skip=${skip}&limit=${limit}`)
        .then((r) => r.data),
    staleTime: 20_000,
  });
}

export function useRunReconciliation() {
  const qc = useQueryClient();
  return useMutation<ReconcileResponse, Error, ReconcileRequest>({
    mutationFn: (payload) =>
      apiClient.post(`${BASE}/reconcile`, payload).then((r) => r.data),
    onSuccess: () => {
      // Invalidate report after a brief delay to allow background task to progress
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["reconciliation-report"] });
        qc.invalidateQueries({ queryKey: ["manual-review-queue"] });
      }, 3000);
    },
  });
}
