import React, { useState } from "react";
import {
  useTenantProfile,
  useTenantPaymentSummary,
  useTenantPaymentsHistory,
  useSubmitPayment,
  useTenantCurrentBill
} from "../features/payment/hooks/useTenantDashboard";
import { Button } from "@bhagirathi/ui";
import {
  Receipt,
  Clock,
  AlertTriangle,
  Home,
  CheckCircle,
  QrCode,
  Copy,
  Check,
  Upload,
  ArrowLeft,
  ArrowRight,
  Send,
  ShieldCheck,
  Activity,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const RentDetailsPage: React.FC = () => {
  const { data: profile, isLoading: isProfileLoading } = useTenantProfile();
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError, refetch: refetchSummary } = useTenantPaymentSummary();
  const { data: history, isLoading: isHistoryLoading, isError: isHistoryError, refetch: refetchHistory } = useTenantPaymentsHistory();
  const { data: currentBill } = useTenantCurrentBill();

  const submitMutation = useSubmitPayment();

  // Wizard and interaction states
  const [isPayFlowActive, setIsPayFlowActive] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isLoading = isProfileLoading || isSummaryLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-5xl mx-auto">
        <div className="h-10 w-32 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-28 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
          <div className="h-44 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
          <div className="h-44 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        </div>
        <div className="h-64 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isSummaryError || isHistoryError || !summary || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Unable to load details</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed text-wrap-safe">
          There was an error retrieving your rent split records. Please check your network connection.
        </p>
        <Button onClick={() => { refetchSummary(); refetchHistory(); }} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer">
          Retry Connection
        </Button>
      </div>
    );
  }

  const paymentDetails = currentBill?.hostel_payment_details || {};
  const upiId = paymentDetails.upi_id; // ISSUE-019 fix: remove hardcoded fallback
  const merchantName = paymentDetails.account_holder || "";

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    copiedFieldHandler(fieldName);
  };

  const copiedFieldHandler = (fieldName: string) => {
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    const ext = (file.name || "").split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
      setValidationError("Invalid format. Only JPG, JPEG, PNG, and WEBP supported.");
      return;
    }

    // Size validation (Max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError("Screenshot file size exceeds 10 MB limit.");
      return;
    }

    setValidationError(null);
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitSuccess(null);

    const trimmedUtr = (utrNumber || "").replace(/\s+/g, "").toUpperCase();
    if (trimmedUtr.length < 12 || trimmedUtr.length > 22) {
      setValidationError("UTR reference must be between 12 and 22 characters long.");
      return;
    }

    const isAlphanumeric = /^[A-Z0-9]+$/.test(trimmedUtr);
    if (!isAlphanumeric) {
      setValidationError("UTR reference must contain only alphanumeric characters.");
      return;
    }

    const targetBillId = summary.rent_id || summary.id;
    if (!targetBillId) {
      setValidationError("Active billing statement record is missing. Please contact support.");
      return;
    }

    try {
      const formData = new FormData();
      if (summary.rent_id) {
        formData.append("rent_id", summary.rent_id);
      }
      formData.append("payment_id", targetBillId);
      formData.append("utr", trimmedUtr);
      if (summary.total_amount) {
        formData.append("amount", String(summary.total_amount));
      }
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      await submitMutation.mutateAsync(formData);
      setSubmitSuccess("Your payment has been submitted successfully for verification!");
      setUtrNumber("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setIsPayFlowActive(false);
      refetchSummary();
      refetchHistory();
    } catch (err: any) {
      setValidationError(err?.response?.data?.detail || "Duplicate UTR code or invalid billing ID detected.");
    }
  };

  const getStatusBadge = (status: string) => {
    const normal = String(status || "").toUpperCase();
    if (normal === "VERIFIED" || normal === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
          <CheckCircle className="h-3 w-3" /> Verified
        </span>
      );
    }
    if (normal === "SUBMITTED" || normal === "UNDER_VERIFICATION" || normal === "UNDER VERIFICATION" || normal === "UNDER REVIEW" || normal === "UNDER_REVIEW") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
          <Clock className="h-3 w-3 animate-pulse" /> Submitted
        </span>
      );
    }
    if (normal === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-200 dark:border-red-900/30 animate-pulse">
          <AlertTriangle className="h-3 w-3" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-250 dark:border-amber-900/30">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  const summaryStatus = String(summary?.status || "").toUpperCase();

  const isDuesPending =
    summaryStatus === "PENDING" ||
    summaryStatus === "AWAITING PAYMENT" ||
    summaryStatus === "AWAITING_PAYMENT" ||
    summaryStatus === "REJECTED";

  // Timeline progress values
  const getTimelineProgress = (status: string) => {
    const normal = String(status || "").toUpperCase();
    if (normal === "VERIFIED" || normal === "PAID") return 4;
    if (normal === "UNDER_VERIFICATION" || normal === "UNDER VERIFICATION" || normal === "UNDER REVIEW" || normal === "UNDER_REVIEW") return 3;
    if (normal === "SUBMITTED") return 2;
    return 1;
  };

  const currentStep = getTimelineProgress(summary?.status || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">Payments Center</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Verify room-based shares, complete UPI payments, and track approval status.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isPayFlowActive ? (
          <motion.div
            key="summary-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Status Timeline */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 select-none">
              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-650 flex items-center justify-center shrink-0">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Bill Processing Pipeline</h4>
              </div>
              
              <div className="relative flex items-center justify-between mt-6 px-4">
                {/* Connecting Line */}
                <div className="absolute left-10 right-10 top-4 h-1 bg-slate-100 dark:bg-zinc-800 -z-10 rounded-full" />
                <div
                  className="absolute left-10 top-4 h-1 bg-red-600 transition-all duration-500 -z-10 rounded-full"
                  style={{ width: `${((currentStep - 1) / 3) * 80}%` }}
                />

                {/* Step 1: Awaiting */}
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-colors duration-300 ${
                    currentStep >= 1
                      ? summaryStatus === "REJECTED"
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-red-600 border-red-600 text-white"
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-stone-400"
                  }`}>
                    {summaryStatus === "REJECTED" ? "!" : "1"}
                  </div>
                  <span className="text-[10px] font-black uppercase mt-2.5 text-stone-700 dark:text-stone-300">
                    {summaryStatus === "REJECTED" ? "Rejected" : "Awaiting"}
                  </span>
                </div>

                {/* Step 2: Submitted */}
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-colors duration-300 ${
                    currentStep >= 2
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-stone-400"
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] font-black uppercase mt-2.5 text-stone-700 dark:text-stone-300">Submitted</span>
                </div>

                {/* Step 3: Verifying */}
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-colors duration-300 ${
                    currentStep >= 3
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-stone-400"
                  }`}>
                    3
                  </div>
                  <span className="text-[10px] font-black uppercase mt-2.5 text-stone-700 dark:text-stone-300">Verifying</span>
                </div>

                {/* Step 4: Settled */}
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs transition-colors duration-300 ${
                    currentStep >= 4
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-stone-400"
                  }`}>
                    ✓
                  </div>
                  <span className="text-[10px] font-black uppercase mt-2.5 text-stone-700 dark:text-stone-300">Settled</span>
                </div>
              </div>
            </div>

            {/* Grid for Room Information & Payment breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Room Information Card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <Home className="h-4.5 w-4.5 text-red-650" />
                  <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Lodging assignment</h4>
                </div>
                <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-450">Hostel Block:</span>
                    <span className="font-black text-stone-800 dark:text-white text-wrap-safe text-right max-w-[150px]">{profile?.hostel_name || "Not assigned"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-450">Room / Bed:</span>
                    <span className="font-black text-stone-805 dark:text-white">Room {summary?.room_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-450">Active Occupants:</span>
                    <span className="font-black text-stone-850 dark:text-white">{summary?.occupants ?? 0} Residents</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-zinc-800 pt-3">
                    <span className="text-stone-500 font-bold">Room Rent:</span>
                    <span className="font-black text-stone-800 dark:text-white">₹{Number(summary?.room_rent || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary Splits Card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <Receipt className="h-4.5 w-4.5 text-red-650" />
                  <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Billing Shares</h4>
                </div>
                <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-450">My Rent Share:</span>
                    <span className="font-black text-stone-800 dark:text-white">₹{Number(summary?.rent_share || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-450">Electricity Share:</span>
                    <span className="font-black text-stone-800 dark:text-white">₹{Number(summary?.electricity_share || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-450">Other Charges:</span>
                    <span className="font-black text-stone-800 dark:text-white">₹{Number(summary?.other_charges || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-zinc-800 pt-3">
                    <span className="text-stone-550 font-bold">Total Share:</span>
                    <span className="font-black text-red-650 dark:text-red-400">₹{Number(summary?.total_amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Current Due / Action Card */}
              <div className="bg-red-50/10 dark:bg-red-955/5 border border-red-500/20 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
                    <span className="font-black text-[10px] text-red-650 dark:text-red-400 uppercase tracking-wider">Current Bill</span>
                    {getStatusBadge(summary?.status || "")}
                  </div>
                  {isDuesPending && (
                    <p className="text-[9px] text-red-600/80 dark:text-red-400/80 font-bold uppercase tracking-wide">
                      You can pay your rent anytime before the due date.
                    </p>
                  )}
                  <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-450">Month:</span>
                      <span className="font-black text-stone-800 dark:text-white">{summary?.billing_month || "Current Month"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-450">Due Date:</span>
                      <span className="font-black text-red-650 dark:text-red-400">
                        {summary?.due_date ? new Date(summary.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between min-w-0">
                      <span className="text-stone-450 shrink-0">Reference:</span>
                      <span className="font-mono text-[10px] font-bold text-stone-800 dark:text-white select-all truncate ml-2">{summary?.payment_reference || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {isDuesPending ? (
                  <Button
                    onClick={() => setIsPayFlowActive(true)}
                    className="btn-primary-tenant mt-5 w-full h-10 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-white"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Pay Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="mt-5 text-center select-none text-[10px] font-black uppercase text-green-700 dark:text-green-400 bg-green-500/10 py-3 rounded-xl border border-green-500/20">
                    Settled / Under Review
                  </div>
                )}
              </div>
            </div>

            {submitSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-955/20 border border-green-250 dark:border-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-2xl flex items-center gap-2 select-none">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="payment-flow-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {/* Back to main summary link */}
            <button
              onClick={() => { setIsPayFlowActive(false); setValidationError(null); }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-red-650 hover:underline cursor-pointer select-none bg-transparent border-none p-0 outline-none uppercase tracking-wider"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Back to Billing Overview</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <QrCode className="h-5 w-5 text-red-650" />
                  <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">UPI Payment Gateway</h3>
                </div>

                {!upiId ? (
                  <div className="text-center p-6 select-none flex flex-col items-center justify-center min-h-[220px]">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mb-2 animate-pulse" />
                    <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider mb-1">Payment Details Not Configured</h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold leading-relaxed">
                      UPI payment details have not been set up by the hostel administrator.
                      Please contact the hostel office to make your payment directly, then enter your UTR below.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* QR Image */}
                      <div className="p-3 bg-white border border-slate-200 dark:border-zinc-800 rounded-2xl shrink-0 select-none shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${summary?.total_amount || 0}&tr=${summary?.payment_reference || ""}&cu=INR`
                          )}`}
                          alt="Merchant UPI QR Code"
                          className="h-36 w-36 object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-3.5 w-full text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Merchant Name</span>
                          <span className="font-bold text-xs text-stone-850 dark:text-white">{merchantName}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">UPI ID</span>
                          <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800 rounded-xl font-bold">
                            <span className="select-all text-stone-800 dark:text-stone-300 font-mono text-[11px] truncate max-w-[200px]">{upiId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(upiId, "upi")}
                              className="text-red-650 hover:text-red-700 bg-transparent border-none cursor-pointer outline-none ml-2 shrink-0"
                            >
                              {copiedField === "upi" ? <Check className="w-4 w-4 text-green-600 animate-bounce" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Exact Payable Amount</span>
                          <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800 rounded-xl font-bold">
                            <span className="text-stone-800 dark:text-stone-300">₹{Number(summary?.total_amount || 0).toLocaleString("en-IN")}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy((summary?.total_amount || 0).toString(), "amount")}
                              className="text-red-650 hover:text-red-700 bg-transparent border-none cursor-pointer outline-none ml-2 shrink-0"
                            >
                              {copiedField === "amount" ? <Check className="h-4 w-4 text-green-600 animate-bounce" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Payment Reference</span>
                          <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800 rounded-xl font-bold">
                            <span className="text-stone-800 dark:text-stone-300 font-mono select-all text-[11px] truncate max-w-[200px]">{summary?.payment_reference || ""}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(summary?.payment_reference || "", "ref")}
                              className="text-red-650 hover:text-red-700 bg-transparent border-none cursor-pointer outline-none ml-2 shrink-0"
                            >
                              {copiedField === "ref" ? <Check className="h-4 w-4 text-green-600 animate-bounce" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-150 dark:border-zinc-800 pt-4 space-y-3.5 select-none">
                      <span className="font-black text-[10px] text-stone-850 dark:text-white uppercase tracking-wider block">Payment Instructions:</span>
                      <div className="grid grid-cols-5 gap-2 text-center text-[9px] font-black text-stone-605 dark:text-stone-400">
                        <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 p-2 rounded-xl flex flex-col justify-center">
                          <span className="block text-red-600 font-black">Step 1</span>
                          <span className="block mt-1">Scan QR</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 p-2 rounded-xl flex flex-col justify-center">
                          <span className="block text-red-600 font-black">Step 2</span>
                          <span className="block mt-1">Pay Exact</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 p-2 rounded-xl flex flex-col justify-center">
                          <span className="block text-red-600 font-black">Step 3</span>
                          <span className="block mt-1">Copy UTR</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 p-2 rounded-xl flex flex-col justify-center">
                          <span className="block text-red-600 font-black">Step 4</span>
                          <span className="block mt-1">Upload</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-850 border border-slate-150 dark:border-zinc-800 p-2 rounded-xl flex flex-col justify-center">
                          <span className="block text-red-600 font-black">Step 5</span>
                          <span className="block mt-1">Submit</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* UTR entry & Screenshot card (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-650 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Verify &amp; Confirm</h3>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">UPI Transaction UTR Number *</label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="12-22 digit UTR number"
                      className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-mono uppercase"
                    />
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 block leading-normal">Alpha-numeric format. Spaces are trimmed.</span>
                  </div>

                  {/* Screenshot Drag area */}
                  <div className="space-y-1.5 select-none">
                    <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Transaction Screenshot (Optional)</label>
                    <div className="relative border border-dashed border-slate-200 dark:border-zinc-800 hover:border-red-600/50 rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all bg-slate-50 dark:bg-zinc-950/20 cursor-pointer">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      {screenshotPreview ? (
                        <div className="space-y-2">
                          <img src={screenshotPreview} alt="Screenshot preview" className="h-20 object-contain rounded-lg mx-auto border border-slate-200 dark:border-zinc-800 shadow-sm" />
                          <span className="text-xxs font-black text-red-600 block truncate max-w-xs">{screenshotFile?.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Upload className="h-6 w-6 text-stone-400 mx-auto" />
                          <span className="text-[10px] text-stone-500 font-bold block">Drag &amp; drop or click to upload</span>
                          <span className="text-[9px] text-stone-400 block">JPG, PNG, WEBP (Max 10 MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {validationError && (
                    <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 select-none">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="btn-primary-tenant w-full flex items-center justify-center gap-1.5 h-10 font-bold uppercase tracking-wider text-white"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit confirmation</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment History Registry */}
      <div className="space-y-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-650 flex items-center justify-center shrink-0">
            <History className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">Receipt history ledger</h3>
        </div>
        
        {!history || (history ?? []).length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-xs text-stone-400 font-bold">
            No payments generated or submitted in your account ledger history.
          </div>
        ) : (
          <>
            {/* Mobile: Card representation */}
            <div className="md:hidden space-y-4">
              {(history ?? []).map((h: any) => {
                let billingPeriod = "Rent Split";
                if (h.payment_reference) {
                  const parts = String(h.payment_reference || "").split("-");
                  if (parts.length >= 2 && (parts[1] || "").length === 6) {
                    const year = (parts[1] || "").substring(0, 4);
                    const month = parseInt((parts[1] || "").substring(4, 6));
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    if (month >= 1 && month <= 12) {
                      billingPeriod = `${months[month-1]} ${year}`;
                    }
                  }
                }
                const formattedDate = h.payment_date ? new Date(h.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
                return (
                  <div key={h.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800 pb-2">
                      <div>
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wide block">{billingPeriod}</span>
                        <span className="font-mono text-[9px] text-stone-400 select-all block mt-0.5">{h.payment_reference || "N/A"}</span>
                      </div>
                      {getStatusBadge(h.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Rent Share</span>
                        <span className="font-bold text-stone-850 dark:text-stone-200 block">₹{Number(h.rent_share || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Electricity</span>
                        <span className="font-bold text-stone-850 dark:text-stone-200 block">₹{Number(h.electricity_share || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Total Share</span>
                        <span className="font-black text-red-650 dark:text-red-400 block">₹{Number(h.total_amount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-400 uppercase font-black tracking-wider block">Submission Date</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-300 block">{formattedDate}</span>
                      </div>
                    </div>
                    {h.transaction_id && (
                      <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-150 dark:border-zinc-800/80 text-[10px] font-mono text-stone-500 flex justify-between items-center select-all">
                        <span className="truncate max-w-[200px]">{h.transaction_id}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-red-600 shrink-0">UTR</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop/Tablet Table */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-850 text-stone-450 uppercase font-black border-b border-slate-200 dark:border-zinc-800 text-[9px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Reference</th>
                      <th className="px-5 py-3.5">Period</th>
                      <th className="px-5 py-3.5">Rent Share</th>
                      <th className="px-5 py-3.5">Electricity</th>
                      <th className="px-5 py-3.5">Total Share</th>
                      <th className="px-5 py-3.5">UTR / Txn ID</th>
                      <th className="px-5 py-3.5">Submission Time</th>
                      <th className="px-5 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-semibold text-stone-600 dark:text-stone-300">
                    {(history ?? []).map((h: any) => {
                      let billingPeriod = "Rent Split";
                      if (h.payment_reference) {
                        const parts = String(h.payment_reference || "").split("-");
                        if (parts.length >= 2 && (parts[1] || "").length === 6) {
                          const year = (parts[1] || "").substring(0, 4);
                          const month = parseInt((parts[1] || "").substring(4, 6));
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          if (month >= 1 && month <= 12) {
                            billingPeriod = `${months[month-1]} ${year}`;
                          }
                        }
                      }

                      let subTime = "-";
                      if (h.transaction_id && h.payment_date) {
                        subTime = new Date(h.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                      }

                      return (
                        <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                          <td className="px-5 py-4 font-black text-stone-850 dark:text-gray-200 select-all">{h.payment_reference || "N/A"}</td>
                          <td className="px-5 py-4 uppercase text-[10px] text-red-600 font-black tracking-wide">{billingPeriod}</td>
                          <td className="px-5 py-4 tabular-nums">₹{Number(h.rent_share || 0).toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 tabular-nums">₹{Number(h.electricity_share || 0).toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 tabular-nums font-black text-stone-850 dark:text-white">₹{Number(h.total_amount || 0).toLocaleString("en-IN")}</td>
                          <td className="px-5 py-4 font-mono select-all text-[11px] font-bold text-stone-400">{h.transaction_id || "-"}</td>
                          <td className="px-5 py-4 text-[10px] text-stone-400">{subTime}</td>
                          <td className="px-5 py-4 text-right">
                            {getStatusBadge(h.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default RentDetailsPage;
