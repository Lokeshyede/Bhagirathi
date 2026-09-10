import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Building2, Users, Receipt, CreditCard,
  MessageSquare, Megaphone, Download, Printer,
  AlertTriangle, CheckCircle2,
  XCircle, Clock, IndianRupee, Home, ChevronRight, Zap, ShieldAlert, FileText
} from "lucide-react";
import { ReportsDashboard } from "../components/ReportsDashboard";
import { ReportFilters }    from "../components/ReportFilters";
import { ExportDialog }     from "../components/ExportDialog";
import { PrintDialog }      from "../components/PrintDialog";
import ReportTable          from "../components/ReportTable";
import { StatisticsCards }  from "../components/StatisticsCards";
import { useReportFilterStore } from "../store/filters";
import { Button } from "@bhagirathi/ui";
import {
  useOccupancyReport,
  useTenantsReport,
  useRentsReport,
  usePaymentsReport,
  useComplaintsReport,
  useNoticesReport,
  useElectricityReport,
  useContractsReport,
  useAuditReport,
} from "../hooks/useReports";
import type {
  ReportTab, ReportType,
  OccupancyRow, TenantRow, RentRow, PaymentRow, ComplaintRow, NoticeRow,
  ElectricityRow, ContractRow, AuditRow
} from "../types";
import type { TableColumn } from "../components/ReportTable";

// ─── Badge Helpers ────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    ACTIVE:        "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    OCCUPIED:      "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    VERIFIED:      "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    PAID:          "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    RESOLVED:      "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    PUBLISHED:     "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",
    CLOSED:        "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-950/30",

    PENDING:       "bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-200 dark:border-amber-955/30",
    PARTIALLY_PAID:"bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-200 dark:border-amber-955/30",
    UNDER_REVIEW:  "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
    IN_PROGRESS:   "bg-blue-50 text-blue-755 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
    SCHEDULED:     "bg-blue-50 text-blue-755 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
    ASSIGNED:      "bg-purple-50 text-purple-750 dark:bg-purple-955/20 dark:text-purple-400 border border-purple-150/40",

    OVERDUE:       "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    OPEN:          "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    REJECTED:      "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",

    INACTIVE:      "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    CHECKED_OUT:   "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    VACANT:        "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    CANCELLED:     "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    EXPIRED:       "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    ARCHIVED:      "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    DRAFT:         "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
    MAINTENANCE:   "bg-orange-50 text-orange-700 dark:bg-orange-955/20 dark:text-orange-400 border border-orange-200 dark:border-orange-955/30",

    CRITICAL:      "bg-red-50 text-red-750 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-955/30",
    HIGH:          "bg-orange-50 text-orange-700 dark:bg-orange-955/20 dark:text-orange-400 border border-orange-200 dark:border-orange-955/30",
    MEDIUM:        "bg-blue-50 text-blue-750 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-150/40",
    LOW:           "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800",
  };
  const cls = map[(status ?? "UNKNOWN").toUpperCase()] ?? "bg-gray-50 text-secondaryText dark:bg-gray-800 dark:text-gray-400 border border-border dark:border-gray-800";
  return (
    <span className={`pg-badge text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider select-none ${cls}`}>
      {(status ?? "UNKNOWN").replace(/_/g, " ")}
    </span>
  );
};

// ─── Currency ─────────────────────────────────────────────────────────────────
const Rupee: React.FC<{ amount: number }> = ({ amount }) => (
  <span className="font-bold text-xs tabular-nums text-primaryText dark:text-white">
    ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
  </span>
);

// ─── Tab Config ───────────────────────────────────────────────────────────────
interface TabItem {
  id:    ReportTab;
  label: string;
  icon:  React.ElementType;
}

const TABS: TabItem[] = [
  { id: "dashboard",   label: "Dashboard",   icon: BarChart3     },
  { id: "payments",    label: "Payments",    icon: CreditCard    },
  { id: "rents",       label: "Revenue",     icon: Receipt       },
  { id: "electricity", label: "Electricity", icon: Zap           },
  { id: "occupancy",   label: "Occupancy",   icon: Building2     },
  { id: "tenants",     label: "Tenants",     icon: Users         },
  { id: "contracts",   label: "Contracts",   icon: FileText      },
  { id: "audit",       label: "Audit Logs",  icon: ShieldAlert   },
  { id: "complaints",  label: "Complaints",  icon: MessageSquare },
  { id: "notices",     label: "Notices",     icon: Megaphone     },
];

