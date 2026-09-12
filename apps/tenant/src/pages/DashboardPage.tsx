import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useTenantDashboardSummary,
  useTenantProfile
} from "../features/payment/hooks/useTenantDashboard";
import { useMyComplaints } from "../features/complaint/hooks/useTenantComplaint";
import { useMyPaymentHistory } from "../features/payment/hooks/useTenantPayment";
import { Button } from "@bhagirathi/ui";
import {
  Home,
  Megaphone,
  AlertTriangle,
  ArrowRight,
  Zap,
  History,
  CreditCard,
  ShieldAlert,
  Wrench,
  CheckCircle,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Queries — unchanged
  const { data: dashboard, isLoading: isDashLoading, isError: isDashError, refetch: refetchDash } = useTenantDashboardSummary();
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useTenantProfile();
  const { data: complaintsList, isLoading: isComplaintsLoading } = useMyComplaints({});
  const { data: paymentHistory, isLoading: isPaymentsLoading } = useMyPaymentHistory();

  const isLoading = isDashLoading || isProfileLoading || isComplaintsLoading || isPaymentsLoading;
  const isError = isDashError || isProfileError;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleRetry = () => {
    refetchDash();
    refetchProfile();
  };

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-5xl mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="space-y-2.5">
            <div className="h-7 w-44 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-3.5 w-56 bg-slate-100 dark:bg-zinc-800/60 rounded-lg" />
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 h-56 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
          <div className="lg:col-span-5 h-56 rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 h-64 rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
          <div className="lg:col-span-6 h-64 rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (isError || !dashboard || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-center shadow-sm select-none max-w-sm mx-auto my-16">
        <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 flex items-center justify-center mb-5 shadow-inner">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wider">
          Dashboard Unavailable
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed font-semibold">
          Unable to load your dashboard. Please check your connection and try again.
        </p>
        <Button onClick={handleRetry} className="btn-primary-tenant font-bold h-10 px-6 rounded-xl cursor-pointer">
          Retry
        </Button>
      </div>
    );
  }

  // ── Data ──────────────────────────────────────────────────────────────
  const overview = dashboard.overview || {};
  const payable = dashboard.total_payable || {};
  const notices = dashboard.notices || [];

  const payStatus = String(payable.payment_status || "").toUpperCase();
  const billGenerated = payable.bill_generated !== false;
  const isPending = billGenerated && ["PENDING", "AWAITING PAYMENT", "AWAITING_PAYMENT", "REJECTED", "OVERDUE", "PARTIALLY_PAID"].includes(payStatus);
  const isVerifying = ["SUBMITTED", "UNDER_VERIFICATION", "UNDER VERIFICATION", "UNDER REVIEW", "UNDER_REVIEW"].includes(payStatus);
  const noBill = !billGenerated || payStatus === "NO_BILL";

  const rentVal = payable.rent_share ?? 0;
  const elecVal = payable.electricity_share ?? 0;
  const totalVal = payable.outstanding_amount ?? (rentVal + elecVal);

  const importantNotice = notices.length > 0 ? notices[0] : null;
  const activeComplaint = (complaintsList || []).find(
    (c: any) => c.status === "OPEN" || c.status === "ASSIGNED" || c.status === "IN_PROGRESS"
  );

  const noticeActivities = (notices || []).slice(0, 3).map((notice: any) => ({
    type: "notice",
    title: notice.title,
    date: new Date(notice.published_at || new Date()),
    label: "📢 New Notice Published",
    color: "text-blue-700 bg-blue-50/80 border-blue-100 dark:bg-blue-955/15 dark:text-blue-400 dark:border-blue-900/20",
    link: "/notices"
  }));

  const complaintActivities = (complaintsList || []).slice(0, 3).map((complaint: any) => {
    const isClosed = complaint.status === "RESOLVED" || complaint.status === "CLOSED";
    return {
      type: "complaint",
      title: complaint.title,
      date: new Date(complaint.created_at || complaint.createdAt || new Date()),
      label: isClosed ? `✓ Complaint Resolved` : `🔧 Complaint: ${complaint.status}`,
      color: isClosed
        ? "text-green-700 bg-green-50/80 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
        : "text-red-700 bg-red-50/80 border-red-100 dark:bg-red-955/15 dark:text-red-400 dark:border-red-900/20",
      link: "/complaints"
    };
  });

  const paymentActivities = (paymentHistory || []).slice(0, 3).map((payment: any) => {
    const s = String(payment.status || "").toUpperCase();
    let label = "💳 Payment Submitted";
    let color = "text-blue-700 bg-blue-50/80 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";

    if (s === "PAID" || s === "VERIFIED") {
      label = "✓ Payment Verified";
      color = "text-green-700 bg-green-50/80 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30";
    } else if (s === "REJECTED" || s === "FAILED") {
      label = "✗ Payment Rejected";
      color = "text-red-700 bg-red-50/80 border-red-100 dark:bg-red-955/15 dark:text-red-400 dark:border-red-900/20";
    } else if (s === "PENDING") {
      label = "⏳ Payment Pending";
      color = "text-amber-700 bg-amber-50/80 border-amber-100 dark:bg-amber-955/15 dark:text-amber-400 dark:border-amber-900/20";
    } else if (s === "SUBMITTED" || s === "UNDER_REVIEW" || s === "UNDER_VERIFICATION") {
      label = "💳 Payment Submitted";
      color = "text-blue-700 bg-blue-50/80 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
    }

    return {
      type: "payment",
      title: `Combined Statement (UTR: ${payment.utr_number || "N/A"})`,
      date: new Date(payment.created_at || payment.createdAt || new Date()),
      label,
      color,
      link: "/payment-history"
    };
  });

  const allActivities = [...paymentActivities, ...complaintActivities, ...noticeActivities]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  const quickActions = [
    { name: "Pay Rent", path: "/pay-rent", icon: CreditCard, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-100 dark:border-red-500/20" },
    { name: "Electricity", path: "/electricity", icon: Zap, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20" },
    { name: "My Room", path: "/my-room", icon: Home, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20" },
    { name: "Payments", path: "/payment-history", icon: History, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20" },
    { name: "Complaint", path: "/complaints", icon: AlertTriangle, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20" },
    { name: "Notices", path: "/notices", icon: Megaphone, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/20" },
  ];

  const heroCardClass = isPending
    ? "payment-hero-card"
    : isVerifying
    ? "payment-hero-verified"
    : "payment-hero-neutral";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-5 pb-12 max-w-5xl mx-auto"
    >
      {/* ── 1. WELCOME HEADER ─────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="flex justify-between items-center pt-1 select-none"
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="h-4 w-4 text-red-500" />
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
              {getFormattedDate()}
            </p>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
            {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              {(profile?.full_name || "Tenant").split(" ")[0]}
            </span>{" "}
            👋
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-semibold">
            Here's the current overview of your accommodation stay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/pay-rent")}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-wider h-10 px-4 rounded-xl shadow-md shadow-red-500/20 hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Pay Rent</span>
          </button>

          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center font-black text-base uppercase text-white shrink-0 shadow-lg shadow-red-500/20 overflow-hidden">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (profile?.full_name || "Tenant").charAt(0)
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 2. PRIMARY GRID ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* PAYMENT HERO CARD */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className={`lg:col-span-7 ${heroCardClass} rounded-2xl p-6 shadow-xl flex flex-col justify-between select-none relative overflow-hidden`}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-6 h-44 w-44 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/70" />
                <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">
                  {isPending ? "Payment Due" : isVerifying ? "Under Verification" : "No Outstanding Dues"}
                </span>
              </div>
              <span className={`text-[9px] font-black py-1 px-3 rounded-full uppercase tracking-wider backdrop-blur-sm ${
                isPending
                  ? "bg-white/15 text-white border border-white/20"
                  : isVerifying
                  ? "bg-white/15 text-white border border-white/20"
                  : "bg-white/15 text-white border border-white/20"
              }`}>
                {payable.payment_status || "PAID"}
              </span>
            </div>

            <div className="space-y-1">
              {noBill ? (
                <>
                  <h2 className="text-3xl font-black text-white/30 tracking-tight">—</h2>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                    No bill generated yet
                  </p>
                </>
              ) : payStatus === "PAID" ? (
                <>
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
                    PAID
                  </h2>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                    Current Rent Settled
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
                    ₹{totalVal.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                    Total outstanding dues
                  </p>
                </>
              )}
            </div>

            {/* Breakdown pills */}
            {!noBill && payStatus !== "PAID" && (
              <div className="flex gap-3 pt-1">
                <div className="stat-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Home className="h-3 w-3 text-white/60" />
                  <div>
                    <p className="text-[8px] text-white/50 font-black uppercase tracking-wider">Rent</p>
                    <p className="text-xs font-black text-white">₹{rentVal.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="stat-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-white/60" />
                  <div>
                    <p className="text-[8px] text-white/50 font-black uppercase tracking-wider">Electric</p>
                    <p className="text-xs font-black text-white">₹{elecVal.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            )}

            {!noBill && payStatus === "PAID" && (
              <div className="flex gap-3 pt-1">
                <div className="stat-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-white/10 border border-white/20">
                  <div>
                    <p className="text-[8px] text-white/50 font-black uppercase tracking-wider">Next Rent</p>
                    <p className="text-xs font-black text-white">₹{(payable.next_rent || 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="stat-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5 bg-white/10 border border-white/20">
                  <div>
                    <p className="text-[8px] text-white/50 font-black uppercase tracking-wider">Next Due Date</p>
                    <p className="text-xs font-black text-white">
                      {payable.next_due_date ? new Date(payable.next_due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative pt-5 mt-2 flex items-center justify-between border-t border-white/10 gap-2">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
              {payStatus === "PAID" && payable.next_due_date
                ? `Next Due: ${new Date(payable.next_due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : payable.due_date
                ? `Due: ${new Date(payable.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                : noBill
                ? "No bill generated"
                : "Due date unavailable"}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/pay-rent")}
                className="flex items-center gap-1.5 bg-white text-red-700 font-black text-[11px] uppercase tracking-wider h-9 px-4 rounded-xl cursor-pointer hover:bg-red-50 transition-all shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Pay Rent</span>
              </button>

              {/* Phase 8: Pay Early shortcut — shown only when current month is PAID */}
              {payStatus === "PAID" && (
                <button
                  id="pay-early-btn"
                  onClick={() => navigate("/pay-rent?early=true")}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-wider h-9 px-3 rounded-xl cursor-pointer transition-all shadow-lg shadow-black/20 hover:-translate-y-0.5"
                  title="Pay next month's rent in advance"
                >
                  <span>Pay Early</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}

              <button
                onClick={() => navigate("/payment-history")}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-black text-[11px] uppercase tracking-wider h-9 px-3 rounded-xl cursor-pointer transition-all border border-white/15 hover:border-white/25"
              >
                <span>History</span>
              </button>
            </div>
          </div>
        </motion.div>


        {/* MY STAY CARD */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between select-none relative overflow-hidden"
        >
          {/* Faint house watermark */}
          <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
            <Home className="h-20 w-20 text-red-600" />
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">
                My Stay
              </span>
            </div>

            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight text-wrap-safe">
                {overview.hostel_name || "Bhagirathi Hostel"}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-semibold">
                {overview.building_name || "Block A"}
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-zinc-800/70 pt-4">
              <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl p-3">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Allocation</p>
                <p className="font-black text-sm text-gray-800 dark:text-gray-200 truncate">
                  Rm {overview.room_number || "N/A"}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold">
                  Bed {overview.bed_number || "B"}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-xl p-3">
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">Room Type</p>
                <p className="font-black text-sm text-gray-800 dark:text-gray-200">
                  {overview.capacity
                    ? overview.capacity === 1
                      ? "Single"
                      : overview.capacity === 2
                      ? "Double"
                      : `${overview.capacity} Share`
                    : "Double"}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold">Sharing</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800/70 pt-4 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-black">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse block" />
              Active Resident
            </div>
            <button
              onClick={() => navigate("/my-room")}
              className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-800/50 bg-white dark:bg-zinc-800/50 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all cursor-pointer"
            >
              View Details
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── 3. QUICK ACTIONS ──────────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={3} className="space-y-3">
        <div className="flex items-center gap-2 px-1 select-none">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Quick Actions
          </span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className={`qa-tile flex flex-col items-center justify-center gap-2.5 py-4 px-2 rounded-2xl border ${action.bg} ${action.border} cursor-pointer`}
              >
                <div className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm`}>
                  <Icon className={`h-4.5 w-4.5 ${action.color}`} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${action.color}`}>
                  {action.name}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── 4. LOWER GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* RECENT ACTIVITY TIMELINE */}
        <motion.div
          variants={fadeUp}
          custom={4}
          className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Recent Activity
              </span>
            </div>
            {allActivities.length > 0 && (
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {allActivities.length} events
              </span>
            )}
          </div>

          {allActivities.length > 0 ? (
            <div className="space-y-0">
              {allActivities.map((act, idx) => {
                const isLast = idx === allActivities.length - 1;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(act.link)}
                    className="relative flex gap-3.5 cursor-pointer group pb-4 last:pb-0"
                  >
                    {/* Vertical line */}
                    {!isLast && (
                      <div className="absolute left-4.5 top-9 bottom-0 w-px bg-slate-100 dark:bg-zinc-800" />
                    )}

                    {/* Icon bubble */}
                    <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border ${act.color} select-none`}>
                      {act.type === "payment" ? "💳" : act.type === "complaint" ? "🔧" : "📢"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-red-500 transition-colors">
                          {act.label}
                        </p>
                        <time className="text-[9px] text-gray-400 font-semibold tabular-nums shrink-0">
                          {act.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </time>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-300 mt-0.5 line-clamp-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-wrap-safe">
                        {act.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 select-none">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <History className="h-5 w-5 text-slate-300 dark:text-zinc-700" />
              </div>
              <p className="text-xs text-gray-400 font-semibold">No recent activities recorded.</p>
            </div>
          )}
        </motion.div>

        {/* ALERTS COLUMN */}
        <motion.div variants={fadeUp} custom={5} className="lg:col-span-6 space-y-4">

          {/* IMPORTANT NOTICE */}
          {importantNotice && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-blue-100/60 dark:border-blue-800/20 pb-3 select-none">
                <div className="h-7 w-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Megaphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                  Important Notice
                </span>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-gray-850 dark:text-white leading-normal text-wrap-safe">
                  {importantNotice.title}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-semibold text-wrap-safe">
                  {importantNotice.content || importantNotice.description || ""}
                </p>
              </div>
              <div className="flex justify-end pt-1 select-none">
                <button
                  onClick={() => navigate("/notices")}
                  className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                >
                  View Notice <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE COMPLAINT / ALL GOOD */}
          {activeComplaint ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3 select-none">
                <div className="h-7 w-7 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Wrench className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Active Request
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold select-none">
                <h4 className="font-black text-gray-800 dark:text-white truncate text-wrap-safe">
                  {activeComplaint.title}
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-gray-550">
                  Category: {activeComplaint.category}
                </p>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2 text-[10px] mt-2">
                  <span className="text-gray-500">
                    Status:{" "}
                    <span className="font-black text-blue-600 dark:text-blue-400 uppercase ml-1">
                      {activeComplaint.status}
                    </span>
                  </span>
                  <span className="text-gray-400">
                    {new Date(activeComplaint.updated_at || activeComplaint.created_at || "").toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-1 select-none">
                <button
                  onClick={() => navigate("/complaints")}
                  className="flex items-center gap-1.5 h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  View Complaint <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            importantNotice && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/15 dark:to-emerald-950/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 shadow-sm text-center select-none">
                <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-black text-gray-800 dark:text-white">All services functional</p>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">No active maintenance requests.</p>
              </div>
            )
          )}

          {/* If no notice and no complaint — show a "you're all good" card */}
          {!importantNotice && !activeComplaint && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/15 dark:to-emerald-950/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 shadow-sm text-center select-none">
              <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-black text-gray-800 dark:text-white">Everything's up to date</p>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold">No notices or active complaints.</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
