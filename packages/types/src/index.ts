import { UserRole, NoticeStatus, NoticePriority, NoticeTargetType } from "@bhagirathi/constants";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User extends BaseEntity {
  user_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;   // backend sends 'phone'
  mobile?: string | null;  // kept as alias for older code
  role: UserRole;
  status: string;
  is_active: boolean;
  force_password_change?: boolean;
  last_login?: string | null;
  tenant_id?: string | null;
  maintenance_id?: string | null;
}

export interface MaintenanceStaff extends BaseEntity {
  staff_id?: string | null;
  user_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  specialty?: string | null;           // backend model field
  department?: string | null;          // alias for older code
  status: string;
  is_active?: boolean;
  assigned_building_ids?: string | null; // kept for UI
  notes?: string | null;                 // kept for UI
}

export interface UserProfile extends BaseEntity {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  access_token: string;   // backend sends snake_case
  refresh_token?: string;
  accessToken?: string;   // alias for older code
  token_type: string;
  tokenType?: string;     // alias for older code
  force_password_change?: boolean;
  user?: User;
}

export interface ApiErrorResponse {
  detail: string | { msg: string; loc: string[]; type: string }[];
}

export type HostelType = "BOYS" | "GIRLS" | "COED";
export type RoomType = "SINGLE" | "DOUBLE_SHARE" | "TRIPLE_SHARE" | "FOUR_SHARE";
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
export type BedStatus = "AVAILABLE" | "MAINTENANCE";
export type OccupancyStatus = "VACANT" | "OCCUPIED";

export interface Bed extends BaseEntity {
  room_id: string;
  bed_number: string;
  bed_status: BedStatus;
  occupancy_status: OccupancyStatus;
  is_active: boolean;
}

export interface Room extends BaseEntity {
  floor_id: string;
  room_number: string;
  room_type?: RoomType | string;
  room_rent?: number | string;
  capacity: number;
  active_occupants?: number;
  occupied_beds?: number;
  vacant_beds?: number;
  auto_split?: boolean;
  rent_split_type?: string;
  billing_cycle?: string;
  status: RoomStatus;
  is_active: boolean;
  beds?: Bed[];
  hostel_name?: string;
  building_name?: string;
  floor_name?: string;
  floor_number?: number;
  hostel_id?: string;
  building_id?: string;
  amenities?: string;
}

export interface RoomSummary {
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  maintenance_rooms: number;
  occupancy_percentage: number;
}

export interface Floor extends BaseEntity {
  building_id: string;
  floor_number: number;
  name: string;
  is_active: boolean;
  rooms?: Room[];
}

export interface Building extends BaseEntity {
  hostel_id: string;
  name: string;
  code?: string | null;
  is_active: boolean;
  floors?: Floor[];
}

export interface Hostel extends BaseEntity {
  name: string;
  address?: string | null;
  type: HostelType;
  is_active: boolean;
  buildings?: Building[];
}

export type TenantStatus = "ACTIVE" | "INACTIVE" | "CHECKED_OUT";
export type DocumentType =
  | "AADHAAR_FRONT"
  | "AADHAAR_BACK"
  | "TENANT_PHOTO"
  | "PAN"
  | "COLLEGE_ID"
  | "COMPANY_ID"
  | "AGREEMENT_PDF"
  | "OTHER";

export type DocumentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SECURITY_HOLD";

export interface TenantDocument extends BaseEntity {
  tenant_id: string;
  document_type: DocumentType | string;
  /** Cloudinary secure URL — primary field returned by backend */
  document_url: string;
  /** Alias for document_url — populated by backend's model_validator for backward compat */
  file_path?: string | null;
  status: DocumentVerificationStatus | string;
  created_at: string;
  updated_at: string;
}

export interface CheckInHistory extends BaseEntity {
  tenant_id: string;
  hostel_id?: string | null;
  room_id?: string | null;
  bed_id?: string | null;
  checkin_date: string;
  agreement_start_date: string;
  security_deposit: number;
  monthly_rent: number;
  advance_rent: number;
  remarks?: string | null;
  is_active: boolean;
}

export interface CheckOutHistory extends BaseEntity {
  tenant_id: string;
  checkin_history_id: string;
  checkout_date: string;
  reason: string;
  remarks?: string | null;
  is_active: boolean;
}

export interface Tenant extends BaseEntity {
  tenant_id?: string;        // alias; backend uses 'id' from BaseEntity
  user_id?: string | null;
  full_name: string;
  photo_url?: string | null;
  gender?: string | null;
  dob?: string | null;
  phone: string;             // backend field (was 'mobile' in old code)
  mobile?: string | null;    // kept as alias for older code
  email: string;
  aadhaar_number?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;  // backend field (was 'guardian_mobile')
  guardian_mobile?: string | null; // alias for older code
  emergency_contact?: string | null;
  permanent_address?: string | null;
  current_address?: string | null;
  occupation?: string | null;
  company_college?: string | null;
  blood_group?: string | null;
  joining_date?: string | null;
  status: TenantStatus;
  is_active: boolean;

