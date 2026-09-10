import { z } from "zod";
import { UserRole } from "@bhagirathi/constants";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Please select a valid login role" })
  })
});

export type LoginInput = z.infer<typeof loginSchema>;

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters long")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .regex(/[@$!%*?&]/, "New password must contain at least one special character (@$!%*?&)"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const hostelSchema = z.object({
  name: z.string().min(1, "Hostel name is required"),
  address: z.string().optional(),
  type: z.enum(["BOYS", "GIRLS", "COED"], {
    errorMap: () => ({ message: "Select a valid hostel gender type" })
  }),
});

export type HostelInput = z.infer<typeof hostelSchema>;

export const buildingSchema = z.object({
  hostel_id: z.string().uuid("Invalid hostel association"),
  name: z.string().min(1, "Building name is required"),
  code: z.string().optional(),
});

export type BuildingInput = z.infer<typeof buildingSchema>;

export const floorSchema = z.object({
  building_id: z.string().uuid("Invalid building association"),
  floor_number: z.coerce.number().int().min(0, "Floor number must be zero or positive"),
  name: z.string().min(1, "Floor name is required"),
});

export type FloorInput = z.infer<typeof floorSchema>;

export const roomSchema = z.object({
  floor_id: z.string().uuid("Invalid floor association"),
  room_number: z.string().min(1, "Room number is required"),
  room_rent: z.coerce.number().positive("Room rent must be positive"),
  room_type: z.enum(["SINGLE", "DOUBLE_SHARE", "TRIPLE_SHARE", "FOUR_SHARE"]),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]).default("AVAILABLE"),
  billing_cycle: z.enum(["MONTHLY", "WEEKLY"]).default("MONTHLY"),
  rent_split_type: z.enum(["EQUAL", "CUSTOM"]).default("EQUAL"),
  room_category: z.string().optional(),
  amenities: z.string().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;

export const bedSchema = z.object({
  room_id: z.string().uuid("Invalid room association"),
  bed_number: z.string().min(1, "Bed number is required"),
  bed_status: z.enum(["AVAILABLE", "MAINTENANCE"]).default("AVAILABLE"),
  occupancy_status: z.enum(["VACANT", "OCCUPIED"]).default("VACANT"),
});

export type BedInput = z.infer<typeof bedSchema>;

export const tenantSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  photo_url: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    errorMap: () => ({ message: "Select a valid gender" })
  }),
  dob: z.string().min(1, "Date of birth is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit number"),
  email: z.string().email("Invalid email format"),
  aadhaar_number: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  guardian_name: z.string().min(1, "Guardian name is required"),
  guardian_mobile: z.string().regex(/^[6-9]\d{9}$/, "Guardian mobile must be a valid 10-digit number"),
  emergency_contact: z.string().optional().nullable(),
  permanent_address: z.string().min(1, "Permanent address is required"),
  current_address: z.string().optional().nullable(),
  occupation: z.string().min(1, "Occupation details are required"),
  company_college: z.string().optional().nullable(),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""]).optional().nullable(),
  joining_date: z.string().min(1, "Joining date is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "CHECKED_OUT"]).default("ACTIVE"),
});

export type TenantInput = z.infer<typeof tenantSchema>;

export const checkInSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant association"),
  hostel_id: z.string().uuid("Select a valid hostel"),
  building_id: z.string().uuid("Select a valid building"),
  floor_id: z.string().uuid("Select a valid floor"),
  room_id: z.string().uuid("Select a valid room"),
  bed_id: z.string().uuid("Select a valid bed"),
  checkin_date: z.string().min(1, "Check-in date is required"),
  agreement_start_date: z.string().min(1, "Agreement start date is required"),
  security_deposit: z.coerce.number().min(0, "Deposit must be positive"),
  monthly_rent: z.coerce.number().min(0, "Rent must be positive"),
  advance_rent: z.coerce.number().min(0, "Advance must be positive"),
  remarks: z.string().optional().nullable(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const checkOutSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant association"),
  checkout_date: z.string().min(1, "Check-out date is required"),
  reason: z.string().min(1, "Reason is required"),
  remarks: z.string().optional().nullable(),
});

