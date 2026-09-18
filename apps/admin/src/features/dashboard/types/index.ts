export interface DashboardSummaryData {
  occupancy_rate: number;
  rent_collection_rate: number;
  pending_complaints_rate: number;
  revenue_overview: number;
}

export interface DashboardStatisticsData {
  total_hostels: number;
  total_buildings: number;
  total_floors: number;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  vacant_beds: number;
  total_tenants: number;
  todays_checkins: number;
  todays_checkouts: number;
  expiring_contracts: number;
  documents_pending: number;
  police_verification_pending: number;
  monthly_rent: number;
  collected_rent: number;
  total_revenue: number;
  pending_rent: number;
  advance_rent: number;
  todays_collection: number;
  pending_payments: number;
  open_complaints: number;
  resolved_complaints: number;
  active_notices: number;
}

export interface ChartItem {
  label: string;
  value: number;
}

export interface DashboardChartsData {
  monthly_rent_collection: ChartItem[];
  occupancy_rate: ChartItem[];
  complaint_status: ChartItem[];
  monthly_payment_trend: ChartItem[];
  beds_occupancy: ChartItem[];
  complaint_distribution: ChartItem[];
  tenant_growth?: ChartItem[];
  notice_activity?: ChartItem[];
}

export interface RecentPaymentData {
  id: string;
  tenant_name: string;
  room_number: string;
  amount: number;
  date: string;
  status: "PENDING" | "VERIFIED" | "PAID" | "REJECTED" | "UNDER_REVIEW" | "PARTIALLY_PAID" | "CANCELLED" | "FAILED" | "OVERDUE";
}

export interface RecentComplaintData {
  id: string;
  tenant_name: string;
  room_number: string;
  title: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  date: string;
}

export interface RecentNoticeData {
  id: string;
  title: string;
  content: string;
  target: string;
  published_at: string;
}

export interface ActivityLogData {
  id: string;
  user_name: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface RentCollectionTenantItem {
  tenant_id: string;
  tenant_display_id: string;
  tenant_name: string;
  tenant_mobile?: string | null;
  tenant_email?: string | null;
  tenant_photo?: string | null;
  hostel_id?: string | null;
  hostel_name?: string | null;
  building_id?: string | null;
  building_name?: string | null;
  floor_id?: string | null;
  floor_name?: string | null;
  room_id?: string | null;
  room_number?: string | null;
  bed_id?: string | null;
  bed_number?: string | null;
  rent_id: string;
  rent_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  rent_month: number;
  rent_year: number;
  status: "DUE_TODAY" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "UPCOMING";
  days_overdue?: number | null;
  days_until_due?: number | null;
  has_pending_payment: boolean;
  pending_payment_id?: string | null;
  pending_payment_amount?: number | null;
}

export interface DashboardRentCollectionData {
  due_today_count: number;
  expected_amount: number;
  collected_amount: number;
  pending_amount: number;
  overdue_count: number;
  upcoming_count: number;
  as_of_date: string;
  due_today: RentCollectionTenantItem[];
  overdue: RentCollectionTenantItem[];
  upcoming: RentCollectionTenantItem[];
}