  hostel_id?: string | null;
  room_id?: string | null;
  bed_id?: string | null;

  archived_at?: string | null;
  archived_by?: string | null;
  archived_by_name?: string | null;
  archive_reason?: string | null;
  original_status?: string | null;
  last_room_id?: string | null;
  last_bed_id?: string | null;
  last_hostel_id?: string | null;
}

export type RentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";

export interface RentItem extends BaseEntity {
  rent_id: string;
  name: string;
  amount: number;
  is_active: boolean;
}

export interface RentHistory extends BaseEntity {
  rent_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  remarks?: string | null;
  is_active: boolean;
}

export interface Rent extends BaseEntity {
  tenant_id: string;
  rent_month: number;
  rent_year: number;
  monthly_rent: number;
  security_deposit: number;
  discount: number;
  late_fee: number;
  previous_balance: number;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: RentStatus;
  remarks?: string | null;
  is_active: boolean;
  items?: RentItem[];
  history?: RentHistory[];
}

export interface RentDashboardStats {
  totalMonthlyRent: number;
  collectedRent: number;
  pendingRent: number;
  overdueRent: number;
  todayDue: number;
  totalDue: number;
  upcomingDue: number;
  collectionPercentage: number;
}

export type PaymentStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "CANCELLED";

export interface Payment extends BaseEntity {
  tenant_id: string;
  rent_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  upi_id?: string | null;
  utr_number: string;
  screenshot_path: string;
  status: PaymentStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  remarks?: string | null;
  
  // Joined fields
  tenant_name?: string;
  rent_month?: number;
  rent_year?: number;
  hostel_name?: string;
}

export interface PaymentReceipt extends BaseEntity {
  payment_id: string;
  receipt_number: string;
  generated_at: string;
  file_path?: string | null;
}

export interface PaymentReceiptDetails {
  id: string;
  receipt_number: string;
  generated_at: string;
  payment_amount: number;
  payment_date: string;
  payment_mode: string;
  utr_number: string;
  tenant_name: string;
  hostel_name: string;
  remarks?: string | null;
}

export interface PaymentHistoryItem {
  id: string;
  payment_id: string;
  status: PaymentStatus;
  remarks?: string | null;
  action_by?: string | null;
  action_at: string;
}

export interface PaymentDashboardStats {
  totalPendingVerificationCount: number;
  totalVerifiedCount: number;
  totalRejectedCount: number;
  totalPendingAmount: number;
  totalVerifiedAmount: number;
}

export type ComplaintStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplaintCategory = "Electricity" | "Water" | "Cleaning" | "Furniture" | "Internet" | "Bathroom" | "Room" | "Security" | "Other";

export interface Complaint extends BaseEntity {
  complaint_number?: string;
  tenant_id: string;
  room_id?: string | null;
  assigned_to?: string | null;           // backend sends 'assigned_to'
  assigned_maintenance_id?: string | null; // alias for older code
  category: string;
  priority: ComplaintPriority | string;
  severity?: string;
  title: string;
  description: string;
  status: ComplaintStatus | string;
  resolution_notes?: string | null;
  resolution_time?: number | null;
  closed_by?: string | null;
  closed_at?: string | null;

  // Relation arrays
  images?: ComplaintImage[];
  updates?: ComplaintHistoryItem[];      // backend sends 'updates'
  history?: ComplaintHistoryItem[];      // alias for older code
  assignments?: ComplaintAssignment[];

  // Flat joined fields for list rendering
  tenant_name?: string;
  room_number?: string;
  hostel_name?: string;
  maintenance_name?: string;
}

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  image_path: string;
  uploaded_by_role: string;
  created_at?: string;
  createdAt?: string;
}

export interface ComplaintHistoryItem {
  id: string;
  complaint_id: string;
  status: ComplaintStatus | string;
  update_notes: string;           // backend sends 'update_notes'
  remarks?: string | null;        // alias for older code
  updated_by?: string | null;     // backend sends 'updated_by'
  action_by?: string | null;      // alias for older code
  action_by_name?: string;
  created_at?: string;            // backend sends 'created_at'
  action_at?: string;             // alias for older code
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  maintenance_id: string;
  assigned_by?: string | null;
  assigned_at: string;
  is_active: boolean;
  maintenance_name?: string;
}

export interface ComplaintDashboardStats {
  totalCount: number;
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  rejectedCount: number;
  criticalCount: number;
}

