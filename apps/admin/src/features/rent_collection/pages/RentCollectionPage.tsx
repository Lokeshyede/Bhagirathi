import React, { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Button } from "@bhagirathi/ui";
import {
  Home, ChevronRight, RefreshCw, Download, Search, Filter, X, ChevronUp,
  ChevronDown, Users, AlertTriangle, Clock, CalendarCheck, Zap, Banknote,
  TrendingUp, Eye, CreditCard, Printer, CheckCircle,
  CircleDollarSign, Building2, Layers, DoorOpen, BedDouble, Phone,
  Calendar, RotateCcw, ShieldAlert,
  BadgeCheck, Timer, ChevronLeft, ListChecks
} from "lucide-react";
import { Badge, PageHeader } from "@bhagirathi/ui";
import {
  useRentCollection,
  useRentCollectionSummary,
  useRentCollectionTenant,
  type RentCollectionItem,
  type RentCollectionFilters,
} from "../hooks/useRentCollection";
import { CashCollectionModal } from "../components/CashCollectionModal";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n?: number | null) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—";

const fmtFull = (n?: number | null) =>
  n != null ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

const monthName = (m?: number | null) =>
  m ? new Date(2000, m - 1).toLocaleString("en-US", { month: "short" }) : "—";

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Status Badge ──────────────────────────────────────────────────────────
const OverallBadge: React.FC<{ status: string }> = ({ status }) => {
  const badgeVariant = 
    status === "PAID" ? "paid" : 
    status === "PARTIAL" ? "warning" : 
    status === "PENDING" ? "pending" : 
    status === "OVERDUE" ? "danger" : "neutral";

  return <Badge variant={badgeVariant as any} size="sm">{status}</Badge>;
};

const RentBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status) return <span className="text-xs text-muted">—</span>;
  const badgeVariant = 
    status === "PAID" ? "paid" : 
    status === "PARTIALLY_PAID" ? "warning" : 
    status === "PENDING" ? "pending" : 
    status === "OVERDUE" ? "danger" : 
    status === "CANCELLED" ? "cancelled" : "neutral";

  return <Badge variant={badgeVariant as any} size="sm" pill={false}>{status}</Badge>;
};

const ElecBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status) return <span className="text-xs text-muted">—</span>;
  const badgeVariant = 
    status === "PAID" ? "paid" : 
    status === "PENDING" ? "pending" : 
    status === "OVERDUE" ? "danger" : "neutral";

  return <Badge variant={badgeVariant as any} size="sm" pill={false}>{status}</Badge>;
};

