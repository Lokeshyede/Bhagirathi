// ─── Global Filter Types ──────────────────────────────────────────────────────
export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  hostel_id?: string;
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  tenant_status?: string;
  payment_status?: string;
  complaint_status?: string;
  priority?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

// ─── Chart Types ──────────────────────────────────────────────────────────────
export interface ChartPoint {
  label: string;
  value: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardMetrics {
  total_hostels: number;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  vacant_beds: number;
  occupancy_rate: number;
  active_tenants: number;
  new_checkins: number;
  recent_checkouts: number;
  monthly_revenue: number;
  pending_rent: number;
  collected_rent: number;
  overdue_rent: number;
  rent_collection_rate: number;
  pending_payments: number;
  verified_payments: number;
  rejected_payments: number;
  open_complaints: number;
  resolved_complaints: number;
  pending_complaints: number;
  published_notices: number;
  total_notice_reads: number;
}

export interface DashboardCharts {
  monthly_revenue: ChartPoint[];
  occupancy_trend: ChartPoint[];
  rent_collection_trend: ChartPoint[];
  payment_trend: Array<{ label: string; verified: number; rejected: number }>;
  complaint_trend: Array<{ label: string; open: number; resolved: number }>;
  notice_engagement: Array<{ label: string; reads: number; published: number }>;
  tenant_growth: ChartPoint[];
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  charts: DashboardCharts;
}

// ─── Occupancy ────────────────────────────────────────────────────────────────
export interface OccupancyRow {
  hostel_id: string | null;
  hostel_name: string;
  building_id: string | null;
  building_name: string;
  floor_id: string | null;
  floor_name: string;
  room_id: string | null;
  room_number: string;
  room_type: string;
  room_capacity: number;
  bed_id: string | null;
  bed_number: string;
  bed_status: string;
  occupancy_status: string;
  tenant_id: string | null;
  tenant_name: string | null;
  tenant_mobile: string | null;
  joining_date: string | null;
}

export interface OccupancyReport {
  total: number;
  page: number;
  pages: number;
  data: OccupancyRow[];
  summary: {
    total_beds: number;
    occupied_beds: number;
    vacant_beds: number;
    occupancy_rate: number;
  };
}

// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface TenantRow {
  tenant_id: string;
  tenant_code: string;
  full_name: string;
  mobile: string;
  email: string;
  gender: string;
  status: string;
  hostel_name: string | null;
  room_number: string | null;
  bed_number: string | null;
  joining_date: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  monthly_rent: number | null;
}

export interface TenantReport {
  total: number;
  page: number;
  pages: number;
  data: TenantRow[];
  summary: {
    active: number;
    inactive: number;
    checked_out: number;
    total: number;
  };
}

// ─── Rent ─────────────────────────────────────────────────────────────────────
export interface RentRow {
  rent_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
  hostel_name: string | null;
  room_number: string | null;
  rent_month: number;
  rent_year: number;
  monthly_rent: number;
  discount: number;
  late_fee: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  due_date: string | null;
  status: string;
}

export interface RentReport {
  total: number;
  page: number;
  pages: number;
  data: RentRow[];
  summary: {
    total_billed: number;
    total_paid: number;
    total_pending: number;
    total_overdue: number;
  };
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface PaymentRow {
  payment_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
  hostel_name: string | null;
  amount: number;
  payment_date: string | null;
  payment_mode: string;
  utr_number: string;
  status: string;
  verified_by: string | null;
  remarks: string | null;
}

export interface PaymentReport {
  total: number;
  page: number;
  pages: number;
  data: PaymentRow[];
  summary: {
    total_collected: number;
    pending: number;
    verified: number;
    rejected: number;
  };
}

// ─── Complaint ────────────────────────────────────────────────────────────────
export interface ComplaintRow {
  complaint_id: string;
  complaint_number: string;
  tenant_name: string;
  tenant_code: string;
  room_number: string | null;
  category: string;
  priority: string;
  title: string;
  status: string;
  created_at: string | null;
  closed_at: string | null;
}

export interface ComplaintReport {
  total: number;
  page: number;
  pages: number;
  data: ComplaintRow[];
  summary: {
    open: number;
    resolved: number;
    pending: number;
    category_summary: Record<string, number>;
  };
}

// ─── Notice ───────────────────────────────────────────────────────────────────
export interface NoticeRow {
  notice_id: string;
  notice_number: string;
  title: string;
  priority: string;
  status: string;
  publish_date: string | null;
  expiry_date: string | null;
  total_reads: number;
  created_at: string | null;
}

export interface NoticeReport {
  total: number;
  page: number;
  pages: number;
  data: NoticeRow[];
  summary: {
    published: number;
    scheduled: number;
    total_reads: number;
    unique_reads: number;
  };
}

// ─── Export Types ─────────────────────────────────────────────────────────────
export type ExportFormat = "pdf" | "excel";

export type ReportType =
  | "occupancy"
  | "tenants"
  | "rents"
  | "payments"
  | "complaints"
  | "notices"
  | "electricity"
  | "contracts"
  | "audit";

export interface ExportRequest {
  report_type: ReportType;
  format: ExportFormat;
  filters?: ReportFilters;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
export type ReportTab =
  | "dashboard"
  | "occupancy"
  | "tenants"
  | "rents"
  | "payments"
  | "complaints"
  | "notices"
  | "electricity"
  | "contracts"
  | "audit";

// ─── Electricity ──────────────────────────────────────────────────────────────
export interface ElectricityRow {
  bill_id: string;
  room_number: string;
  hostel_name: string;
  billing_period: string;
  bill_amount: number;
  status: string;
  meter_reading_before: number;
  meter_reading_after: number;
  paid_amount: number;
  balance: number;
}

export interface ElectricityReport {
  total: number;
  page: number;
  pages: number;
  data: ElectricityRow[];
  summary: {
    total_billed: number;
    total_paid: number;
    total_pending: number;
    total_overdue: number;
  };
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export interface ContractRow {
  contract_id: string;
  tenant_name: string;
  tenant_code: string;
  room_number: string;
  hostel_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  security_deposit: number;
  status: string;
}

export interface ContractReport {
  total: number;
  page: number;
  pages: number;
  data: ContractRow[];
  summary: {
    active_contracts: number;
    expired_contracts: number;
    upcoming_expiry_count: number;
    total_deposits: number;
  };
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export interface AuditRow {
  log_id: string;
  performed_by: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
  ip_address: string | null;
  details: string | null;
}

export interface AuditReport {
  total: number;
  page: number;
  pages: number;
  data: AuditRow[];
  summary: {
    total_logs: number;
    unique_users: number;
    critical_actions: number;
  };
}