export interface NoticeTarget extends BaseEntity {
  notice_id: string;
  target_type: NoticeTargetType;
  target_id?: string | null;
  target_val?: string | null;
}

export interface NoticeRead extends BaseEntity {
  notice_id: string;
  tenant_id: string;
  read_at: string;
}

export interface Notice extends BaseEntity {
  notice_number?: string;
  title: string;
  content: string;          // canonical field — backend always returns 'content'
  priority: NoticePriority | string;
  status: NoticeStatus | string;
  target_audience?: string;
  publish_date?: string | null;
  expiry_date?: string | null;
  is_pinned?: boolean;
  image_url?: string | null;
  targets?: any[] | null;
  created_by?: string;

  created_by_name?: string;
  is_read?: boolean;
  read_count?: number;
  target_count?: number;
  read_rate?: number;
}

export interface NoticeDashboardStats {
  totalCount: number;
  activeCount: number;
  scheduledCount: number;
  draftCount: number;
  readCount: number;
  overallReadRate: number;
}

export interface NoticeReadUser {
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  hostel_name: string;
  read_at?: string | null;
  is_read: boolean;
}

export interface NoticeReadStatistics {
  notice_id: string;
  total_targets: number;
  read_count: number;
  read_rate: number;
  readers: NoticeReadUser[];
}

export interface TenantRoomDetails {
  hostel_name?: string | null;
  building_name?: string | null;
  floor_name?: string | null;
  room_number?: string | null;
  room_type?: string | null;
  room_capacity?: number | null;
  bed_number?: string | null;
  monthly_rent?: number | null;
  security_deposit?: number | null;
  joining_date?: string | null;
}

export interface Notification extends BaseEntity {
  user_id: string;
  role: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  status: "UNREAD" | "READ" | "ARCHIVED";
  source_module: "RENT" | "PAYMENT" | "COMPLAINT" | "NOTICE" | "SYSTEM" | "ELECTRICITY";
  reference_id?: string | null;
  reference_type?: string | null;
  link?: string | null;
  notif_meta?: Record<string, any> | null;
  read_at?: string | null;
  archived_at?: string | null;
}

export interface NotificationUnreadCount {
  count: number;
}

export interface BedAllocation extends BaseEntity {
  tenant_id: string;
  hostel_id: string;
  building_id: string;
  floor_id: string;
  room_id: string;
  bed_id: string;
  allocation_date: string;
  checkout_date?: string | null;
  monthly_rent: number;
  security_deposit: number;
  agreement_start_date: string;
  agreement_end_date: string;
  remarks?: string | null;
  status: "ACTIVE" | "CHECKED_OUT" | "ARCHIVED";

  tenant_name?: string | null;
  hostel_name?: string | null;
  building_name?: string | null;
  floor_name?: string | null;
  room_number?: string | null;
  bed_number?: string | null;
}

export interface RoomTransfer extends BaseEntity {
  tenant_id: string;
  from_hostel_id?: string | null;
  from_building_id?: string | null;
  from_floor_id?: string | null;
  from_room_id?: string | null;
  from_bed_id?: string | null;
  to_hostel_id?: string | null;
  to_building_id?: string | null;
  to_floor_id?: string | null;
  to_room_id?: string | null;
  to_bed_id?: string | null;
  transfer_date: string;
  reason?: string | null;
  remarks?: string | null;
  status: string;
}

export interface BedTransferHistory extends BaseEntity {
  tenant_id: string;
  room_id?: string | null;
  from_bed_id?: string | null;
  to_bed_id?: string | null;
  transfer_date: string;
  reason?: string | null;
  remarks?: string | null;
  status: string;
}

export interface AllocationHistory {
  allocations: BedAllocation[];
  room_transfers: RoomTransfer[];
  bed_transfers: BedTransferHistory[];
}

export interface ElectricityBill extends BaseEntity {
  tenant_id: string;
  hostel_id?: string | null;
  building_id?: string | null;
  floor_id?: string | null;
  room_id?: string | null;
  meter_number?: string | null;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  rate_per_unit: number;
  units: number;
  unit_rate: number;
  my_share?: number;
  active_occupants?: number;
  bill_amount: number;
  bill_month: number;
  bill_year: number;
  generated_date: string;
  due_date: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  payment_status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "CANCELLED";
  payment_id?: string | null;
  remarks?: string | null;
  meter_photo?: string | null;
  is_active: boolean;

  // Joined display fields
  tenant_name?: string;
  hostel_name?: string;
  building_name?: string;
  floor_name?: string;
  room_number?: string;
}