// ─── Days Remaining Chip ───────────────────────────────────────────────────
const DaysChip: React.FC<{ days?: number | null; status?: string | null }> = ({ days, status }) => {
  if (days == null || status === "PAID") return <span className="text-xs text-muted">—</span>;
  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
        <AlertTriangle className="h-3 w-3" /> {Math.abs(days)}d overdue
      </span>
    );
  if (days === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">
        <Timer className="h-3 w-3" /> Due today
      </span>
    );
  if (days <= 3)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" /> {days}d left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondaryText dark:text-gray-400">
      <CalendarCheck className="h-3 w-3" /> {days}d left
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconCls?: string;
  cardCls?: string;
  pulse?: boolean;
}
const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, sub, icon: Icon, iconCls = "text-primary", cardCls = "", pulse }) => (
  <div className={`relative bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-5 shadow-card overflow-hidden group hover:shadow-lg transition-shadow ${cardCls}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted dark:text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-black text-primaryText dark:text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-muted dark:text-gray-500 mt-1 font-medium">{sub}</p>}
      </div>
      <div className={`shrink-0 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 ${pulse ? "animate-pulse" : ""}`}>
        <Icon className={`h-5 w-5 ${iconCls}`} />
      </div>
    </div>
    {/* decorative corner glow */}
    <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full opacity-5 bg-current" />
  </div>
);

// ─── Tenant Drawer ─────────────────────────────────────────────────────────
const TenantDrawer: React.FC<{
  tenantId: string | null;
  onClose: () => void;
  onNavigateRent: (tenantId: string) => void;
  onNavigatePayments: (tenantId: string) => void;
  onCollectCash: (tenantId: string) => void;
}> = ({ tenantId, onClose, onNavigateRent, onNavigatePayments, onCollectCash }) => {
  const { data: item, isLoading } = useRentCollectionTenant(tenantId);

  // Payment history query
  const { data: rentHistory } = useQuery<any[]>({
    queryKey: ["tenant-rent-history-drawer", tenantId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/rents/history/${tenantId}`);
      return res.data;
    },
    enabled: !!tenantId,
  });

  const balance = item ? Number(item.outstanding_balance) : 0;
  const rentPct = item && item.rent_total_amount
    ? Math.min(100, Math.round((Number(item.rent_paid_amount || 0) / Number(item.rent_total_amount)) * 100))
    : 0;

  return (
    <AnimatePresence>
      {tenantId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col overflow-hidden border-l border-border dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-gray-800 bg-gray-50 dark:bg-gray-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-primaryText dark:text-white">Tenant Detail</h3>
                  <p className="text-[10px] text-muted font-medium">Rent & Billing Overview</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-muted transition cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 space-y-4 animate-pulse">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
                </div>
              ) : item ? (
                <div className="p-6 space-y-5">

                  {/* Tenant Info */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 dark:border-primary/20 rounded-2xl">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                      {item.tenant_photo ? (
                        <img src={`http://localhost:8000/uploads/${item.tenant_photo}`} alt={item.tenant_name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <span className="text-lg font-black text-primary">{item.tenant_name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-primaryText dark:text-white text-base truncate">{item.tenant_name}</p>
                      <p className="text-xs text-muted font-mono">{item.tenant_display_id}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="h-3 w-3 text-muted" />
                        <span className="text-xs text-secondaryText font-medium">{item.tenant_mobile}</span>
                      </div>
                    </div>
                    <div className="ml-auto shrink-0">
                      <OverallBadge status={item.overall_status} />
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Building2, label: "Hostel", value: item.hostel_name },
                      { icon: Layers, label: "Building", value: item.building_name },
                      { icon: DoorOpen, label: "Floor", value: item.floor_name },
                      { icon: DoorOpen, label: "Room", value: item.room_number },
                      { icon: BedDouble, label: "Bed", value: item.bed_number },
                      { icon: Calendar, label: "Due Date", value: fmtDate(item.rent_due_date) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-muted mb-0.5">{label}</p>
                          <p className="text-xs font-bold text-primaryText dark:text-white">{value || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Summary */}
                  <div className="border border-border dark:border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-border dark:border-gray-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Collection Summary</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-secondaryText font-semibold">Monthly Rent</span>
                        <span className="text-sm font-bold text-primaryText dark:text-white">{fmtFull(item.monthly_rent)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-secondaryText font-semibold">Electricity Bill</span>
                        <span className="text-sm font-bold text-primaryText dark:text-white">{fmtFull(item.electricity_amount)}</span>
                      </div>
                      <div className="h-px bg-border dark:bg-gray-800" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-secondaryText font-semibold">Total Payable</span>
                        <span className="text-base font-extrabold text-primaryText dark:text-white">{fmtFull(item.total_payable)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-secondaryText font-semibold">Amount Paid</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtFull(item.total_paid)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primaryText dark:text-white">Outstanding Balance</span>
                        <span className={`text-base font-extrabold ${balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {fmtFull(item.outstanding_balance)}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {item.rent_total_amount && (
                      <div className="px-4 pb-4">
                        <div className="flex justify-between text-[10px] text-muted mb-1.5 font-semibold">
                          <span>Rent Collection Progress</span>
                          <span>{rentPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${rentPct === 100 ? "bg-emerald-500" : rentPct > 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${rentPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Section */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted">Rent Status</p>
                      <RentBadge status={item.rent_status} />
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted">Electricity</p>
                      <ElecBadge status={item.electricity_status} />
                    </div>
                  </div>

                  {/* Recent Payment History */}
                  {rentHistory && rentHistory.length > 0 && (
                    <div className="border border-border dark:border-gray-800 rounded-2xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-border dark:border-gray-800 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Recent Payments</p>
                        <span className="text-[10px] text-muted font-semibold">{rentHistory.length} records</span>
                      </div>
                      <div className="divide-y divide-border dark:divide-gray-800">
                        {rentHistory.slice(0, 5).map((h: any) => (
                          <div key={h.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                              <p className="text-xs font-bold text-primaryText dark:text-white">{fmtFull(h.amount_paid)}</p>
                              <p className="text-[10px] text-muted">{fmtDate(h.payment_date)} · {h.payment_method}</p>
                            </div>
                            <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted text-sm">No data available</div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-border dark:border-gray-800 bg-gray-50 dark:bg-gray-950 shrink-0 space-y-2">
              <Button
                onClick={() => { if (tenantId) onCollectCash(tenantId); onClose(); }}
                className="w-full h-9 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Banknote className="h-3.5 w-3.5" /> Record Cash Collection
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => { if (tenantId) onNavigateRent(tenantId); onClose(); }}
                  className="h-9 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> View Rent Ledger
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { if (tenantId) onNavigatePayments(tenantId); onClose(); }}
                  className="h-9 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="h-3.5 w-3.5" /> Payments
                </Button>
              </div>
              <Button
                onClick={() => window.print()}
                className="w-full h-9 text-xs font-bold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Statement
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Sort helper ──────────────────────────────────────────────────────────
type SortKey = "tenant_name" | "room_number" | "monthly_rent" | "electricity_amount" | "total_payable" | "rent_due_date" | "days_remaining" | "outstanding_balance" | "overall_status";

// ─── Main Page ────────────────────────────────────────────────────────────
export const RentCollectionPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [filterHostel, setFilterHostel] = useState("ALL");
  const [filterBuilding, setFilterBuilding] = useState("ALL");
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterRentStatus, setFilterRentStatus] = useState("ALL");
  const [filterElecStatus, setFilterElecStatus] = useState("ALL");
  const [filterOverallStatus, setFilterOverallStatus] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Table
  const [sortKey, setSortKey] = useState<SortKey>("days_remaining");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Drawer
  const [drawerTenantId, setDrawerTenantId] = useState<string | null>(null);

  // Cash Collection Modal state
  const [isCashCollectionOpen, setIsCashCollectionOpen] = useState(false);
  const [cashCollectionTenantId, setCashCollectionTenantId] = useState<string | null>(null);

  // Ref for print
  const tableRef = useRef<HTMLDivElement>(null);

  // Lookup queries
  const { data: hostels } = useQuery<any[]>({
    queryKey: ["hostels-list"],
    queryFn: async () => (await apiClient.get("/api/v1/hostels")).data,
  });
  const { data: buildings } = useQuery<any[]>({
    queryKey: ["buildings-all"],
    queryFn: async () => (await apiClient.get("/api/v1/buildings")).data,
    enabled: filterHostel !== "ALL",
  });
  const { data: floors } = useQuery<any[]>({
    queryKey: ["floors-all", filterBuilding],
    queryFn: async () => (await apiClient.get(`/api/v1/buildings/${filterBuilding}/floors`)).data,
    enabled: filterBuilding !== "ALL",
  });

  // Data queries
  const filters: RentCollectionFilters = {
    search: search || undefined,
    hostel_id: filterHostel !== "ALL" ? filterHostel : undefined,
    building_id: filterBuilding !== "ALL" ? filterBuilding : undefined,
    floor_id: filterFloor !== "ALL" ? filterFloor : undefined,
    rent_status: filterRentStatus !== "ALL" ? filterRentStatus : undefined,
    electricity_status: filterElecStatus !== "ALL" ? filterElecStatus : undefined,
    overall_status: filterOverallStatus !== "ALL" ? filterOverallStatus : undefined,
  };

  const { data: items = [], isLoading, isError, refetch } = useRentCollection(filters);
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useRentCollectionSummary();

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case "tenant_name": av = a.tenant_name; bv = b.tenant_name; break;
        case "room_number": av = a.room_number || ""; bv = b.room_number || ""; break;
        case "monthly_rent": av = Number(a.monthly_rent || 0); bv = Number(b.monthly_rent || 0); break;
        case "electricity_amount": av = Number(a.electricity_amount || 0); bv = Number(b.electricity_amount || 0); break;
        case "total_payable": av = Number(a.total_payable || 0); bv = Number(b.total_payable || 0); break;
        case "rent_due_date": av = a.rent_due_date || ""; bv = b.rent_due_date || ""; break;
        case "days_remaining": av = a.days_remaining ?? 9999; bv = b.days_remaining ?? 9999; break;
        case "outstanding_balance": av = Number(a.outstanding_balance || 0); bv = Number(b.outstanding_balance || 0); break;
        case "overall_status": av = a.overall_status; bv = b.overall_status; break;
        default: av = 0; bv = 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [items, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const handleResetFilters = () => {
    setSearch(""); setFilterHostel("ALL"); setFilterBuilding("ALL");
    setFilterFloor("ALL"); setFilterRentStatus("ALL");
    setFilterElecStatus("ALL"); setFilterOverallStatus("ALL");
    setPage(1);
  };

  const handleRefresh = () => { refetch(); refetchSummary(); };

  const SortIcon: React.FC<{ k: SortKey }> = ({ k }) => (
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-muted opacity-40" />
  );

  const ThBtn: React.FC<{ label: string; k: SortKey; className?: string }> = ({ label, k, className = "" }) => (
    <button
      onClick={() => handleSort(k)}
      className={`inline-flex items-center gap-1 font-bold cursor-pointer hover:text-primary transition-colors text-[10px] uppercase tracking-wider ${className}`}
    >
      {label} <SortIcon k={k} />
    </button>
  );

  // ── Status summary for table footer ────────────────────────────────────
  const totalStats = useMemo(() => ({
    rent: items.reduce((s, i) => s + Number(i.total_payable || 0), 0),
    paid: items.reduce((s, i) => s + Number(i.total_paid || 0), 0),
    outstanding: items.reduce((s, i) => s + Number(i.outstanding_balance || 0), 0),
  }), [items]);

  // ── Quick action row ────────────────────────────────────────────────────
  const RowActions: React.FC<{ item: RentCollectionItem }> = ({ item }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); setDrawerTenantId(item.tenant_id); }}
        title="View Details"
        className="p-1.5 rounded hover:bg-primary/10 text-muted hover:text-primary transition cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCashCollectionTenantId(item.tenant_id);
          setIsCashCollectionOpen(true);
        }}
        title="Collect Cash Rent"
        className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-muted hover:text-emerald-600 transition cursor-pointer"
      >
        <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); navigate("/payments"); }}
        title="Verify Payment"
        className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-muted hover:text-emerald-600 transition cursor-pointer"
      >
        <CheckCircle className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); navigate("/rent"); }}
        title="Rent Ledger"
        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 text-muted hover:text-blue-600 transition cursor-pointer"
      >
        <Banknote className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-14">

      {/* 1. Page Header */}
      <PageHeader
        title="Rent Collection"
        description="Monitor tenant outstanding balances and overdue rent"
        breadcrumb={
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondaryText dark:text-gray-400">
            <Home className="h-4 w-4 text-primary" />
            <ChevronRight className="h-3 w-3" />
            <span className="text-primaryText dark:text-white">Collection</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted font-semibold hidden sm:inline mr-2">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
            <Button variant="secondary" onClick={handleRefresh} className="h-9 px-3" title="Refresh">
              <RefreshCw className="h-4 w-4 text-text-secondary" />
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCashCollectionTenantId(null);
                setIsCashCollectionOpen(true);
              }}
              className="h-9 px-3.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Banknote className="h-4 w-4" /> Collect Cash
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="h-9 px-3.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const rows = sorted.map(i =>
                  `${i.tenant_name},${i.tenant_mobile},${i.room_number || ""},${i.building_name || ""},${i.monthly_rent || 0},${i.electricity_amount || 0},${i.total_payable},${i.rent_due_date || ""},${i.rent_status || ""},${i.overall_status}`
                ).join("\n");
                const csv = `Tenant Name,Mobile,Room,Building,Monthly Rent,Electricity,Total Payable,Due Date,Rent Status,Overall Status\n${rows}`;
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `rent-collection-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              }}
              className="h-9 px-3.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* 2. Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4 animate-pulse">
          {[...Array(7)].map((_, i) => <div key={i} className="h-24 rounded-card bg-white dark:bg-gray-900 border border-border" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
          <SummaryCard
            label="Today Due"
            value={summary.today_due_count}
            sub={fmt(summary.today_due_amount)}
            icon={Timer}
            iconCls="text-orange-500"
            pulse={summary.today_due_count > 0}
          />
          <SummaryCard
            label="Tomorrow Due"
            value={summary.tomorrow_due_count}
            sub={fmt(summary.tomorrow_due_amount)}
            icon={Calendar}
            iconCls="text-amber-500"
          />
          <SummaryCard
            label="This Week"
            value={summary.this_week_due_count}
            sub={fmt(summary.this_week_due_amount)}
            icon={CalendarCheck}
            iconCls="text-blue-500"
          />
          <SummaryCard
            label="Overdue"
            value={summary.overdue_count}
            sub={fmt(summary.overdue_amount)}
            icon={AlertTriangle}
            iconCls="text-red-500"
            pulse={summary.overdue_count > 0}
          />
          <SummaryCard
            label="Expected Today"
            value={fmt(summary.today_expected_collection)}
            icon={TrendingUp}
            iconCls="text-emerald-500"
          />
          <SummaryCard
            label="Pending Electricity"
            value={summary.pending_electricity_count}
            sub={fmt(summary.pending_electricity_amount)}
            icon={Zap}
            iconCls="text-yellow-500"
          />
          <SummaryCard
            label="Total Pending"
            value={fmt(summary.total_pending_amount)}
            sub={`${summary.total_active_tenants} active tenants`}
            icon={CircleDollarSign}
            iconCls="text-primary"
          />
        </div>
      ) : null}

      {/* 3. Search & Filters */}
      <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card p-4 space-y-3">
        {/* Search row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`relative flex-1 min-w-[180px] transition-all ${isSearchFocused ? "ring-1 ring-primary rounded-input" : ""}`}>
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search tenant, mobile, room, building…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full h-9 pl-9 pr-3 bg-gray-50 dark:bg-gray-950 border border-border dark:border-gray-800 rounded-input text-xs text-primaryText placeholder-muted focus:outline-none font-semibold transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-2 text-muted hover:text-primaryText cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["ALL", "PENDING", "OVERDUE", "PARTIAL", "PAID"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setFilterOverallStatus(s); setPage(1); }}
                className={`h-9 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterOverallStatus === s
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-50 dark:bg-gray-800 text-muted hover:text-primaryText border border-border dark:border-gray-700"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`h-9 px-3.5 rounded-input border text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              showFilters
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-gray-900 border-border dark:border-gray-700 text-secondaryText hover:border-primary hover:text-primary"
            }`}
          >
            <Filter className="h-3.5 w-3.5" /> Filters {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {(filterHostel !== "ALL" || filterBuilding !== "ALL" || filterFloor !== "ALL" || filterRentStatus !== "ALL" || filterElecStatus !== "ALL") && (
            <button onClick={handleResetFilters} className="h-9 px-3 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded inline-flex items-center gap-1 cursor-pointer transition">
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-border dark:border-gray-800">
                {/* Hostel */}
                <select
                  value={filterHostel}
                  onChange={e => { setFilterHostel(e.target.value); setFilterBuilding("ALL"); setFilterFloor("ALL"); setPage(1); }}
                  className="h-9 px-3 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Hostels</option>
                  {hostels?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>

                {/* Building */}
                <select
                  value={filterBuilding}
                  onChange={e => { setFilterBuilding(e.target.value); setFilterFloor("ALL"); setPage(1); }}
                  className="h-9 px-3 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                  disabled={filterHostel === "ALL"}
                >
                  <option value="ALL">All Buildings</option>
                  {buildings?.filter(b => b.hostel_id === filterHostel).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>

                {/* Floor */}
                <select
                  value={filterFloor}
                  onChange={e => { setFilterFloor(e.target.value); setPage(1); }}
                  className="h-9 px-3 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                  disabled={filterBuilding === "ALL"}
                >
                  <option value="ALL">All Floors</option>
                  {floors?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>

                {/* Rent Status */}
                <select
                  value={filterRentStatus}
                  onChange={e => { setFilterRentStatus(e.target.value); setPage(1); }}
                  className="h-9 px-3 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Rent: All</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>

                {/* Electricity Status */}
                <select
                  value={filterElecStatus}
                  onChange={e => { setFilterElecStatus(e.target.value); setPage(1); }}
                  className="h-9 px-3 border border-border dark:border-gray-700 rounded bg-white dark:bg-gray-950 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Electricity: All</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>

                {/* Result count */}
                <div className="flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded border border-border dark:border-gray-700">
                  <ListChecks className="h-3.5 w-3.5 text-muted mr-2 shrink-0" />
                  <span className="text-xs font-bold text-primaryText dark:text-white">{items.length}</span>
                  <span className="text-xs text-muted ml-1">results</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Main Table */}
      <div ref={tableRef} className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[...Array(8)].map((_, i) => <div key={i} className="h-11 bg-gray-50 dark:bg-gray-800 rounded-lg" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldAlert className="h-10 w-10 text-red-400 mb-3" />
            <p className="font-bold text-sm text-primaryText dark:text-white mb-1">Failed to load data</p>
            <p className="text-xs text-muted mb-4">Could not fetch rent collection data from the server.</p>
            <Button onClick={handleRefresh} className="h-9 px-4 text-xs font-bold gap-2 cursor-pointer">
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3 animate-pulse" />
            <p className="font-bold text-sm text-primaryText dark:text-white mb-1">No tenants found</p>
            <p className="text-xs text-muted">Adjust your search or filters to find tenants.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 dark:bg-gray-950 border-b border-border dark:border-gray-800">
                    <th className="px-4 py-3 text-left">
                      <ThBtn label="Tenant" k="tenant_name" />
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">Location</th>
                    <th className="px-3 py-3 text-right">
                      <ThBtn label="Monthly Rent" k="monthly_rent" className="justify-end" />
                    </th>
                    <th className="px-3 py-3 text-right">
                      <ThBtn label="Electricity" k="electricity_amount" className="justify-end" />
                    </th>
                    <th className="px-3 py-3 text-right">
                      <ThBtn label="Total Due" k="total_payable" className="justify-end" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <ThBtn label="Due Date" k="rent_due_date" />
                    </th>
                    <th className="px-3 py-3 text-left">
                      <ThBtn label="Days" k="days_remaining" />
                    </th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">Rent</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">Electricity</th>
                    <th className="px-3 py-3 text-center">
                      <ThBtn label="Status" k="overall_status" className="justify-center" />
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-800/60">
                  {paginated.map((item, idx) => {
                    const isOverdueRow = item.overall_status === "OVERDUE";
                    return (
                      <motion.tr
                        key={item.tenant_id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        onClick={() => setDrawerTenantId(item.tenant_id)}
                        className={`group transition-colors cursor-pointer hover:bg-primary/[0.03] dark:hover:bg-primary/[0.05] ${
                          isOverdueRow ? "bg-red-50/30 dark:bg-red-950/10" : ""
                        }`}
                      >
                        {/* Tenant */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {item.tenant_photo ? (
                                <img
                                  src={`http://localhost:8000/uploads/${item.tenant_photo}`}
                                  alt={item.tenant_name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <span className="text-xs font-black text-primary">{item.tenant_name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-primaryText dark:text-white truncate max-w-[120px]">{item.tenant_name}</p>
                              <p className="text-[10px] text-muted font-medium">{item.tenant_mobile}</p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-3 py-3">
                          <div className="text-xs font-semibold text-secondaryText whitespace-nowrap">
                            <span className="text-primaryText dark:text-white font-bold">{item.room_number || "—"}</span>
                            {item.building_name && <span className="text-muted"> · {item.building_name}</span>}
                          </div>
                          {item.floor_name && <div className="text-[10px] text-muted">{item.floor_name} · {item.bed_number || "—"}</div>}
                        </td>

                        {/* Monthly Rent */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-xs font-bold text-primaryText dark:text-white whitespace-nowrap">{fmt(item.monthly_rent)}</span>
                          {item.rent_month && (
                            <div className="text-[10px] text-muted">{monthName(item.rent_month)} {item.rent_year}</div>
                          )}
                        </td>

                        {/* Electricity */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-xs font-bold text-primaryText dark:text-white whitespace-nowrap">{fmt(item.electricity_amount)}</span>
                        </td>

                        {/* Total Payable */}
                        <td className="px-3 py-3 text-right">
                          <span className={`text-sm font-extrabold whitespace-nowrap ${isOverdueRow ? "text-red-600 dark:text-red-400" : "text-primaryText dark:text-white"}`}>
                            {fmt(item.total_payable)}
                          </span>
                          {item.outstanding_balance > 0 && (
                            <div className="text-[10px] text-red-500 font-semibold">{fmt(item.outstanding_balance)} due</div>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-xs font-semibold text-secondaryText">{fmtDate(item.rent_due_date)}</span>
                        </td>

                        {/* Days Remaining */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <DaysChip days={item.days_remaining} status={item.rent_status} />
                        </td>

                        {/* Rent Status */}
                        <td className="px-3 py-3 text-center">
                          <RentBadge status={item.rent_status} />
                        </td>

                        {/* Electricity Status */}
                        <td className="px-3 py-3 text-center">
                          <ElecBadge status={item.electricity_status} />
                        </td>

                        {/* Overall Status */}
                        <td className="px-3 py-3 text-center">
                          <OverallBadge status={item.overall_status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                          <RowActions item={item} />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>

                {/* Table Footer Summary */}
                <tfoot className="border-t-2 border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <td colSpan={2} className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        {items.length} Tenant{items.length !== 1 ? "s" : ""} · Page {page}/{totalPages || 1}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-xs font-extrabold text-primaryText dark:text-white">{fmt(totalStats.rent)}</span>
                    </td>
                    <td className="px-3 py-3" />
                    <td className="px-3 py-3 text-right">
                      <span className="text-xs font-extrabold text-primaryText dark:text-white">{fmt(totalStats.rent)}</span>
                    </td>
                    <td colSpan={4} className="px-3 py-3 text-right">
                      <span className="text-[10px] text-muted font-semibold">Outstanding: </span>
                      <span className="text-xs font-extrabold text-red-600 dark:text-red-400">{fmt(totalStats.outstanding)}</span>
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border dark:border-gray-800">
                <span className="text-xs text-muted font-semibold">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded border border-border dark:border-gray-700 text-muted hover:text-primaryText disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`h-8 w-8 flex items-center justify-center rounded border text-xs font-bold transition cursor-pointer ${
                          page === pg
                            ? "bg-primary text-white border-primary"
                            : "border-border dark:border-gray-700 text-secondaryText hover:border-primary hover:text-primary"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded border border-border dark:border-gray-700 text-muted hover:text-primaryText disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Tenant Drawer */}
      <TenantDrawer
        tenantId={drawerTenantId}
        onClose={() => setDrawerTenantId(null)}
        onNavigateRent={() => navigate("/rent")}
        onNavigatePayments={() => navigate("/payments")}
        onCollectCash={(tid) => {
          setCashCollectionTenantId(tid);
          setIsCashCollectionOpen(true);
        }}
      />

      {/* Cash Collection Modal */}
      <CashCollectionModal
        isOpen={isCashCollectionOpen}
        onClose={() => {
          setIsCashCollectionOpen(false);
          setCashCollectionTenantId(null);
          handleRefresh();
        }}
        initialTenantId={cashCollectionTenantId}
      />
    </motion.div>
  );
};

export default RentCollectionPage;