export type CheckOutInput = z.infer<typeof checkOutSchema>;

export const tenantDocumentSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant association"),
  document_type: z.enum(["AADHAAR_FRONT", "AADHAAR_BACK", "PHOTO", "AGREEMENT", "OTHER"]),
  file_path: z.string().min(1, "File path is required"),
});

export type TenantDocumentInput = z.infer<typeof tenantDocumentSchema>;

export const rentSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant association"),
  rent_month: z.coerce.number().min(1, "Month must be between 1 and 12").max(12),
  rent_year: z.coerce.number().min(2000, "Invalid year").max(2100),
  monthly_rent: z.coerce.number().min(0, "Rent must be positive"),
  security_deposit: z.coerce.number().min(0, "Deposit must be positive").default(0),
  discount: z.coerce.number().min(0, "Discount must be positive").default(0),
  late_fee: z.coerce.number().min(0, "Late fee must be positive").default(0),
  previous_balance: z.coerce.number().min(0, "Balance must be positive").default(0),
  due_date: z.string().min(1, "Due date is required"),
  remarks: z.string().optional().nullable(),
});

export type RentInput = z.infer<typeof rentSchema>;

export const generateRentSchema = z.object({
  rent_month: z.coerce.number().min(1, "Month must be between 1 and 12").max(12),
  rent_year: z.coerce.number().min(2000, "Invalid year").max(2100),
  due_date: z.string().min(1, "Due date is required"),
});

export type GenerateRentInput = z.infer<typeof generateRentSchema>;

export const rentPaymentSchema = z.object({
  amount_paid: z.coerce.number().min(1, "Payment must be at least 1"),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_method: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER"]),
  remarks: z.string().optional().nullable(),
});

export type RentPaymentInput = z.infer<typeof rentPaymentSchema>;

export const roomTransferSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant association"),
  to_hostel_id: z.string().uuid("Select a valid destination hostel"),
  to_building_id: z.string().uuid("Select a valid destination building"),
  to_floor_id: z.string().uuid("Select a valid destination floor"),
  to_room_id: z.string().uuid("Select a valid destination room"),
  to_bed_id: z.string().uuid("Select a valid destination bed"),
  transfer_date: z.string().min(1, "Transfer date is required"),
  reason: z.string().min(1, "Reason is required"),
  remarks: z.string().optional().nullable(),
});

export type RoomTransferInput = z.infer<typeof roomTransferSchema>;

export const bedTransferSchema = z.object({
  tenant_id: z.string().uuid("Invalid tenant association"),
  to_bed_id: z.string().uuid("Select a valid destination bed"),
  transfer_date: z.string().min(1, "Transfer date is required"),
  reason: z.string().min(1, "Reason is required"),
  remarks: z.string().optional().nullable(),
});

export type BedTransferInput = z.infer<typeof bedTransferSchema>;

export const loginCredentialsSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirmPassword: z.string(),
  forcePasswordChange: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginCredentialsInput = z.infer<typeof loginCredentialsSchema>;

export const forceChangePasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters long")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .regex(/[@$!%*?&]/, "New password must contain at least one special character (@$!%*?&)"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export type ForceChangePasswordInput = z.infer<typeof forceChangePasswordSchema>;

export const maintenanceStaffSchema = z.object({
  full_name: z.string().min(1, "Employee Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Phone number must be a valid 10-digit number"),
  email: z.string().email("Invalid email format"),
  department: z.enum(["ELECTRICAL", "PLUMBING", "CLEANING", "CARPENTRY", "SECURITY", "GENERAL"]),
  assigned_building_ids: z.string().optional().nullable(), // JSON array
  notes: z.string().optional().nullable(),
  // Credentials
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirm_password: z.string(),
  force_password_change: z.boolean().default(true),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type MaintenanceStaffInput = z.infer<typeof maintenanceStaffSchema>;

export const adminResetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirm_password: z.string(),
  force_password_change: z.boolean().default(true),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;