export interface ElectricityDashboardStats {
  total_collection: number;
  pending_bills_amount: number;
  today_generated_count: number;
  paid_bills_count: number;
  overdue_bills_count: number;
  monthly_revenue: { month: number; year: number; amount: number }[];
  total_collected?: number;
  total?: number;
  pending?: number;
  paid?: number;
  overdue?: number;
  total_amount?: number;
}

export interface ArchivedTenantItem {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email: string;
  photo_url?: string | null;
  gender?: string | null;
  status: string;
  original_status?: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  archived_by_name?: string | null;
  archive_reason?: string | null;
  last_room_number?: string | null;
  last_bed_number?: string | null;
  last_hostel_name?: string | null;
  last_building_name?: string | null;
  last_floor_name?: string | null;
  joining_date?: string | null;
  created_at: string;
}

export interface ArchivedTenantsListResponse {
  items: ArchivedTenantItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ArchivedTenantDossier {
  tenant: {
    id: string;
    tenant_id: string;
    full_name: string;
    phone: string;
    email: string;
    photo_url?: string | null;
    gender?: string | null;
    dob?: string | null;
    aadhaar_number?: string | null;
    guardian_name?: string | null;
    guardian_phone?: string | null;
    emergency_contact?: string | null;
    permanent_address?: string | null;
    current_address?: string | null;
    occupation?: string | null;
    company_college?: string | null;
    blood_group?: string | null;
    joining_date?: string | null;
    status: string;
    original_status?: string | null;
    is_active: boolean;
    archived_at?: string | null;
    archived_by?: string | null;
    archived_by_name?: string | null;
    archive_reason?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  room_history: Array<{
    id: string;
    room_id: string;
    room_number: string;
    bed_id?: string | null;
    bed_number: string;
    floor_name: string;
    building_name: string;
    hostel_name: string;
    start_date?: string | null;
    end_date?: string | null;
    allocation_type: string;
    is_active: boolean;
    status: string;
  }>;
  rent_history: Array<{
    id: string;
    rent_month: number;
    rent_year: number;
    amount: number;
    monthly_rent: number;
    security_deposit: number;
    discount: number;
    late_fee: number;
    previous_balance: number;
    total_amount: number;
    paid_amount: number;
    outstanding_amount: number;
    due_date?: string | null;
    status: string;
    remarks?: string | null;
    created_at?: string | null;
  }>;
  payment_history: Array<{
    id: string;
    amount: number;
    total_amount: number;
    rent_share: number;
    electricity_share: number;
    other_charges: number;
    fine: number;
    security_deposit: number;
    payment_date?: string | null;
    submission_date?: string | null;
    verification_date?: string | null;
    payment_method: string;
    payment_status: string;
    verification_status: string;
    transaction_id?: string | null;
    utr?: string | null;
    proof_image_url?: string | null;
    payment_reference?: string | null;
    payment_type?: string | null;
    billing_month?: string | null;
    billing_year?: number | null;
    created_at?: string | null;
  }>;
  electricity_bills: Array<{
    id: string;
    room_id: string;
    room_number: string;
    bill_month: number;
    bill_year: number;
    billing_month: string;
    bill_amount: number;
    status: string;
    previous_reading: number;
    current_reading: number;
    units: number;
    unit_rate: number;
    due_date?: string | null;
    occupant_count: number;
    created_at?: string | null;
  }>;
  electricity_payments: Array<{
    id: string;
    payment_id: string;
    amount: number;
    payment_date?: string | null;
    payment_method: string;
    verification_status: string;
    transaction_id?: string | null;
    billing_month?: string | null;
    billing_year?: number | null;
    created_at?: string | null;
  }>;
  complaints: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    description: string;
    resolution_notes?: string | null;
    resolution_time?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    updates: Array<{
      id: string;
      status: string;
      update_notes: string;
      updater_name: string;
      created_at?: string | null;
    }>;
  }>;
  contracts: Array<{
    id: string;
    contract_number: string;
    room_id?: string | null;
    room_number: string;
    start_date?: string | null;
    end_date?: string | null;
    rent_amount: number;
    security_deposit: number;
    agreement_url?: string | null;
    status: string;
    created_at?: string | null;
  }>;
  documents: Array<{
    id: string;
    document_type: string;
    document_url: string;
    status: string;
    created_at?: string | null;
  }>;
  receipts: Array<{
    id: string;
    receipt_number: string;
    receipt_type: string;
    pdf_url?: string | null;
    status: string;
    generated_at?: string | null;
    verification_url?: string | null;
    payment_id: string;
  }>;
  audit_history: Array<{
    id: string;
    action: string;
    table_name: string;
    record_id?: string | null;
    old_values?: any;
    new_values?: any;
    actor_name: string;
    created_at?: string | null;
  }>;
}



