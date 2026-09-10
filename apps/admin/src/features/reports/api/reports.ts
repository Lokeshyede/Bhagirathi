import { apiClient } from "@bhagirathi/api-client";
import type {
  DashboardResponse,
  OccupancyReport,
  TenantReport,
  RentReport,
  PaymentReport,
  ComplaintReport,
  NoticeReport,
  ElectricityReport,
  ContractReport,
  AuditReport,
  ReportFilters,
  ExportRequest,
} from "../types";

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE = "/api/v1/reports";

// ─── Filter → Query String ────────────────────────────────────────────────────
function filtersToParams(filters: ReportFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.date_from)        params.date_from        = filters.date_from;
  if (filters.date_to)          params.date_to          = filters.date_to;
  if (filters.hostel_id)        params.hostel_id        = filters.hostel_id;
  if (filters.building_id)      params.building_id      = filters.building_id;
  if (filters.floor_id)         params.floor_id         = filters.floor_id;
  if (filters.room_id)          params.room_id          = filters.room_id;
  if (filters.tenant_status)    params.tenant_status    = filters.tenant_status;
  if (filters.payment_status)   params.payment_status   = filters.payment_status;
  if (filters.complaint_status) params.complaint_status = filters.complaint_status;
  if (filters.priority)         params.priority         = filters.priority;
  if (filters.page)             params.page             = String(filters.page);
  if (filters.page_size)        params.page_size        = String(filters.page_size);
  if (filters.sort_by)          params.sort_by          = filters.sort_by;
  if (filters.sort_dir)         params.sort_dir         = filters.sort_dir!;
  return params;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>(`${BASE}/dashboard`);
  return data;
}

// ─── Occupancy ────────────────────────────────────────────────────────────────
export async function fetchOccupancy(filters: ReportFilters): Promise<OccupancyReport> {
  const { data } = await apiClient.get<OccupancyReport>(`${BASE}/occupancy`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export async function fetchTenants(filters: ReportFilters): Promise<TenantReport> {
  const { data } = await apiClient.get<TenantReport>(`${BASE}/tenants`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Rents ────────────────────────────────────────────────────────────────────
export async function fetchRents(filters: ReportFilters): Promise<RentReport> {
  const { data } = await apiClient.get<RentReport>(`${BASE}/rents`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export async function fetchPayments(filters: ReportFilters): Promise<PaymentReport> {
  const { data } = await apiClient.get<PaymentReport>(`${BASE}/payments`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Complaints ───────────────────────────────────────────────────────────────
export async function fetchComplaints(filters: ReportFilters): Promise<ComplaintReport> {
  const { data } = await apiClient.get<ComplaintReport>(`${BASE}/complaints`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Notices ──────────────────────────────────────────────────────────────────
export async function fetchNotices(filters: ReportFilters): Promise<NoticeReport> {
  const { data } = await apiClient.get<NoticeReport>(`${BASE}/notices`, {
    params: filtersToParams(filters),
  });
  return data;
}
// ─── Electricity ──────────────────────────────────────────────────────────────
export async function fetchElectricity(filters: ReportFilters): Promise<ElectricityReport> {
  const { data } = await apiClient.get<ElectricityReport>(`${BASE}/electricity`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export async function fetchContracts(filters: ReportFilters): Promise<ContractReport> {
  const { data } = await apiClient.get<ContractReport>(`${BASE}/contracts`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export async function fetchAudit(filters: ReportFilters): Promise<AuditReport> {
  const { data } = await apiClient.get<AuditReport>(`${BASE}/audit`, {
    params: filtersToParams(filters),
  });
  return data;
}

// ─── Export PDF ───────────────────────────────────────────────────────────────
export async function exportPdf(body: ExportRequest): Promise<Blob> {
  const { data } = await apiClient.post(`${BASE}/export/pdf`, body, {
    responseType: "blob",
  });
  return data;
}

// ─── Export Excel ─────────────────────────────────────────────────────────────
export async function exportExcel(body: ExportRequest): Promise<Blob> {
  const { data } = await apiClient.post(`${BASE}/export/excel`, body, {
    responseType: "blob",
  });
  return data;
}

// ─── Download Blob Helper ─────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
