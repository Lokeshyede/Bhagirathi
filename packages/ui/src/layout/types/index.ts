import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  /** If true, the group can be collapsed/expanded in the sidebar. Default: false */
  collapsible?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type?: "info" | "success" | "warning" | "danger" | "maintenance" | "reserved";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

export interface SearchOption {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  category: "hostel" | "building" | "floor" | "room" | "bed" | "tenant" | "payment" | "complaint" | "notice" | "action";
  onClick: () => void;
}

export interface SearchGroup {
  title: string;
  category: SearchOption["category"];
  items: SearchOption[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}