// ─── Reports Page ─────────────────────────────────────────────────────────────
const ReportsPage: React.FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const { activeTab, setActiveTab, filters, setFilters } = useReportFilterStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen,  setPrintOpen]  = useState(false);

  // Sync route param with Zustand store activeTab
  useEffect(() => {
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab as ReportTab);
    }
  }, [tab, setActiveTab]);

  // ── Fetch active report data ───────────────────────────────────────────
  const occupancy   = useOccupancyReport(filters);
  const tenants     = useTenantsReport(filters);
  const rents       = useRentsReport(filters);
  const payments    = usePaymentsReport(filters);
  const complaints  = useComplaintsReport(filters);
  const notices     = useNoticesReport(filters);
  const electricity = useElectricityReport(filters);
  const contracts   = useContractsReport(filters);
  const audit       = useAuditReport(filters);

  // Active report type for export (never 'dashboard')
  const exportType: ReportType =
    activeTab === "dashboard" ? "occupancy" : activeTab as ReportType;

  // ── Column Definitions ────────────────────────────────────────────────
  const occupancyCols: TableColumn<OccupancyRow>[] = [
    { key: "hostel_name",    label: "Hostel",      sortable: true },
    { key: "building_name",  label: "Building",    sortable: true },
    { key: "floor_name",     label: "Floor",       sortable: true },
    { key: "room_number",    label: "Room",        sortable: true },
    { key: "room_type",      label: "Type",        render: (v) => <StatusBadge status={v as string} /> },
    { key: "bed_number",     label: "Bed",         sortable: true },
    {
      key: "occupancy_status", label: "Status",
      render: (v) => <StatusBadge status={v as string} />,
    },
    { key: "tenant_name",   label: "Tenant",      sortable: true, render: (v) => v ? String(v) : <span className="text-muted text-xs">Vacant</span> },
    { key: "joining_date",  label: "Since",       render: (v) => v ? String(v) : "—" },
  ];

  const tenantCols: TableColumn<TenantRow>[] = [
    { key: "tenant_code", label: "ID",      sortable: true },
    { key: "full_name",   label: "Name",    sortable: true },
    { key: "mobile",      label: "Mobile" },
    { key: "email",       label: "Email",  render: (v) => <span className="text-xs text-secondaryText truncate block max-w-[120px]">{String(v)}</span> },
    { key: "gender",      label: "Gender" },
    { key: "status",      label: "Status",  render: (v) => <StatusBadge status={v as string} /> },
    { key: "hostel_name", label: "Hostel",  sortable: true, render: (v) => v ? String(v) : "—" },
    { key: "room_number", label: "Room",    render: (v) => v ? String(v) : "—" },
    { key: "joining_date",label: "Joining", sortable: true, render: (v) => v ? String(v) : "—" },
    {
      key: "monthly_rent", label: "Rent",
      align: "right",
      render: (v) => v ? <Rupee amount={v as number} /> : "—",
    },
  ];

  const rentCols: TableColumn<RentRow>[] = [
    { key: "tenant_code",  label: "Tenant ID", sortable: true },
    { key: "tenant_name",  label: "Name",      sortable: true },
    { key: "hostel_name",  label: "Hostel",    render: (v) => v ? String(v) : "—" },
    { key: "room_number",  label: "Room",      render: (v) => v ? String(v) : "—" },
    { key: "rent_month",   label: "Month",     render: (_v, row) => `${row.rent_month}/${row.rent_year}` },
    { key: "total_amount", label: "Total",  align: "right", sortable: true, render: (v) => <Rupee amount={Number(v)} /> },
    { key: "paid_amount",  label: "Paid",   align: "right", sortable: true, render: (v) => <Rupee amount={Number(v)} /> },
    { key: "balance",      label: "Balance",align: "right", sortable: true, render: (v) => <Rupee amount={Number(v)} /> },
    { key: "due_date",     label: "Due Date",  render: (v) => v ? String(v) : "—" },
    { key: "status",       label: "Status",    render: (v) => <StatusBadge status={v as string} /> },
  ];

  const paymentCols: TableColumn<PaymentRow>[] = [
    { key: "tenant_code",  label: "Tenant ID"  },
    { key: "tenant_name",  label: "Name",       sortable: true },
    { key: "hostel_name",  label: "Hostel",     render: (v) => v ? String(v) : "—" },
    { key: "amount",       label: "Amount",  align: "right", sortable: true, render: (v) => <Rupee amount={Number(v)} /> },
    { key: "payment_date", label: "Date",       sortable: true, render: (v) => v ? String(v) : "—" },
    { key: "payment_mode", label: "Mode" },
    { key: "utr_number",   label: "UTR",        render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
    { key: "status",       label: "Status",     render: (v) => <StatusBadge status={v as string} /> },
    { key: "verified_by",  label: "Verified By",render: (v) => v ? String(v) : "—" },
  ];

  const complaintCols: TableColumn<ComplaintRow>[] = [
    { key: "complaint_number", label: "Complaint #" },
    { key: "tenant_name",      label: "Tenant",      sortable: true },
    { key: "room_number",      label: "Room",        render: (v) => v ? String(v) : "—" },
    { key: "category",         label: "Category" },
    { key: "priority",         label: "Priority",    render: (v) => <StatusBadge status={v as string} /> },
    { key: "title",            label: "Title",       render: (v) => <span className="max-w-48 truncate block">{String(v)}</span> },
    { key: "status",           label: "Status",      render: (v) => <StatusBadge status={v as string} /> },
    { key: "created_at",       label: "Raised",      sortable: true, render: (v) => v ? String(v) : "—" },
    { key: "closed_at",        label: "Closed",      render: (v) => v ? String(v) : "—" },
  ];

  const noticeCols: TableColumn<NoticeRow>[] = [
    { key: "notice_number", label: "Notice #" },
    { key: "title",         label: "Title",       sortable: true },
    { key: "priority",      label: "Priority",    render: (v) => <StatusBadge status={v as string} /> },
    { key: "status",        label: "Status",      render: (v) => <StatusBadge status={v as string} /> },
    { key: "publish_date",  label: "Published",   sortable: true, render: (v) => v ? String(v) : "—" },
    { key: "expiry_date",   label: "Expires",     render: (v) => v ? String(v) : "—" },
    { key: "total_reads",   label: "Reads", align: "right", sortable: true },
    { key: "created_at",    label: "Created",     sortable: true, render: (v) => v ? String(v) : "—" },
  ];

  const electricityCols: TableColumn<ElectricityRow>[] = [
    { key: "room_number",    label: "Room" },
    { key: "hostel_name",    label: "Hostel",      sortable: true },
    { key: "billing_period", label: "Period",      sortable: true },
    { key: "bill_amount",    label: "Total Bill",  align: "right", sortable: true, render: (v) => <Rupee amount={Number(v)} /> },
    { key: "meter_reading_before", label: "Prev (kWh)", align: "right" },
    { key: "meter_reading_after",  label: "New (kWh)",  align: "right" },
    { key: "paid_amount",    label: "Paid",        align: "right", render: (v) => <Rupee amount={Number(v)} /> },
    { key: "balance",        label: "Pending",     align: "right", render: (v) => <Rupee amount={Number(v)} /> },
    { key: "status",         label: "Status",      render: (v) => <StatusBadge status={v as string} /> },
  ];

  const contractCols: TableColumn<ContractRow>[] = [
    { key: "tenant_code",      label: "Tenant ID" },
    { key: "tenant_name",      label: "Name",            sortable: true },
    { key: "room_number",      label: "Room" },
    { key: "hostel_name",      label: "Hostel",          sortable: true },
    { key: "start_date",       label: "Start Date",      sortable: true },
    { key: "end_date",         label: "End Date",        sortable: true },
    { key: "rent_amount",      label: "Rent",            align: "right", render: (v) => <Rupee amount={Number(v)} /> },
    { key: "security_deposit", label: "Security Deposit",align: "right", render: (v) => <Rupee amount={Number(v)} /> },
    { key: "status",           label: "Status",          render: (v) => <StatusBadge status={v as string} /> },
  ];

  const auditCols: TableColumn<AuditRow>[] = [
    { key: "performed_by", label: "Performed By", sortable: true, render: (v) => v ? String(v) : "System" },
    { key: "action",       label: "Action",       sortable: true },
    { key: "table_name",   label: "Table" },
    { key: "record_id",    label: "Record ID",    render: (v) => v ? <span className="font-mono text-xs text-gray-500">{String(v).slice(0, 8)}</span> : "—" },
    { key: "ip_address",   label: "IP Address",   render: (v) => v ? String(v) : "—" },
    { key: "created_at",   label: "Timestamp",    sortable: true, render: (v) => v ? new Date(String(v)).toLocaleString() : "—" },
  ];

  // ── Summary data by tab ────────────────────────────────────────────────
  const renderSummary = () => {
    const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    if (activeTab === "occupancy" && occupancy.data?.summary) {
      const s = occupancy.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Total Beds",    value: s.total_beds,    icon: <Building2 className="w-5 h-5" />, color: "gray" },
          { title: "Occupied Beds", value: s.occupied_beds, icon: <Users     className="w-5 h-5" />, color: "red"  },
          { title: "Vacant Beds",   value: s.vacant_beds,   icon: <Building2 className="w-5 h-5" />, color: "green"},
          { title: "Occupancy Rate",value: `${s.occupancy_rate}%`, icon: <BarChart3 className="w-5 h-5" />, color: "blue" },
        ]} />
      );
    }
    if (activeTab === "tenants" && tenants.data?.summary) {
      const s = tenants.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Active",      value: s.active,      icon: <CheckCircle2 className="w-5 h-5" />, color: "green" },
          { title: "Inactive",    value: s.inactive,    icon: <Clock        className="w-5 h-5" />, color: "amber" },
          { title: "Checked Out", value: s.checked_out, icon: <XCircle      className="w-5 h-5" />, color: "gray"  },
          { title: "Total",       value: s.total,       icon: <Users        className="w-5 h-5" />, color: "blue"  },
        ]} />
      );
    }
    if (activeTab === "rents" && rents.data?.summary) {
      const s = rents.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Total Billed", value: fmt(s.total_billed),   icon: <IndianRupee className="w-5 h-5" />, color: "blue"  },
          { title: "Collected",    value: fmt(s.total_paid),     icon: <CheckCircle2 className="w-5 h-5" />, color: "green" },
          { title: "Pending",      value: fmt(s.total_pending),  icon: <Clock        className="w-5 h-5" />, color: "amber" },
          { title: "Overdue",      value: fmt(s.total_overdue),  icon: <AlertTriangle className="w-5 h-5" />, color: "red"  },
        ]} />
      );
    }
    if (activeTab === "payments" && payments.data?.summary) {
      const s = payments.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Collected",  value: fmt(s.total_collected), icon: <IndianRupee  className="w-5 h-5" />, color: "green" },
          { title: "Pending",    value: s.pending,              icon: <Clock        className="w-5 h-5" />, color: "amber" },
          { title: "Verified",   value: s.verified,             icon: <CheckCircle2 className="w-5 h-5" />, color: "blue"  },
          { title: "Rejected",   value: s.rejected,             icon: <XCircle      className="w-5 h-5" />, color: "red"   },
        ]} />
      );
    }
    if (activeTab === "complaints" && complaints.data?.summary) {
      const s = complaints.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Open",        value: s.open,     icon: <AlertTriangle className="w-5 h-5" />, color: "red"   },
          { title: "In Progress", value: s.pending,  icon: <Clock         className="w-5 h-5" />, color: "amber" },
          { title: "Resolved",    value: s.resolved, icon: <CheckCircle2  className="w-5 h-5" />, color: "green" },
          {
            title: "Top Category",
            value: Object.keys(s.category_summary ?? {}).sort(
              (a, b) => (s.category_summary[b] ?? 0) - (s.category_summary[a] ?? 0)
            )[0] || "—",
            icon: <MessageSquare className="w-5 h-5" />,
            color: "blue",
          },
        ]} />
      );
    }
    if (activeTab === "notices" && notices.data?.summary) {
      const s = notices.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Published",     value: s.published,    icon: <Megaphone    className="w-5 h-5" />, color: "green" },
          { title: "Scheduled",     value: s.scheduled,    icon: <Clock        className="w-5 h-5" />, color: "amber" },
          { title: "Total Reads",   value: s.total_reads,  icon: <BarChart3    className="w-5 h-5" />, color: "blue"  },
          { title: "Unique Readers",value: s.unique_reads, icon: <Users        className="w-5 h-5" />, color: "purple"},
        ]} />
      );
    }
    if (activeTab === "electricity" && electricity.data?.summary) {
      const s = electricity.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Total Billed", value: fmt(s.total_billed),   icon: <Zap          className="w-5 h-5" />, color: "blue"  },
          { title: "Paid Amount",  value: fmt(s.total_paid),     icon: <CheckCircle2 className="w-5 h-5" />, color: "green" },
          { title: "Pending",      value: fmt(s.total_pending),  icon: <Clock        className="w-5 h-5" />, color: "amber" },
          { title: "Overdue",      value: fmt(s.total_overdue),  icon: <AlertTriangle className="w-5 h-5" />, color: "red"  },
        ]} />
      );
    }
    if (activeTab === "contracts" && contracts.data?.summary) {
      const s = contracts.data.summary;
      return (
        <StatisticsCards columns={4} stats={[
          { title: "Active Agreements", value: s.active_contracts,   icon: <FileText     className="w-5 h-5" />, color: "green" },
          { title: "Expired Agreements",value: s.expired_contracts,  icon: <XCircle      className="w-5 h-5" />, color: "gray"  },
          { title: "Upcoming Expiry",   value: s.upcoming_expiry_count, icon: <Clock   className="w-5 h-5" />, color: "amber" },
          { title: "Deposits Total",    value: fmt(s.total_deposits), icon: <IndianRupee className="w-5 h-5" />, color: "blue"  },
        ]} />
      );
    }
    if (activeTab === "audit" && audit.data?.summary) {
      const s = audit.data.summary;
      return (
        <StatisticsCards columns={3} stats={[
          { title: "Total Logs",     value: s.total_logs.toLocaleString(),  icon: <ShieldAlert  className="w-5 h-5" />, color: "gray"  },
          { title: "Unique Actors",  value: s.unique_users.toLocaleString(), icon: <Users        className="w-5 h-5" />, color: "blue"  },
          { title: "Critical Alerts",value: s.critical_actions.toLocaleString(), icon: <AlertTriangle className="w-5 h-5" />, color: "red"  },
        ]} />
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Breadcrumbs Context Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-gray-900 border border-border dark:border-gray-800 p-3 sm:p-4 rounded-card shadow-card select-none">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
          <Home className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary" />
          <ChevronRight className="h-3 w-3" />
          <span className="text-primaryText dark:text-white">Reports &amp; Analytics</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeTab !== "dashboard" && (
            <>
              <Button
                variant="secondary"
                onClick={() => setPrintOpen(true)}
                className="inline-flex items-center gap-1.5 font-bold cursor-pointer h-9 px-2 sm:px-3.5"
                title="Print PDF"
              >
                <Printer className="w-4 h-4 text-muted" />
                <span className="hidden sm:inline">Print PDF</span>
              </Button>

              <Button
                onClick={() => setExportOpen(true)}
                className="inline-flex items-center gap-1.5 font-bold cursor-pointer h-9 px-2 sm:px-3.5 text-white"
                title="Export CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Unified Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-card border border-border dark:border-gray-800 p-1 shadow-card select-none overflow-x-auto scrollbar-none">
        <nav className="flex whitespace-nowrap gap-1 w-max sm:w-full">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  navigate(`/reports/${t.id}`);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-secondaryText dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-805"
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Filters (not on dashboard) */}
      {activeTab !== "dashboard" && (
        <ReportFilters
          showDateRange={activeTab !== "electricity" && activeTab !== "contracts"}
          showTenantStatus={activeTab === "tenants" || activeTab === "occupancy"}
          showPaymentStatus={activeTab === "payments" || activeTab === "electricity"}
          showRentStatus={activeTab === "rents"}
          showComplaintStatus={activeTab === "complaints"}
          showPriority={activeTab === "complaints"}
          showNoticeStatus={activeTab === "notices"}
        />
      )}

      {/* Tab Content */}
      <AnimatePresence>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {/* ── Dashboard ── */}
          {activeTab === "dashboard" && <ReportsDashboard />}

          {/* ── Occupancy ── */}
          {activeTab === "occupancy" && (
            <>
              {renderSummary()}
              <ReportTable<OccupancyRow>
                columns={occupancyCols}
                data={occupancy.data?.data ?? []}
                total={occupancy.data?.total}
                page={occupancy.data?.page ?? 1}
                pages={occupancy.data?.pages ?? 1}
                loading={occupancy.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Bed-level occupancy"
                emptyMessage="No occupancy data found. Adjust your filters."
              />
            </>
          )}

          {/* ── Tenants ── */}
          {activeTab === "tenants" && (
            <>
              {renderSummary()}
              <ReportTable<TenantRow>
                columns={tenantCols}
                data={tenants.data?.data ?? []}
                total={tenants.data?.total}
                page={tenants.data?.page ?? 1}
                pages={tenants.data?.pages ?? 1}
                loading={tenants.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Tenant directory"
                emptyMessage="No tenants found matching your filters."
              />
            </>
          )}

          {/* ── Rents ── */}
          {activeTab === "rents" && (
            <>
              {renderSummary()}
              <ReportTable<RentRow>
                columns={rentCols}
                data={rents.data?.data ?? []}
                total={rents.data?.total}
                page={rents.data?.page ?? 1}
                pages={rents.data?.pages ?? 1}
                loading={rents.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Rent ledger"
                emptyMessage="No rent records found."
              />
            </>
          )}

          {/* ── Payments ── */}
          {activeTab === "payments" && (
            <>
              {renderSummary()}
              <ReportTable<PaymentRow>
                columns={paymentCols}
                data={payments.data?.data ?? []}
                total={payments.data?.total}
                page={payments.data?.page ?? 1}
                pages={payments.data?.pages ?? 1}
                loading={payments.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Payment verification"
                emptyMessage="No payments found."
              />
            </>
          )}

          {/* ── Electricity ── */}
          {activeTab === "electricity" && (
            <>
              {renderSummary()}
              <ReportTable<ElectricityRow>
                columns={electricityCols}
                data={electricity.data?.data ?? []}
                total={electricity.data?.total}
                page={electricity.data?.page ?? 1}
                pages={electricity.data?.pages ?? 1}
                loading={electricity.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Electricity billing log"
                emptyMessage="No electricity records found."
              />
            </>
          )}

          {/* ── Contracts ── */}
          {activeTab === "contracts" && (
            <>
              {renderSummary()}
              <ReportTable<ContractRow>
                columns={contractCols}
                data={contracts.data?.data ?? []}
                total={contracts.data?.total}
                page={contracts.data?.page ?? 1}
                pages={contracts.data?.pages ?? 1}
                loading={contracts.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="License agreements log"
                emptyMessage="No contracts found."
              />
            </>
          )}

          {/* ── Audit Logs ── */}
          {activeTab === "audit" && (
            <>
              {renderSummary()}
              <ReportTable<AuditRow>
                columns={auditCols}
                data={audit.data?.data ?? []}
                total={audit.data?.total}
                page={audit.data?.page ?? 1}
                pages={audit.data?.pages ?? 1}
                loading={audit.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="System activity ledger"
                emptyMessage="No logs found."
              />
            </>
          )}

          {/* ── Complaints ── */}
          {activeTab === "complaints" && (
            <>
              {renderSummary()}
              <ReportTable<ComplaintRow>
                columns={complaintCols}
                data={complaints.data?.data ?? []}
                total={complaints.data?.total}
                page={complaints.data?.page ?? 1}
                pages={complaints.data?.pages ?? 1}
                loading={complaints.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Complaint tracker"
                emptyMessage="No complaints found."
              />
            </>
          )}

          {/* ── Notices ── */}
          {activeTab === "notices" && (
            <>
              {renderSummary()}
              <ReportTable<NoticeRow>
                columns={noticeCols}
                data={notices.data?.data ?? []}
                total={notices.data?.total}
                page={notices.data?.page ?? 1}
                pages={notices.data?.pages ?? 1}
                loading={notices.isLoading}
                onPageChange={(p) => setFilters({ page: p })}
                caption="Notice board"
                emptyMessage="No notices found."
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        reportType={exportType}
        filters={filters}
      />

      {/* Print Dialog */}
      <PrintDialog
        isOpen={printOpen}
        onClose={() => setPrintOpen(false)}
        title={TABS.find((t) => t.id === activeTab)?.label ?? "Report"}
      >
        {activeTab === "occupancy" && (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {["Hostel","Building","Floor","Room","Bed","Status","Tenant","Joining"].map(h => (
                  <th key={h} className="text-left p-2 bg-primary text-white font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(occupancy.data?.data ?? []).slice(0, 100).map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                  <td className="p-2 border-b border-border">{r.hostel_name}</td>
                  <td className="p-2 border-b border-border">{r.building_name}</td>
                  <td className="p-2 border-b border-border">{r.floor_name}</td>
                  <td className="p-2 border-b border-border">{r.room_number}</td>
                  <td className="p-2 border-b border-border">{r.bed_number}</td>
                  <td className="p-2 border-b border-border">{r.occupancy_status}</td>
                  <td className="p-2 border-b border-border">{r.tenant_name ?? "—"}</td>
                  <td className="p-2 border-b border-border">{r.joining_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab !== "occupancy" && (
          <p className="text-sm text-gray-500 text-center py-8">
            Print preview available for Occupancy report. Use Export → PDF for other reports.
          </p>
        )}
      </PrintDialog>
    </motion.div>
  );
};

export default ReportsPage;
