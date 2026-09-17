import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { ElectricityBill, ElectricityDashboardStats } from "@bhagirathi/types";
import { Button } from "@bhagirathi/ui";
import {
  Zap, Download, Search, FileText, CheckCircle, XCircle, X, AlertTriangle,
  RefreshCw, BarChart3, ShieldCheck, Printer, Banknote
} from "lucide-react";
import { ElectricityCashModal } from "./components/ElectricityCashModal";
import { ElectricityReadingModal } from "./components/ElectricityReadingModal";

export const ElectricityPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "ledger" | "verification" | "reports">(
    initialTab && ["dashboard", "history", "ledger", "verification", "reports"].includes(initialTab)
      ? (initialTab as any)
      : "dashboard"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["dashboard", "history", "ledger", "verification", "reports"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);
  
  // Overview Filters
  const [overviewHostelId, setOverviewHostelId] = useState("");
  const [overviewMonth, setOverviewMonth] = useState("");
  const [overviewYear, setOverviewYear] = useState("");

  // Ledger Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHostelId, setFilterHostelId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortKey] = useState<string>("created_at");
  const [sortDir] = useState<"asc" | "desc">("desc");

  // History Filters
  const [historyHostelId, setHistoryHostelId] = useState("");
  const [historyBuildingId] = useState(""); // building_id filter not yet in UI, but added in hook
  const [historyRoomId] = useState(""); // room_id filter not yet in UI, but added in hook
  const [historyMonth, setHistoryMonth] = useState("");
  const [historyYear, setHistoryYear] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  // Detail Modal
  const [selectedBill, setSelectedBill] = useState<ElectricityBill | null>(null);
  
  // Cash Collection Modal
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [selectedLedgerRow, setSelectedLedgerRow] = useState<any>(null);

  // Log Reading Modal
  const [readingModalOpen, setReadingModalOpen] = useState(false);

  // Verification Modal
  const [reviewBill, setReviewBill] = useState<any | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Media URL Helper (Production Safe)
  const getMediaUrl = (path?: string | null): string => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = (apiClient.defaults.baseURL || "").replace(/\/+$/, "");
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Queries
  const {
    data: stats,
    isLoading: loadingStats,
    isError: errorStats,
    error: statsError,
    refetch: refetchStats,
    isFetching: fetchingStats,
  } = useQuery<ElectricityDashboardStats>({
    queryKey: ["electricity-stats", overviewHostelId, overviewMonth, overviewYear],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (overviewHostelId) params.hostel_id = overviewHostelId;
      if (overviewMonth) params.month = overviewMonth;
      if (overviewYear) params.year = overviewYear;
      const res = await apiClient.get("/api/v1/electricity-bills/dashboard/stats", { params });
      return res.data;
    }
  });

  const { data: hostels } = useQuery<any[]>({
    queryKey: ["hostels-list"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/hostels");
      return res.data;
    }
  });

  const { data: bills, isLoading: loadingBills, refetch: refetchBills, isFetching: fetchingBills } = useQuery<any[]>({
    queryKey: ["electricity-dues", searchQuery, filterHostelId, filterStatus, sortKey, sortDir],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (searchQuery.trim()) params.tenant_name = searchQuery;
      if (filterHostelId) params.hostel_id = filterHostelId;
      if (filterStatus) params.status = filterStatus;
      
      const res = await apiClient.get("/api/v1/electricity-bills/tenant-dues", { params });
      return res.data;
    }
  });

  const { data: historyBills, isLoading: loadingHistoryBills, refetch: refetchHistoryBills, isFetching: fetchingHistoryBills } = useQuery<any[]>({
    queryKey: ["electricity-history", historyHostelId, historyBuildingId, historyRoomId, historyMonth, historyYear, historyStatus],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (historyHostelId) params.hostel_id = historyHostelId;
      if (historyBuildingId) params.building_id = historyBuildingId;
      if (historyRoomId) params.room_id = historyRoomId;
      if (historyMonth) params.month = historyMonth;
      if (historyYear) params.year = historyYear;
      if (historyStatus) params.status = historyStatus;
      
      const res = await apiClient.get("/api/v1/electricity-bills", { params });
      return res.data;
    }
  });

  const { data: paymentHistory, isLoading: loadingHistory } = useQuery<any[]>({
    queryKey: ["electricity-payment-history"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/payments", { params: { payment_type: "ELECTRICITY" } });
      return res.data.filter((p: any) => p.payment_type === "ELECTRICITY");
    }
  });

  const { data: pendingBills, isLoading: loadingPending, refetch: refetchPending, isFetching: fetchingPending } = useQuery<any[]>({
    queryKey: ["electricity-pending-verification"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/electricity-bills/pending/verification");
      return res.data;
    }
  });

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: async ({ billId, remarks }: { billId: string; remarks: string }) => {
      const formData = new FormData();
      if (remarks) formData.append("remarks", remarks);
      const res = await apiClient.put(`/api/v1/electricity-bills/${billId}/verify`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electricity-stats"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-dues"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-pending-verification"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-payment-history"] });
      alert("Payment verified successfully!");
      setReviewBill(null);
      setVerificationRemarks("");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ billId, remarks }: { billId: string; remarks: string }) => {
      const formData = new FormData();
      if (remarks) formData.append("remarks", remarks);
      const res = await apiClient.put(`/api/v1/electricity-bills/${billId}/reject`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electricity-stats"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-dues"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-pending-verification"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-payment-history"] });
      alert("Payment rejected.");
      setReviewBill(null);
      setVerificationRemarks("");
    }
  });

  // Actions
  const handleVerify = async () => {
    if (!reviewBill) return;
    try {
      setIsVerifying(true);
      const targetId = reviewBill.payment_id || reviewBill.id;
      await verifyMutation.mutateAsync({ billId: targetId, remarks: verificationRemarks });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!reviewBill) return;
    if (!verificationRemarks) {
      alert("Please provide a reason / remarks for rejecting the payment.");
      return;
    }
    try {
      setIsVerifying(true);
      const targetId = reviewBill.payment_id || reviewBill.id;
      await rejectMutation.mutateAsync({ billId: targetId, remarks: verificationRemarks });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Rejection failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const exportToCSV = () => {
    if (!bills || bills.length === 0) return;
    const headers = ["Tenant Name", "Room", "Bill Month/Year", "Meter Units", "Tenant Share", "Amount Paid", "Outstanding", "Payment Status", "Due Date"];
    const rows = bills.map(b => [
      b.tenant_name || "N/A",
      b.room_number || "N/A",
      `${b.bill_month}/${b.bill_year}`,
      b.units,
      b.tenant_share,
      b.amount_paid,
      b.outstanding,
      b.payment_status,
      b.due_date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `electricity_bills_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("en-US", { month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-lg font-black text-primaryText dark:text-white leading-tight uppercase tracking-wider">Electricity Management</h1>
          <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5">Generate, audit, verify and reconcile PG electricity billing</p>
        </div>
        <button
          onClick={() => {
            refetchStats();
            refetchBills();
            refetchPending();
            refetchHistoryBills();
          }}
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted hover:text-primary cursor-pointer border border-border bg-white dark:bg-gray-900 px-3 py-1.5 rounded transition"
        >
          <RefreshCw className={`h-3 w-3 ${fetchingStats || fetchingBills || fetchingPending || fetchingHistoryBills ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border select-none">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "dashboard" ? "border-primary text-primary" : "border-transparent text-muted hover:text-secondaryText"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted hover:text-secondaryText"
          }`}
        >
          <Zap className="h-4 w-4" /> Reading History
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "ledger" ? "border-primary text-primary" : "border-transparent text-muted hover:text-secondaryText"
          }`}
        >
          <FileText className="h-4 w-4" /> Bills Ledger
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "verification" ? "border-primary text-primary" : "border-transparent text-muted hover:text-secondaryText"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Verification Queue ({pendingBills?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "reports" ? "border-primary text-primary" : "border-transparent text-muted hover:text-secondaryText"
          }`}
        >
          <Printer className="h-4 w-4" /> Payment History
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Overview Filter Bar */}
            <div className="glass-panel p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 items-end select-none">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Filter by PG</label>
                <select
                  value={overviewHostelId}
                  onChange={(e) => setOverviewHostelId(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All PG Hostels</option>
                  {hostels?.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Month</label>
                <select
                  value={overviewMonth}
                  onChange={(e) => setOverviewMonth(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={overviewYear}
                  onChange={(e) => setOverviewYear(e.target.value)}
                  className="h-9 px-3 border border-border dark:border-gray-850 rounded bg-gray-55/35 dark:bg-gray-955 text-xs text-primaryText focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                {(overviewHostelId || overviewMonth || overviewYear) && (
                  <button
                    onClick={() => {
                      setOverviewHostelId("");
                      setOverviewMonth("");
                      setOverviewYear("");
                    }}
                    className="h-9 px-3 text-[10px] font-bold uppercase tracking-wider text-muted hover:text-red-500 border border-border rounded cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Error State */}
            {errorStats ? (
              <div className="glass-panel p-6 border-red-500/30 bg-red-50/10 text-center space-y-3 select-none">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Failed to Load Electricity Overview
                </h4>
                <p className="text-[11px] text-muted max-w-md mx-auto">
                  {(statsError as any)?.response?.data?.detail || (statsError as any)?.message || "Unable to retrieve electricity statistics from the server."}
                </p>
                <button
                  onClick={() => refetchStats()}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-white py-1.5 px-4 rounded hover:bg-primary-hover transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : loadingStats ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-pulse select-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-white dark:bg-gray-900 border border-border rounded-card" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 select-none">
                <div className="glass-card p-4.5">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Collection</span>
                  <span className="text-xl font-mono font-black text-emerald-600 mt-1 block drop-shadow-sm">
                    ₹{Number(stats?.total_collection ?? stats?.total_collected ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="glass-card p-4.5">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Outstanding</span>
                  <span className="text-xl font-mono font-black text-amber-600 mt-1 block drop-shadow-sm">
                    ₹{Number(stats?.pending_bills_amount ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="glass-card p-4.5">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Generated Today</span>
                  <span className="text-xl font-mono font-black text-blue-600 mt-1 block drop-shadow-sm">
                    {stats?.today_generated_count ?? 0} bills
                  </span>
                </div>
                <div className="glass-card p-4.5">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Paid Bills</span>
                  <span className="text-xl font-mono font-black text-emerald-600 mt-1 block drop-shadow-sm">
                    {stats?.paid_bills_count ?? stats?.paid ?? 0}
                  </span>
                </div>
                <div className="glass-card p-4.5 border-red-500/30">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Overdue Bills</span>
                  <span className="text-xl font-mono font-black text-red-600 mt-1 block drop-shadow-sm">
                    {stats?.overdue_bills_count ?? stats?.overdue ?? 0}
                  </span>
                </div>
              </div>
            )}

            {/* Monthly trends trend visualizer */}
            <div className="glass-panel p-5 space-y-4 select-none">
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Monthly Billing Revenue Collection Trend</h3>
              {stats?.monthly_revenue && stats.monthly_revenue.length > 0 ? (
                <div className="flex items-end justify-around h-48 pt-6 border-b border-gray-100 dark:border-gray-800">
                  {stats.monthly_revenue.map((item, idx) => {
                    const maxAmt = Math.max(...stats.monthly_revenue.map(r => r.amount), 1);
                    const heightPercent = `${(item.amount / maxAmt) * 80 + 10}%`;
                    return (
                      <div key={idx} className="flex flex-col items-center group w-12">
                        <span className="text-[8px] font-bold font-mono text-muted mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{item.amount.toLocaleString()}
                        </span>
                        <div
                          style={{ height: heightPercent }}
                          className="w-8 bg-gradient-to-t from-primary/50 to-primary rounded-t transition-all hover:scale-105"
                        />
                        <span className="text-[9px] font-bold text-secondaryText dark:text-gray-300 mt-2 block">
                          {getMonthName(item.month)} '{String(item.year).substring(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-muted font-semibold">
                  No billing trend data logged.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 select-none">
              <h2 className="text-sm font-black uppercase tracking-wider text-primaryText dark:text-white">Meter Reading Logs</h2>
              <Button onClick={() => setReadingModalOpen(true)} className="bg-primary text-white text-[10px] font-bold py-1.5 px-3">
                <Zap className="h-3.5 w-3.5 mr-1" /> Log New Reading
              </Button>
            </div>
            {/* History Filter Bar */}
            <div className="glass-panel p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 items-end select-none">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Filter by PG</label>
                <select
                  value={historyHostelId}
                  onChange={(e) => setHistoryHostelId(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All PG Hostels</option>
                  {hostels?.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Month</label>
                <select
                  value={historyMonth}
                  onChange={(e) => setHistoryMonth(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={historyYear}
                  onChange={(e) => setHistoryYear(e.target.value)}
                  className="h-9 px-3 border border-border dark:border-gray-850 rounded bg-gray-55/35 dark:bg-gray-955 text-xs text-primaryText focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Status</label>
                <select
                  value={historyStatus}
                  onChange={(e) => setHistoryStatus(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
            </div>

            {/* History Table */}
            <div className="glass-panel overflow-x-auto shadow-sm">
              <table className="w-full border-collapse text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-gray-55/50 dark:bg-gray-955/40 border-b border-border select-none text-muted font-bold">
                    <th className="p-3">Location (Hierarchy)</th>
                    <th className="p-3">Period</th>
                    <th className="p-3 text-right">Prev ➔ Curr</th>
                    <th className="p-3 text-right">Consumption</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Date Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingHistoryBills ? (
                    [...Array(3)].map((_, idx) => (
                      <tr key={idx} className="border-b border-border animate-pulse">
                        <td colSpan={8} className="p-8 bg-gray-50/10" />
                      </tr>
                    ))
                  ) : historyBills && historyBills.length > 0 ? (
                    historyBills.map(b => (
                      <tr key={b.id} className="border-b border-border hover:bg-gray-55/20 dark:hover:bg-gray-855/10">
                        <td className="p-3">
                          <span className="font-bold text-primaryText dark:text-white block">Room {b.room_number || "N/A"}</span>
                          <span className="text-[9px] text-muted font-semibold">{b.hostel_name} › {b.building_name} › {b.floor_name}</span>
                        </td>
                        <td className="p-3 font-semibold">{getMonthName(b.bill_month)} {b.bill_year}</td>
                        <td className="p-3 text-right font-mono text-muted tracking-tight">
                          {b.previous_reading} ➔ {b.current_reading}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">{b.units} Units</td>
                        <td className="p-3 text-right font-mono font-semibold text-secondaryText">₹{Number(b.unit_rate).toFixed(1)}</td>
                        <td className="p-3 text-right font-mono font-black text-primary">₹{Number(b.bill_amount).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-center">
                          <span className={`pg-badge text-[8.5px] font-bold uppercase tracking-wider py-0.5 px-2 ${
                            b.status === "PAID" ? "bg-green-150 text-green-750" : b.status === "PARTIALLY_PAID" ? "bg-amber-150 text-amber-800" : "bg-red-150 text-red-750"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-center text-secondaryText">{new Date(b.created_at).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-10 text-center select-none">
                        <FileText className="h-8 w-8 text-muted mx-auto mb-2" />
                        <span className="font-semibold text-muted">No electricity history found.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="space-y-4">
            {/* Filtering toolbar */}
            <div className="glass-panel p-4 shadow-sm grid grid-cols-4 gap-4 items-end select-none">
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Search Tenant</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 border border-border dark:border-gray-850 rounded bg-gray-55/35 dark:bg-gray-955 text-xs text-primaryText focus:outline-none"
                    placeholder="Search by name..."
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Filter by PG</label>
                <select
                  value={filterHostelId}
                  onChange={(e) => setFilterHostelId(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All PG Hostels</option>
                  {hostels?.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-muted uppercase tracking-widest">Billing Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-9 px-2 border border-border dark:border-gray-855 rounded bg-gray-55/35 dark:bg-gray-955 text-xs font-semibold text-secondaryText focus:outline-none cursor-pointer"
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              <Button
                onClick={exportToCSV}
                className="inline-flex items-center justify-center gap-1.5 font-bold h-9 text-white bg-primary cursor-pointer"
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>

            {/* List Table */}
            <div className="glass-panel overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-55/50 dark:bg-gray-955/40 border-b border-border select-none text-muted font-bold">
                    <th className="p-3">Tenant Name</th>
                    <th className="p-3">Room</th>
                    <th className="p-3">Month</th>
                    <th className="p-3 text-right">Meter Units</th>
                    <th className="p-3 text-right">Tenant Share</th>
                    <th className="p-3 text-right">Amount Paid</th>
                    <th className="p-3 text-right">Outstanding</th>
                    <th className="p-3 text-center">Due Date</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBills ? (
                    [...Array(3)].map((_, idx) => (
                      <tr key={idx} className="border-b border-border animate-pulse">
                        <td colSpan={9} className="p-8 bg-gray-50/10" />
                      </tr>
                    ))
                  ) : bills && bills.length > 0 ? (
                    bills.map(b => (
                      <tr key={b.id} className="border-b border-border hover:bg-gray-55/20 dark:hover:bg-gray-855/10">
                        <td className="p-3 font-bold text-primaryText dark:text-white">{b.tenant_name}</td>
                        <td className="p-3 text-secondaryText">{b.room_number ? `Room ${b.room_number}` : "N/A"}</td>
                        <td className="p-3 font-semibold">{getMonthName(b.bill_month)} {b.bill_year}</td>
                        <td className="p-3 text-right font-mono font-semibold text-muted tracking-tight">{b.units}</td>
                        <td className="p-3 text-right font-mono font-black text-primary">₹{Number(b.tenant_share).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">₹{Number(b.amount_paid).toLocaleString("en-IN")}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-600">₹{Number(b.outstanding).toLocaleString("en-IN")}</td>
                        <td className="p-3 font-semibold text-center text-secondaryText">{b.due_date ? new Date(b.due_date).toLocaleDateString("en-IN") : "N/A"}</td>
                        <td className="p-3 text-center">
                          <span className={`pg-badge text-[8.5px] font-bold uppercase tracking-wider py-0.5 px-2 ${
                            b.payment_status === "PAID" ? "bg-green-150 text-green-750" : b.payment_status === "PARTIALLY_PAID" ? "bg-amber-150 text-amber-800" : "bg-red-150 text-red-750"
                          }`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            disabled={b.payment_status === "PAID"}
                            onClick={() => {
                              setSelectedLedgerRow(b);
                              setCashModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white font-bold rounded cursor-pointer transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-[10px]"
                          >
                            <Banknote className="h-3.5 w-3.5" /> Record Cash
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-10 text-center select-none">
                        <Zap className="h-8 w-8 text-muted mx-auto mb-2" />
                        <span className="font-semibold text-muted">No electricity billing logs found.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "verification" && (
          <div className="space-y-4">
            <div className="glass-panel overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-55/50 dark:bg-gray-955/40 border-b border-border select-none text-muted font-bold">
                    <th className="p-3">Tenant</th>
                    <th className="p-3">Billing Month</th>
                    <th className="p-3">Amount Payable</th>
                    <th className="p-3">UTR Reference</th>
                    <th className="p-3">Submit Date</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPending ? (
                    [...Array(3)].map((_, idx) => (
                      <tr key={idx} className="border-b border-border animate-pulse">
                        <td colSpan={6} className="p-8 bg-gray-50/10" />
                      </tr>
                    ))
                  ) : pendingBills && pendingBills.length > 0 ? (
                    pendingBills.map((b: any) => (
                      <tr key={b.payment_id || b.id} className="border-b border-border hover:bg-gray-55/20 dark:hover:bg-gray-855/10">
                        <td className="p-3 font-bold text-primaryText dark:text-white">{b.tenant_name || "N/A"}</td>
                        <td className="p-3 font-semibold">{getMonthName(b.bill_month)} {b.bill_year}</td>
                        <td className="p-3 font-mono font-black text-primary">₹{Number(b.bill_amount).toLocaleString("en-IN")}</td>
                        <td className="p-3 font-mono font-bold text-muted select-all">UTR: {b.utr_number || b.meter_number || "N/A"}</td>
                        <td className="p-3 text-secondaryText">{b.updated_at || b.submitted_at ? new Date(b.updated_at || b.submitted_at).toLocaleDateString("en-IN") : "N/A"}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setReviewBill(b);
                              setVerificationRemarks("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white font-bold rounded cursor-pointer transition hover:bg-primary-hover text-[10px]"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Review Dues
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center select-none">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 animate-bounce" />
                        <span className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">Verification Queue Clear</span>
                        <p className="text-[10px] text-muted mt-1 leading-relaxed">No pending electricity payments require review.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Summary details */}
            <div className="bg-white dark:bg-gray-900 border border-border rounded-card p-5 shadow-card space-y-4">
              <div className="flex justify-between items-center select-none border-b border-gray-150 pb-3">
                <h3 className="text-xs font-black text-primaryText dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="h-4.5 w-4.5 text-primary" /> PG Consumption & Billing Audit Report
                </h3>
                <Button
                  onClick={exportToCSV}
                  className="font-bold h-8.5 px-3 cursor-pointer inline-flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> Export Report CSV
                </Button>
              </div>

              {/* Table details */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-gray-55/50 dark:bg-gray-955/40 border-b border-border select-none text-muted font-bold">
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Tenant Name</th>
                      <th className="p-3">Billing Month</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Method</th>
                      <th className="p-3 text-center">Reference</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      [...Array(3)].map((_, idx) => (
                        <tr key={idx} className="border-b border-border animate-pulse">
                          <td colSpan={7} className="p-8 bg-gray-50/10" />
                        </tr>
                      ))
                    ) : paymentHistory && paymentHistory.length > 0 ? (
                      paymentHistory.map((p: any, idx: number) => (
                        <tr key={p.id || idx} className="border-b border-border hover:bg-gray-55/20 dark:hover:bg-gray-855/10">
                          <td className="p-3 font-semibold">{p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "N/A"}</td>
                          <td className="p-3 font-bold text-primaryText dark:text-white">Tenant ID: {p.tenant_id ? p.tenant_id.toString().substring(0,6) : "N/A"}...</td>
                          <td className="p-3 font-semibold">{p.billing_month}/{p.billing_year}</td>
                          <td className="p-3 text-right font-mono font-black text-emerald-600">₹{Number(p.amount).toFixed(2)}</td>
                          <td className="p-3 text-center text-muted font-semibold">{p.payment_method}</td>
                          <td className="p-3 text-center font-mono text-muted">{p.transaction_id || "N/A"}</td>
                          <td className="p-3 text-center">
                            <span className={`pg-badge text-[8px] font-bold uppercase tracking-wider py-0.5 px-2 ${
                              p.payment_status === "VERIFIED" || p.payment_status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {p.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted">No electricity payment history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setSelectedBill(null)} />
          <div className="relative max-w-md w-full bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card overflow-hidden shadow-card flex flex-col z-10 p-5 space-y-4">
            <div className="flex justify-between items-center select-none border-b border-gray-150 dark:border-gray-850 pb-3">
              <h3 className="text-xs font-black text-primaryText dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4.5 w-4.5 text-amber-550 fill-amber-550" /> Electricity Invoice Detail
              </h3>
              <button onClick={() => setSelectedBill(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-primaryText rounded transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs select-none">
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Resident Tenant</span>
                <span className="font-extrabold text-primaryText dark:text-white">{selectedBill.tenant_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Allocated PG Room</span>
                <span className="font-semibold text-secondaryText dark:text-gray-200">
                  {selectedBill.room_number ? `Room ${selectedBill.room_number}` : "N/A"} ({selectedBill.hostel_name})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Billing Cycle Period</span>
                <span className="font-semibold text-secondaryText dark:text-gray-200">
                  {getMonthName(selectedBill.bill_month)} {selectedBill.bill_year}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Meter Index Range</span>
                <span className="font-mono font-bold text-secondaryText dark:text-gray-200">
                  {selectedBill.previous_reading} ➔ {selectedBill.current_reading} KWh
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Units Consumed × Rate</span>
                <span className="font-semibold text-secondaryText dark:text-gray-200">
                  {selectedBill.units_consumed} units × ₹{selectedBill.rate_per_unit}/unit
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Total Room Bill</span>
                <span className="font-semibold text-secondaryText dark:text-gray-200">
                  ₹{Number(selectedBill.bill_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Active Occupants</span>
                <span className="font-semibold text-secondaryText dark:text-gray-200">
                  {(selectedBill as any).occupant_count || 1}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850 font-black text-sm">
                <span className="text-primaryText dark:text-white">Amount Dues (Per Tenant Share)</span>
                <span className="text-primary">₹{(Number(selectedBill.bill_amount) / Math.max(1, (selectedBill as any).occupant_count || 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Payment Status</span>
                <span className="font-extrabold uppercase text-primary">{selectedBill.payment_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-850">
                <span className="text-muted font-bold">Settlement Status</span>
                <span className="font-extrabold uppercase text-primary">{selectedBill.status}</span>
              </div>
              {selectedBill.remarks && (
                <div className="p-3 bg-gray-50 dark:bg-gray-955 rounded-xl border border-border">
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Remarks / Notes</span>
                  <p className="text-[10px] text-primaryText mt-1 font-medium">{selectedBill.remarks}</p>
                </div>
              )}
            </div>

            <Button onClick={() => setSelectedBill(null)} className="w-full font-bold h-9.5 text-white">
              Close Detail Panel
            </Button>
          </div>
        </div>
      )}

      {/* Payment Review Modal */}
      {reviewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setReviewBill(null)} />
          <div className="relative max-w-2xl w-full bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card overflow-hidden shadow-card flex flex-col z-10 p-5 space-y-4">
            <div className="flex justify-between items-center select-none border-b border-gray-150 dark:border-gray-850 pb-3">
              <h3 className="text-xs font-black text-primaryText dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Review Submitted Transaction Receipt
              </h3>
              <button onClick={() => setReviewBill(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-muted hover:text-primaryText rounded transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Left Details */}
              <div className="space-y-3.5 text-xs select-none">
                <div>
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Resident Tenant</span>
                  <span className="text-xs font-extrabold text-primaryText dark:text-white mt-0.5 block">{reviewBill.tenant_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Billing Dues Amount</span>
                  <span className="text-sm font-mono font-black text-primary mt-0.5 block">₹{Number(reviewBill.bill_amount).toLocaleString("en-IN")}</span>
                </div>
                {/* UTR */}
                <div>
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">UTR/Transaction Ref Reference</span>
                  <span className="text-xs font-mono font-black text-green-700 bg-green-50 border border-green-200 dark:bg-green-955/20 dark:text-green-400 dark:border-green-900/30 p-1.5 mt-0.5 rounded block select-all">
                    {reviewBill.utr_number || reviewBill.meter_number || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block">Submit Timestamp</span>
                  <span className="text-xs font-semibold text-secondaryText dark:text-gray-300 mt-0.5 block">
                    {reviewBill.updated_at || reviewBill.submitted_at ? new Date(reviewBill.updated_at || reviewBill.submitted_at).toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>

                {/* Remarks Input */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-[9px] font-black text-muted uppercase tracking-wider">Verification Remarks (Required for rejection)</label>
                  <textarea
                    rows={2}
                    value={verificationRemarks}
                    onChange={(e) => setVerificationRemarks(e.target.value)}
                    className="w-full p-2 border border-border dark:border-gray-800 rounded bg-white dark:bg-gray-955 text-xs text-primaryText focus:outline-none focus:ring-1 focus:ring-primary placeholder-muted"
                    placeholder="Enter approval details or reason for rejection..."
                  />
                </div>
              </div>

              {/* Right Receipt Image */}
              <div className="space-y-2 select-none flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-muted font-black uppercase tracking-wider block mb-1">Receipt Screenshot Proof</span>
                  <div className="border border-border dark:border-gray-800 rounded-card overflow-hidden bg-gray-50 dark:bg-gray-955/50 h-56 flex items-center justify-center relative group">
                    {reviewBill.proof_image_url || reviewBill.meter_photo ? (
                      <img
                        src={getMediaUrl(reviewBill.proof_image_url || reviewBill.meter_photo)}
                        alt="Transaction Proof"
                        className="max-h-full max-w-full object-contain cursor-zoom-in"
                        onClick={() => {
                          const url = getMediaUrl(reviewBill.proof_image_url || reviewBill.meter_photo);
                          if (url) window.open(url, "_blank");
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-1 animate-pulse" />
                        <span className="text-[9px] font-bold">Screenshot proof missing</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={handleReject}
                    disabled={isVerifying}
                    className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs cursor-pointer disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="h-4.5 w-4.5" /> Reject Payment
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs cursor-pointer disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="h-4.5 w-4.5" /> Approve & Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Electricity Cash Collection Modal */}
      <ElectricityCashModal
        isOpen={cashModalOpen}
        onClose={() => {
          setCashModalOpen(false);
          setSelectedLedgerRow(null);
        }}
        billData={selectedLedgerRow}
      />
      
      <ElectricityReadingModal 
        isOpen={readingModalOpen} 
        onClose={() => setReadingModalOpen(false)} 
      />
    </div>
  );
};

export default ElectricityPage;
