import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, IndianRupee, CheckCircle2, Clock, AlertTriangle,
  RefreshCw, ChevronRight, Filter,
  Calendar, BarChart3, Home, Search,
  FileText, RotateCcw, Receipt
} from "lucide-react";

import {
  useBillingDashboard,
  useBills,
  useBillingMutations,
  Bill,
} from "../hooks/api/useBilling";
import { BillingLedgerDrawer } from "../components/BillingLedgerDrawer";

// ── Utility ────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHORT_MONTH = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}
function fmtK(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${fmt(n)}`;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PAID:    { label: "Paid",    bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  PENDING: { label: "Pending", bg: "bg-amber-500/10 border-amber-500/20",    text: "text-amber-400",   dot: "bg-amber-400"   },
  OVERDUE: { label: "Overdue", bg: "bg-red-500/10 border-red-500/20",        text: "text-red-400",     dot: "bg-red-400"     },
};

// ── KPI Card ──────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  delta?: string;
  deltaPositive?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, icon, gradient, accent, delta, deltaPositive }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0e1118] p-5"
  >
    {/* Gradient blob */}
    <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-20 ${gradient}`} />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center`}>
          {icon}
        </div>
        {delta && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
            deltaPositive
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-red-400 bg-red-500/10 border-red-500/20"
          }`}>
            {delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

// ── Bills Table Row ───────────────────────────────────────────────

const BillTableRow: React.FC<{
  bill: Bill;
  onOpenLedger: (tenantId: string, name: string) => void;
}> = ({ bill, onOpenLedger }) => {
  const cfg = statusConfig[bill.status] ?? statusConfig.PENDING;
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group"
    >
      <td className="px-4 py-3.5">
        <div>
          <p className="text-sm font-medium text-white">{bill.tenant_name ?? "—"}</p>
          <p className="text-xs text-slate-500">{bill.tenant_phone ?? ""}</p>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-300">
          {bill.room_number ? `Room ${bill.room_number}` : "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-300 font-medium">
          {SHORT_MONTH[bill.rent_month]} {bill.rent_year}
        </span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <p className="text-sm font-semibold text-white">₹{fmt(bill.total_amount)}</p>
        <p className="text-xs text-slate-500">Room: ₹{fmt(bill.monthly_rent)}</p>
      </td>
      <td className="px-4 py-3.5 text-right">
        <p className="text-sm font-medium text-emerald-400">₹{fmt(bill.paid_amount)}</p>
      </td>
      <td className="px-4 py-3.5 text-right">
        {(() => {
          const bal = bill.total_amount - bill.paid_amount;
          return <p className={`text-sm font-medium ${bal > 0 ? "text-red-400" : "text-emerald-400"}`}>₹{fmt(bal)}</p>;
        })()}
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs text-slate-500">
          {bill.due_date ? new Date(bill.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <button
          onClick={() => onOpenLedger(bill.tenant_id, bill.tenant_name ?? "")}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-all"
        >
          Ledger <ChevronRight className="w-3 h-3" />
        </button>
      </td>
    </motion.tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────

const BillingDashboardPage: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Ledger drawer state
  const [ledgerTenantId, setLedgerTenantId] = useState<string | null>(null);
  const [ledgerTenantName, setLedgerTenantName] = useState<string>("");

  // Data
  const { data: dashboard, isLoading: dashLoading, refetch: refetchDash } = useBillingDashboard(selectedMonth, selectedYear);
  const { data: bills, isLoading: billsLoading, refetch: refetchBills } = useBills({
    month: selectedMonth,
    year: selectedYear,
    status: statusFilter || undefined,
    limit: 200,
  });

  const { markOverdue } = useBillingMutations();

  // Filtered bills
  const filteredBills = useMemo(() => {
    if (!bills) return [];
    if (!searchQuery) return bills;
    const q = searchQuery.toLowerCase();
    return bills.filter(b =>
      b.tenant_name?.toLowerCase().includes(q) ||
      b.tenant_phone?.includes(q) ||
      b.room_number?.toLowerCase().includes(q)
    );
  }, [bills, searchQuery]);


  const handleMarkOverdue = async () => {
    try {
      const result = await markOverdue.mutateAsync(undefined);
      setSuccessBanner(`✓ Marked ${result.marked_overdue} bill(s) as overdue.`);
      setTimeout(() => setSuccessBanner(null), 5000);
      refetchDash();
      refetchBills();
    } catch {
      setErrorBanner("Failed to mark overdue bills.");
      setTimeout(() => setErrorBanner(null), 5000);
    }
  };

  const cur = dashboard?.current_month;
  const overall = dashboard?.overall;

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">

        {/* ── Banners ──────────────────────────────────── */}
        <AnimatePresence>
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successBanner}
            </motion.div>
          )}
          {errorBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" /> {errorBanner}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page Header ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Home className="w-3 h-3" />
              <ChevronRight className="w-3 h-3" />
              <span>Rent Management</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-violet-400 font-medium">Rent Ledger</span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              Rent Ledger
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300">Phase 21</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Rent payment records — computed from contract &amp; room configuration</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkOverdue}
              disabled={markOverdue.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 text-sm font-medium transition-all disabled:opacity-50"
            >
              {markOverdue.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              Mark Overdue
            </button>
          </div>
        </div>

        {/* ── Period selector ──────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-white focus:outline-none"
            >
              {MONTH_NAMES.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1} className="bg-gray-900">{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-medium text-white focus:outline-none"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y} className="bg-gray-900">{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { refetchDash(); refetchBills(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* ── KPI Cards ────────────────────────────────── */}
        {dashLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label={`Total Bills — ${SHORT_MONTH[selectedMonth]} ${selectedYear}`}
              value={String(cur?.total_bills ?? 0)}
              sub={`Overall: ${overall?.total_bills ?? 0}`}
              icon={<FileText className="w-5 h-5 text-violet-400" />}
              gradient="bg-violet-500"
              accent="bg-violet-500/10 border border-violet-500/20"
            />
            <KpiCard
              label="Collected This Month"
              value={fmtK(cur?.total_collected ?? 0)}
              sub={`Rate: ${cur?.collection_rate ?? 0}%`}
              icon={<IndianRupee className="w-5 h-5 text-emerald-400" />}
              gradient="bg-emerald-500"
              accent="bg-emerald-500/10 border border-emerald-500/20"
              delta={`${cur?.paid ?? 0} paid`}
              deltaPositive
            />
            <KpiCard
              label="Outstanding"
              value={fmtK(cur?.total_outstanding ?? 0)}
              sub={`${cur?.pending ?? 0} pending`}
              icon={<Clock className="w-5 h-5 text-amber-400" />}
              gradient="bg-amber-500"
              accent="bg-amber-500/10 border border-amber-500/20"
              delta={cur?.pending ? `${cur.pending} bills` : undefined}
              deltaPositive={false}
            />
            <KpiCard
              label="Overdue Bills"
              value={String(cur?.overdue ?? 0)}
              sub={overall?.overdue ? `All-time: ${overall.overdue}` : "All clear"}
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
              gradient="bg-red-500"
              accent="bg-red-500/10 border border-red-500/20"
              delta={(cur?.overdue ?? 0) > 0 ? "Needs action" : "All clear"}
              deltaPositive={(cur?.overdue ?? 0) === 0}
            />
          </div>
        )}

        {/* ── Collection Rate Bar ──────────────────────── */}
        {cur && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-[#0e1118]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">
                  {MONTH_NAMES[selectedMonth]} {selectedYear} — Collection Progress
                </span>
              </div>
              <span className="text-sm font-bold text-violet-300">{cur.collection_rate}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cur.collection_rate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500"
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">₹0</span>
              <span className="text-xs text-slate-500">Target: ₹{fmt(cur.total_expected)}</span>
            </div>
          </motion.div>
        )}

        {/* ── Bills Table ──────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0e1118] overflow-hidden">
          {/* Table toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search tenant, phone or room…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              {["", "PENDING", "PAID", "OVERDUE"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s
                      ? "bg-violet-500/20 border border-violet-500/30 text-violet-300"
                      : "bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {billsLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="py-20 text-center">
                <Receipt className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No rent ledger records found</p>
                <p className="text-xs text-slate-600 mt-1">
                  {statusFilter ? `No ${statusFilter.toLowerCase()} records this period` : `Rent ledger records appear here once tenants submit payments for ${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Tenant", "Room", "Period", "Bill Amount", "Paid", "Balance", "Status", "Due", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map(bill => (
                    <BillTableRow
                      key={bill.id}
                      bill={bill}
                      onOpenLedger={(id, name) => { setLedgerTenantId(id); setLedgerTenantName(name); }}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
          {filteredBills.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
              <p className="text-xs text-slate-500">{filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} shown</p>
              <p className="text-xs text-slate-500">
                Total: ₹{fmt(filteredBills.reduce((s, b) => s + b.total_amount, 0))} |{" "}
                Collected: ₹{fmt(filteredBills.reduce((s, b) => s + b.paid_amount, 0))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing Ledger Drawer */}
      <BillingLedgerDrawer
        tenantId={ledgerTenantId}
        tenantName={ledgerTenantName}
        onClose={() => setLedgerTenantId(null)}
      />
    </div>
  );
};

export default BillingDashboardPage;
