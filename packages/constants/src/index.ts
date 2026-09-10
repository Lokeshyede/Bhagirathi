export enum UserRole {
  ADMIN = "ADMIN",
  TENANT = "TENANT",
  MAINTENANCE = "MAINTENANCE"
}

export enum ComplaintStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED"
}

export enum ComplaintPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum ComplaintCategory {
  ELECTRICITY = "Electricity",
  WATER = "Water",
  CLEANING = "Cleaning",
  FURNITURE = "Furniture",
  INTERNET = "Internet",
  BATHROOM = "Bathroom",
  ROOM = "Room",
  SECURITY = "Security",
  OTHER = "Other"
}

export enum BedStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum RentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  OVERDUE = "OVERDUE",
  PARTIALLY_PAID = "PARTIALLY_PAID"
}

export const THEME_COLORS = {
  primary: "rgb(239, 68, 68)", // Red-500
  secondary: "#ffffff",       // White
  accent: "#000000",          // Black
  border: "#e5e7eb",          // Gray-200
  success: "#22c55e",         // Green-500
  warning: "#f97316",         // Orange-500
  danger: "#ef4444"           // Red-500
};

export enum NoticeStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  EXPIRED = "EXPIRED",
  ARCHIVED = "ARCHIVED"
}

export enum NoticePriority {
  NORMAL = "NORMAL",
  IMPORTANT = "IMPORTANT",
  URGENT = "URGENT",
  EMERGENCY = "EMERGENCY"
}

export enum NoticeTargetType {
  ALL = "ALL",
  HOSTEL = "HOSTEL",
  BUILDING = "BUILDING",
  FLOOR = "FLOOR",
  ROOM = "ROOM",
  TENANT = "TENANT"
}
