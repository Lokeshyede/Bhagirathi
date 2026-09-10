import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchDashboard,
  fetchOccupancy,
  fetchTenants,
  fetchRents,
  fetchPayments,
  fetchComplaints,
  fetchNotices,
  fetchElectricity,
  fetchContracts,
  fetchAudit,
  exportPdf,
  exportExcel,
  downloadBlob,
} from "../api/reports";
import type { ReportFilters, ExportRequest, ReportType, ExportFormat } from "../types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const reportKeys = {
  dashboard:  ["reports", "dashboard"]           as const,
  occupancy:  (f: ReportFilters) => ["reports", "occupancy",  f] as const,
  tenants:    (f: ReportFilters) => ["reports", "tenants",    f] as const,
  rents:      (f: ReportFilters) => ["reports", "rents",      f] as const,
  payments:   (f: ReportFilters) => ["reports", "payments",   f] as const,
  complaints: (f: ReportFilters) => ["reports", "complaints", f] as const,
  notices:    (f: ReportFilters) => ["reports", "notices",    f] as const,
  electricity:(f: ReportFilters) => ["reports", "electricity", f] as const,
  contracts:  (f: ReportFilters) => ["reports", "contracts",  f] as const,
  audit:      (f: ReportFilters) => ["reports", "audit",      f] as const,
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useReportsDashboard() {
  return useQuery({
    queryKey: reportKeys.dashboard,
    queryFn:  fetchDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ─── Occupancy ────────────────────────────────────────────────────────────────
export function useOccupancyReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.occupancy(filters),
    queryFn:  () => fetchOccupancy(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export function useTenantsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.tenants(filters),
    queryFn:  () => fetchTenants(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Rents ────────────────────────────────────────────────────────────────────
export function useRentsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.rents(filters),
    queryFn:  () => fetchRents(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export function usePaymentsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.payments(filters),
    queryFn:  () => fetchPayments(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Complaints ───────────────────────────────────────────────────────────────
export function useComplaintsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.complaints(filters),
    queryFn:  () => fetchComplaints(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Notices ──────────────────────────────────────────────────────────────────
export function useNoticesReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.notices(filters),
    queryFn:  () => fetchNotices(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
// ─── Electricity ──────────────────────────────────────────────────────────────
export function useElectricityReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.electricity(filters),
    queryFn:  () => fetchElectricity(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export function useContractsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.contracts(filters),
    queryFn:  () => fetchContracts(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export function useAuditReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.audit(filters),
    queryFn:  () => fetchAudit(filters),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ─── Export Hook ──────────────────────────────────────────────────────────────
export function useExportReport() {
  const pdfMutation = useMutation({
    mutationFn: (req: ExportRequest) => exportPdf(req),
    onSuccess: (blob, req) => {
      downloadBlob(blob, `bhagirathi_${req.report_type}_report.pdf`);
    },
  });

  const excelMutation = useMutation({
    mutationFn: (req: ExportRequest) => exportExcel(req),
    onSuccess: (blob, req) => {
      downloadBlob(blob, `bhagirathi_${req.report_type}_report.xlsx`);
    },
  });

  const doExport = (
    format: ExportFormat,
    report_type: ReportType,
    filters?: ReportFilters,
  ) => {
    const req: ExportRequest = { format, report_type, filters };
    if (format === "pdf") {
      pdfMutation.mutate(req);
    } else {
      excelMutation.mutate(req);
    }
  };

  return {
    doExport,
    isPdfLoading:   pdfMutation.isPending,
    isExcelLoading: excelMutation.isPending,
    isLoading:      pdfMutation.isPending || excelMutation.isPending,
    pdfError:       pdfMutation.error,
    excelError:     excelMutation.error,
  };
}
