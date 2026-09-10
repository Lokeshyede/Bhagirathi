import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatementTransaction {
  id: string;
  statement_id: string;
  transaction_date: string | null;
  transaction_time: string | null;
  amount: number;
  transaction_type: "CREDIT" | "DEBIT";
  reference_number: string | null;
  utr: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  narration: string | null;
  account_number_masked: string | null;
  balance: number | null;
  validation_status: "VALID" | "INVALID" | "WARNING";
  validation_errors: string[] | null;
  is_duplicate: boolean;
  created_at: string;
}

export interface BankStatement {
  id: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  file_url: string;
  bank_name: string | null;
  import_status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  total_transactions: number;
  total_credits: number;
  total_debits: number;
  parsing_error: string | null;
  uploaded_by: string | null;
  uploader_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatementPreview {
  statement: BankStatement;
  valid_count: number;
  invalid_count: number;
  warning_count: number;
  duplicate_count: number;
  transactions: StatementTransaction[];
}

export interface StatementListResponse {
  total: number;
  statements: BankStatement[];
}

export interface TransactionListResponse {
  total: number;
  skip: number;
  limit: number;
  transactions: StatementTransaction[];
}

export interface TransactionFilters {
  search?: string;
  transaction_type?: "CREDIT" | "DEBIT" | "";
  validation_status?: "VALID" | "INVALID" | "WARNING" | "";
  is_duplicate?: boolean;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  skip?: number;
  limit?: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const BASE = "/api/v1/payments";

export function useBankStatements(skip = 0, limit = 20) {
  return useQuery<StatementListResponse>({
    queryKey: ["bank-statements", skip, limit],
    queryFn: () =>
      apiClient.get(`${BASE}/bank-statements?skip=${skip}&limit=${limit}`).then((r) => r.data),
    staleTime: 10_000,
  });
}

export function useBankStatement(statementId: string | null) {
  return useQuery<StatementPreview>({
    queryKey: ["bank-statement", statementId],
    queryFn: () =>
      apiClient.get(`${BASE}/bank-statements/${statementId}`).then((r) => r.data),
    enabled: !!statementId,
    refetchInterval: (data) => {
      // Poll every 2s while still processing
      const status = data?.state?.data?.statement?.import_status;
      return status === "UPLOADING" || status === "PROCESSING" ? 2000 : false;
    },
  });
}

export function useBankStatementTransactions(
  statementId: string | null,
  filters: TransactionFilters = {}
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.transaction_type) params.set("transaction_type", filters.transaction_type);
  if (filters.validation_status) params.set("validation_status", filters.validation_status);
  if (filters.is_duplicate !== undefined) params.set("is_duplicate", String(filters.is_duplicate));
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.amount_min !== undefined) params.set("amount_min", String(filters.amount_min));
  if (filters.amount_max !== undefined) params.set("amount_max", String(filters.amount_max));
  params.set("skip", String(filters.skip ?? 0));
  params.set("limit", String(filters.limit ?? 100));

  return useQuery<TransactionListResponse>({
    queryKey: ["bank-statement-transactions", statementId, filters],
    queryFn: () =>
      apiClient
        .get(`${BASE}/bank-statements/${statementId}/transactions?${params.toString()}`)
        .then((r) => r.data),
    enabled: !!statementId,
    staleTime: 15_000,
  });
}

export function useUploadBankStatement() {
  const qc = useQueryClient();
  return useMutation<BankStatement, Error, FormData>({
    mutationFn: (formData) =>
      apiClient
        .post(`${BASE}/upload-bank-statement`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-statements"] });
    },
  });
}

export function useDeleteBankStatement() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (statementId) =>
      apiClient.delete(`${BASE}/bank-statements/${statementId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-statements"] });
    },
  });
}
