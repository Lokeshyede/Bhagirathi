/**
 * Security Dashboard API hooks — PAYMENT-9
 * All hooks use @tanstack/react-query consistent with the existing codebase.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SecurityDashboardStats {
  high_risk_payments: number;
  medium_risk_payments: number;
  low_risk_payments: number;
  critical_risk_payments: number;
  duplicate_utr_alerts: number;
  duplicate_screenshot_alerts: number;
  fraud_alerts: number;
  security_holds: number;
  locked_accounts: number;
  suspicious_users: number;
  average_risk_score: number;
  security_events_today: number;
}

export interface TriggeredRule {
  type: string;
  detail: string;
}

export interface HighRiskPayment {
  payment_id: string;
  payment_reference: string | null;
  tenant_name: string;
  tenant_email: string | null;
  amount: number;
  payment_date: string | null;
  status: string;
  payment_type: string | null;
  risk_score: number | null;
  risk_level: string | null;
  security_hold: boolean;
  security_notes: string | null;
  manual_override_reason: string | null;
  submitted_utr: string | null;
  proof_image_url: string | null;
  screenshot_hash: string | null;
  confidence_score: number | null;
  recommendation: string | null;
  is_fraud_flagged: boolean;
  is_duplicate: boolean;
  fraud_flags: string[];
  triggered_rules: TriggeredRule[];
  created_at: string | null;
}

export interface SecurityEvent {
  id: string;
  payment_id: string | null;
  event_type: string;
  risk_level: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  triggered_by: string | null;
  created_at: string | null;
}

export interface SecurityRule {
  id: string;
  rule_key: string;
  rule_name: string;
  description: string | null;
  is_enabled: boolean;
  threshold_value: number | null;
  threshold_unit: string | null;
  severity: string;
  updated_at: string | null;
}

export interface SuspiciousUser {
  tenant_id: string;
  tenant_name: string;
  email: string | null;
  phone: string | null;
  rejected_payments: number;
  duplicate_utr_events: number;
  screenshot_reuse_events: number;
  clarification_requests: number;
  security_holds_applied: number;
  active_security_holds: number;
  risk_score: number;
}

export interface PaymentSecurityDetail {
  payment: {
    id: string;
    payment_reference: string | null;
    status: string;
    payment_type: string | null;
    amount: number;
    payment_date: string | null;
    submitted_utr: string | null;
    proof_image_url: string | null;
    screenshot_hash: string | null;
    phash: string | null;
    created_at: string | null;
  };
  tenant: {
    tenant_id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  risk: {
    risk_score: number | null;
    risk_level: string | null;
    security_hold: boolean;
    security_notes: string | null;
    manual_override_reason: string | null;
  };
  reconciliation: {
    confidence_score: number | null;
    confidence_label: string | null;
    recommendation: string | null;
    is_fraud_flagged: boolean;
    is_duplicate: boolean;
    fraud_flags: string[];
    ai_summary: string | null;
    rule_breakdown: Record<string, unknown>[] | null;
  } | null;
  security_events: SecurityEvent[];
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function useSecurityDashboard() {
  return useQuery<SecurityDashboardStats>({
    queryKey: ["security", "dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/security/dashboard");
      return data;
    },
    refetchInterval: 30_000, // auto-refresh every 30s
    staleTime: 15_000,
  });
}

// ─── High Risk Payments ───────────────────────────────────────────────────────

export function useHighRiskPayments(params?: {
  riskLevels?: string;
  securityHoldOnly?: boolean;
  skip?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.riskLevels) q.set("risk_levels", params.riskLevels);
  if (params?.securityHoldOnly) q.set("security_hold_only", "true");
  if (params?.skip != null) q.set("skip", String(params.skip));
  if (params?.limit != null) q.set("limit", String(params.limit));

  return useQuery<{ total: number; items: HighRiskPayment[] }>({
    queryKey: ["security", "high-risk", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/security/high-risk?${q.toString()}`);
      return data;
    },
    refetchInterval: 30_000,
  });
}

// ─── Single Payment Security Detail ──────────────────────────────────────────

export function usePaymentSecurityDetail(paymentId: string | undefined) {
  return useQuery<PaymentSecurityDetail>({
    queryKey: ["security", "payment", paymentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/security/payment/${paymentId}`);
      return data;
    },
    enabled: !!paymentId,
  });
}

// ─── Security Events ──────────────────────────────────────────────────────────

export function useSecurityEvents(params?: {
  paymentId?: string;
  eventType?: string;
  riskLevel?: string;
  skip?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.paymentId) q.set("payment_id", params.paymentId);
  if (params?.eventType) q.set("event_type", params.eventType);
  if (params?.riskLevel) q.set("risk_level", params.riskLevel);
  if (params?.skip != null) q.set("skip", String(params.skip));
  if (params?.limit != null) q.set("limit", String(params.limit));

  return useQuery<{ total: number; items: SecurityEvent[] }>({
    queryKey: ["security", "events", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/security/events?${q.toString()}`);
      return data;
    },
    refetchInterval: 15_000,
  });
}

// ─── Security Rules ───────────────────────────────────────────────────────────

export function useSecurityRules() {
  return useQuery<SecurityRule[]>({
    queryKey: ["security", "rules"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/security/rules");
      return data;
    },
    staleTime: 60_000,
  });
}

export function useUpdateSecurityRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ruleKey,
      payload,
    }: {
      ruleKey: string;
      payload: Partial<Pick<SecurityRule, "is_enabled" | "threshold_value" | "threshold_unit" | "severity">>;
    }) => {
      const { data } = await apiClient.put(`/api/v1/security/rules/${ruleKey}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["security", "rules"] }),
  });
}

// ─── Suspicious Users ─────────────────────────────────────────────────────────

export function useSuspiciousUsers(params?: { minRiskScore?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.minRiskScore != null) q.set("min_risk_score", String(params.minRiskScore));
  if (params?.limit != null) q.set("limit", String(params.limit));

  return useQuery<{ total: number; items: SuspiciousUser[] }>({
    queryKey: ["security", "suspicious-users", params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/security/suspicious-users?${q.toString()}`);
      return data;
    },
    refetchInterval: 60_000,
  });
}

// ─── Manual Override ──────────────────────────────────────────────────────────

export function useManualOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      payment_id: string;
      reason: string;
      remarks?: string;
      confirm: true;
    }) => {
      const { data } = await apiClient.post("/api/v1/security/manual-override", payload);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["security"] });
      qc.invalidateQueries({ queryKey: ["security", "payment", vars.payment_id] });
    },
  });
}

// ─── Release Hold ─────────────────────────────────────────────────────────────

export function useReleaseHold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      payment_id: string;
      override_reason: string;
      confirm: true;
    }) => {
      const { data } = await apiClient.post("/api/v1/security/release-hold", payload);
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["security"] });
      qc.invalidateQueries({ queryKey: ["security", "payment", vars.payment_id] });
    },
  });
}

// ─── Re-analyze Payment ───────────────────────────────────────────────────────

export function useReanalyzePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await apiClient.post(`/api/v1/security/analyze/${paymentId}`);
      return data;
    },
    onSuccess: (_d, paymentId) => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["security", "payment", paymentId] }), 3000);
    },
  });
}
