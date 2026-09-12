import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useCurrentBill, usePayRentMutation, useAdvancePaymentContext, usePayAdvanceRentMutation } from "../features/payment/hooks/useTenantPayment";
import { Button } from "@bhagirathi/ui";
import {
  QrCode, Upload, AlertCircle, CheckCircle2, ShieldCheck, Copy, Check,
  ExternalLink, Calendar, Home, Clock, ArrowRight,
  FileText, Image as ImageIcon, Eye, Sparkles, X, ArrowLeft, Zap, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const paymentFormSchema = zod.object({
  utr_number: zod.string()
    .min(12, "UTR number must be at least 12 characters long")
    .max(22, "UTR number must not exceed 22 characters")
    .regex(/^[a-zA-Z0-9]+$/, "UTR must contain only letters and numbers"),
  amount: zod.string().optional(),
  remarks: zod.string().optional(),
});

type PaymentFormValues = {
  utr_number: string;
  amount?: string;
  remarks?: string;
};

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface HostelUpiQrCardProps {
  upiId?: string;
  upiName?: string;
  bankName?: string;
  qrUrl?: string;
  upiLink?: string;
  amount: number;
  copied: boolean;
  onCopyUpi: (upi: string) => void;
  accentColor?: "red" | "emerald";
}

const HostelUpiQrCard: React.FC<HostelUpiQrCardProps> = ({
  upiId,
  upiName,
  bankName,
  qrUrl,
  upiLink,
  amount,
  copied,
  onCopyUpi,
  accentColor = "red",
}) => {
  if (!upiId) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 text-center shadow-sm select-none flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-3 animate-pulse" />
        <h4 className="font-black text-sm text-stone-850 dark:text-white uppercase tracking-wider mb-2">Payment Details Not Configured</h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-semibold">
          UPI payment details have not been set up by the hostel administrator.
          Please contact the hostel office to make your payment directly, then submit your UTR reference below.
        </p>
      </div>
    );
  }

  const isEmerald = accentColor === "emerald";
  const badgeClass = isEmerald
    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/30 text-emerald-600 dark:text-emerald-400"
    : "bg-red-50 dark:bg-red-955/20 border-red-200/30 text-red-650";
  const copyBtnColor = isEmerald ? "text-emerald-600" : "text-red-650";
  const upiBtnClass = isEmerald
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[9px] font-black uppercase tracking-wider mb-4 select-none ${badgeClass}`}>
        <QrCode className="w-3.5 h-3.5 animate-pulse" />
        <span>Hostel Official UPI QR</span>
      </div>

      {/* Dynamic QR Display */}
      <div className="p-3 bg-white border border-slate-200 dark:border-zinc-800 rounded-2xl mb-4 shadow-sm select-none shrink-0">
        <img src={qrUrl} alt="Hostel UPI QR Code" className="w-40 h-40 object-contain" />
      </div>

      <div className="w-full space-y-3">
        <div className="bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800 rounded-2xl p-3.5 text-xs text-left space-y-2.5">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider">UPI VPA Address</span>
              <span className="font-mono font-bold text-stone-850 dark:text-white select-all text-[11px] block mt-0.5 truncate max-w-[150px]">{upiId}</span>
            </div>
            <button
              type="button"
              onClick={() => onCopyUpi(upiId)}
              className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 ${copyBtnColor} transition cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider shrink-0`}
              title="Copy UPI Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="border-t border-slate-200/50 dark:border-zinc-850 pt-2">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider">Account Holder</span>
            <span className="font-bold text-stone-800 dark:text-gray-200 text-[11px]">{upiName}</span>
          </div>

          <div className="border-t border-slate-200/50 dark:border-zinc-850 pt-2">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider">Bank Name</span>
            <span className="font-bold text-stone-800 dark:text-gray-200 text-[11px]">{bankName}</span>
          </div>
        </div>

        {/* Open UPI App Link Button */}
        <a
          href={upiLink}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-xs select-none ${upiBtnClass}`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>Open UPI App (Pay ₹{amount.toLocaleString("en-IN")})</span>
        </a>
      </div>
    </div>
  );
};

export const PayRentPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: billData, isLoading, isError, refetch } = useCurrentBill();
  const payRentMutation = usePayRentMutation();
  const { data: advCtx } = useAdvancePaymentContext();
  const payAdvanceMutation = usePayAdvanceRentMutation();

  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [searchParams] = useSearchParams();
  const isEarlyParam = searchParams.get("early") === "true";
  // Phase 8: advance payment form
  const [showAdvanceForm, setShowAdvanceForm] = useState(isEarlyParam);

  useEffect(() => {
    if (isEarlyParam) {
      setShowAdvanceForm(true);
    }
  }, [isEarlyParam]);
  const [advFormError, setAdvFormError] = useState<string | null>(null);
  const [advSuccess, setAdvSuccess] = useState(false);
  const [advUtr, setAdvUtr] = useState("");
  const [advAmount, setAdvAmount] = useState("");
  const [advRemarks, setAdvRemarks] = useState("");
  const [advFile, setAdvFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      utr_number: "",
      remarks: ""
    }
  });

  // Cleanup blob preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCopyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["jpg", "jpeg", "png", "webp"].includes(ext)) {
        setFormError("Invalid image format. Allowed formats: PNG, JPG, JPEG, WEBP.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormError("File size exceeds maximum limit of 10 MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setFormError(null);
      const fd = new FormData();
      if (billData?.rent_id) {
        fd.append("rent_id", billData.rent_id);
      }
      fd.append("utr", data.utr_number.trim());
      if (billData?.outstanding_amount) {
        fd.append("amount", String(billData.outstanding_amount));
      }
      if (data.remarks) {
        fd.append("remarks", data.remarks);
      }
      if (selectedFile) {
        fd.append("screenshot", selectedFile);
      }

      await payRentMutation.mutateAsync(fd);
      setIsSuccess(true);
      reset();
      refetch();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Payment submission failed. Check UTR details.";
      setFormError(Array.isArray(msg) ? msg[0]?.msg : msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-5xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-28 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="h-64 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError || !billData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h4 className="font-black text-sm text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Failed to Load Bill</h4>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          Could not fetch your active billing statement. Please try again later or contact support.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="font-bold h-10 px-6 cursor-pointer text-stone-700 dark:text-stone-300">
          Try Again
        </Button>
      </div>
    );
  }

  const paymentDetails = billData.hostel_payment_details || {};
  const upiId = paymentDetails.upi_id; // ISSUE-019 fix: remove hardcoded fallback
  const upiName = paymentDetails.account_holder || "";
  const bankName = paymentDetails.bank_name || "";

  // Normal rent payment details
  const normalAmount = billData.outstanding_amount || 0;
  const normalUpiLink = paymentDetails.upi_link || (upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${normalAmount}&cu=INR` : "");
  const normalQrUrl = paymentDetails.qr_code_url || (upiId && normalUpiLink ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(normalUpiLink)}` : "");

  // Early / Advance rent payment details
  const baseEarlyAmount = advCtx?.next_outstanding ?? billData?.next_rent ?? 0;
  const parsedAdvAmount = parseFloat(advAmount);
  const earlyAmount = !isNaN(parsedAdvAmount) && parsedAdvAmount > 0 ? parsedAdvAmount : baseEarlyAmount;
  const earlyUpiLink = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${earlyAmount}&cu=INR` : "";
  const earlyQrUrl = paymentDetails.qr_code_url && !paymentDetails.qr_code_url.includes("api.qrserver.com")
    ? paymentDetails.qr_code_url
    : (upiId && earlyUpiLink ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(earlyUpiLink)}` : "");

  // When no bill has been generated yet, show an informational state rather than
  // a ₹0 amount or a fabricated due date.
  if (
    billData.bill_generated === false ||
    billData.bill_status === "NO_BILL" ||
    billData.bill_status === "NO_CONFIG" ||
    !billData.has_rent_config
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pb-12 max-w-5xl mx-auto"
      >
        <div className="flex items-center gap-3 select-none">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
          </button>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">
            Rent Payment
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h4 className="font-black text-sm text-stone-900 dark:text-white mb-2 uppercase tracking-wider">
            {billData.bill_status === "NO_CONFIG" ? "No Active Room Allocation" : "No Bill Generated Yet"}
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
            {billData.error || "Your monthly rent bill has not been generated for this period. Bills are generated automatically by the hostel administrator. Please check back shortly or contact the hostel office."}
          </p>
        </div>
      </motion.div>
    );
  }

  const activeSub = billData.active_submission;
  const isPaid = billData.bill_status === "PAID";
  const isSubmitted = activeSub || billData.submission_status === "Submitted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 max-w-5xl mx-auto"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
          </button>
          <div>
            <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">
              Rent Payment Submission
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
              Scan the hostel UPI QR code, pay via any UPI app, enter your 12–22 digit UTR, and submit.
            </p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 leading-normal font-bold">
              You can pay your rent anytime before the due date.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/payment-history")}
          variant="outline"
          className="h-10 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 border-slate-200 dark:border-zinc-850 text-stone-750 dark:text-stone-300"
        >
          <Clock className="w-4 h-4" />
          <span>Payment History</span>
        </Button>
      </div>

      {/* ─── 1. CURRENT BILL CARD ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-4 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-955/20 flex items-center justify-center text-red-650 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Billing Statement</span>
                <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isPaid
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
                    : billData.bill_status === "OVERDUE"
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-955/20 dark:text-red-400 dark:border-red-900/30 animate-pulse"
                    : "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30"
                }`}>
                  {billData.bill_status}
                </span>
              </div>
              <h2 className="text-sm font-black text-stone-850 dark:text-white mt-1 uppercase tracking-wide">
                {MONTH_NAMES[billData.billing_month] || `Month ${billData.billing_month}`} {billData.billing_year}
              </h2>
            </div>
          </div>

          <div className="text-left md:text-right select-none">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Outstanding Payable</span>
            <span className="text-xl font-black text-red-650 dark:text-red-400 select-all tracking-tight block mt-0.5">
              ₹{billData.outstanding_amount?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs select-none">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase block mb-1">Room Assignment</span>
            <span className="font-bold text-stone-800 dark:text-gray-200 flex items-center gap-1.5 text-wrap-safe">
              <Home className="w-4.5 h-4.5 text-red-650 shrink-0" />
              Room {billData.room_number} ({billData.building_name})
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase mb-1">Total Room Rent</span>
            <span className="font-bold text-stone-805 dark:text-gray-200">
              ₹{billData.room_rent?.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-stone-450 block mt-1">({billData.occupants} active residents)</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase mb-1">Your Share</span>
            <span className="font-black text-red-650 dark:text-red-450">
              ₹{billData.tenant_share?.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-stone-450 block mt-1">
              ({billData.rent_split_type === "EQUAL" ? "Equal sharing" : billData.rent_split_type === "FIXED" ? "Fixed split" : billData.rent_split_type === "PERCENTAGE" ? "Percentage split" : (billData.rent_split_type || "Equal sharing")} split rule)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800">
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase mb-1">Payment Due Date</span>
            <span className="font-bold text-stone-800 dark:text-gray-200 flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              {billData.due_date ? new Date(billData.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. IF ALREADY SUBMITTED: SHOW ACTIVE SUBMISSION STATUS ─────────────────── */}
      {isSubmitted && activeSub && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-blue-50/20 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/30 space-y-4"
        >
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider">
                Active Submission Under Review
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-[9px] font-black bg-blue-600 text-white uppercase tracking-wider">
              {activeSub.status || "Submitted"}
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-450 leading-relaxed font-semibold">
            You have already uploaded a payment transaction for this billing cycle. Hostel administrators are currently verifying the transaction.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-150 dark:border-zinc-800 shadow-xs">
              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Submitted UTR</span>
              <span className="font-mono font-bold text-stone-850 dark:text-gray-100 select-all block mt-1 truncate">{activeSub.utr}</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-150 dark:border-zinc-800 shadow-xs">
              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Amount Paid</span>
              <span className="font-black text-red-650 dark:text-red-400 block mt-1">₹{activeSub.amount?.toLocaleString("en-IN")}</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-150 dark:border-zinc-800 shadow-xs">
              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Submission Date</span>
              <span className="font-bold text-stone-700 dark:text-stone-300 block mt-1">
                {activeSub.submitted_at ? new Date(activeSub.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Today"}
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-150 dark:border-zinc-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black block uppercase tracking-wider select-none">Screenshot Proof</span>
                <span className="text-xs font-bold text-red-650 block mt-0.5">{activeSub.screenshot_url ? "Uploaded" : "None"}</span>
              </div>
              {activeSub.screenshot_url && (
                <a
                  href={activeSub.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-red-50 text-red-650 hover:bg-red-100 transition cursor-pointer shrink-0"
                  title="View Screenshot"
                >
                  <Eye className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 select-none">
            <Button
              onClick={() => navigate("/payment-history")}
              className="btn-primary-tenant h-10 text-xs font-black uppercase tracking-wider text-white px-5 rounded-xl"
            >
              <span>View in Payment History</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── 3. PAYMENT FORM & QR CARD (IF NOT ALREADY PAID) ───────────────────────── */}
      {!isPaid && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column: Hostel UPI & QR Card (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <HostelUpiQrCard
              upiId={upiId}
              upiName={upiName}
              bankName={bankName}
              qrUrl={normalQrUrl}
              upiLink={normalUpiLink}
              amount={normalAmount}
              copied={copied}
              onCopyUpi={handleCopyUpi}
              accentColor="red"
            />
          </div>

          {/* Right Column: Payment Submission Form (7 cols) */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-5">
              <div className="select-none">
                <h3 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-655" />
                  <span>Submit Payment Details</span>
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
                  Enter your transaction reference code (UTR) and attach payment proof screenshot.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 select-none">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-955/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Payment Submitted Successfully!</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-semibold">
                    Your UTR and screenshot proof have been uploaded. The hostel administrators will review and verify your transaction shortly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* UTR Input */}
                <div>
                  <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-1.5 select-none">
                    UTR / Transaction Reference Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    {...register("utr_number")}
                    placeholder="Enter 12–22 digit UTR number"
                    className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-mono uppercase"
                  />
                  {errors.utr_number && (
                    <p className="text-[10px] text-red-600 mt-1 font-bold">{errors.utr_number.message}</p>
                  )}
                  <p className="text-[9.5px] text-stone-400 dark:text-stone-500 mt-1.5 select-none leading-normal">
                    Check transaction details in your Google Pay, PhonePe, Paytm, or BHIM logs.
                  </p>
                </div>

                {/* Screenshot Upload Field */}
                <div>
                  <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-2 select-none">
                    Payment Screenshot Proof <span className="text-stone-450 dark:text-stone-500 font-normal text-[9px]">(Optional, Max 10MB)</span>
                  </label>

                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-2xl p-4 text-center hover:border-red-600 transition cursor-pointer bg-slate-50 dark:bg-zinc-950/20">
                    <input
                      type="file"
                      id="screenshot-file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="screenshot-file" className="cursor-pointer block space-y-2">
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <ImageIcon className="w-6 h-6 text-red-650 shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-stone-800 dark:text-white truncate max-w-xs">{selectedFile.name}</p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-7 h-7 text-stone-400 mx-auto" />
                          <p className="text-xs font-black text-stone-850 dark:text-gray-200">
                            Click to upload screenshot (PNG, JPG, JPEG, WEBP)
                          </p>
                          <p className="text-[10px] text-stone-400 dark:text-stone-550">Maximum file size: 10 MB</p>
                        </>
                      )}
                    </label>
                  </div>

                  {previewUrl && (
                    <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-850/80">
                      <span className="text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 select-none">Image Preview</span>
                      <button
                        type="button"
                        onClick={() => setShowScreenshotModal(true)}
                        className="text-xs text-red-650 hover:underline font-black flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 outline-none"
                      >
                        <Eye className="w-4 h-4 shrink-0" /> Preview Screenshot
                      </button>
                    </div>
                  )}
                </div>

                {/* Remarks / Notes */}
                <div>
                  <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-1.5 select-none">
                    Remarks / Notes <span className="text-stone-400 font-normal text-[9px]">(Optional)</span>
                  </label>
                  <input
                    {...register("remarks")}
                    placeholder="e.g. Rent payment for August 2026 via GPay"
                    className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || payRentMutation.isPending}
                  className="btn-primary-tenant w-full h-10 text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 rounded-xl mt-2 select-none"
                >
                  {(isSubmitting || payRentMutation.isPending) ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4.5 h-4.5" />
                      <span>Submit Payment for Verification</span>
                    </div>
                  )}
                </Button>

              </form>
            </div>
          </div>

        </div>
      )}

      {/* ─── PHASE 8: PAY NEXT RENT SECTION ─────────────────────────────────── */}
      {isPaid && (() => {
        if (!advCtx) return null;
        const nextPaid = advCtx.next_status === "PAID";
        const nextDue = advCtx.next_due_date
          ? new Date(advCtx.next_due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : null;

        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4"
          >
            {/* Section header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-wider">Upcoming Rent</span>
                    {nextPaid && (
                      <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30">
                        PAID IN ADVANCE
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-black text-stone-850 dark:text-white mt-1 uppercase tracking-wide">
                    {advCtx.next_period_label || "Next Month"}
                  </h2>
                </div>
              </div>
              <div className="text-right select-none">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">
                  {nextPaid ? "Total Paid" : "Outstanding"}
                </span>
                <span className={`text-xl font-black tracking-tight block mt-0.5 ${
                  nextPaid ? "text-emerald-600 dark:text-emerald-400" : "text-stone-800 dark:text-white"
                }`}>
                  ₹{(nextPaid ? advCtx.next_rent_amount : advCtx.next_outstanding).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs select-none">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase block mb-1">Monthly Rent</span>
                <span className="font-black text-stone-800 dark:text-white">₹{advCtx.next_rent_amount?.toLocaleString("en-IN")}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase block mb-1">Paid So Far</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">₹{advCtx.next_paid_amount?.toLocaleString("en-IN")}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase block mb-1">Still Owed</span>
                <span className="font-black text-amber-600 dark:text-amber-400">₹{advCtx.next_outstanding?.toLocaleString("en-IN")}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800">
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-black uppercase block mb-1">Due Date</span>
                <span className="font-bold text-stone-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {nextDue || "TBD"}
                </span>
              </div>
            </div>

            {/* CTA or Already Paid badge */}
            {nextPaid ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold select-none">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Next month's rent has been paid in advance. No payment due until the month after.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {!showAdvanceForm ? (
                  <button
                    id="pay-next-rent-btn"
                    onClick={() => { setShowAdvanceForm(true); setAdvFormError(null); setAdvSuccess(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider transition shadow-sm select-none"
                  >
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Pay Next Rent in Advance ({advCtx.next_period_label})</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 space-y-4 bg-emerald-50/30 dark:bg-emerald-950/10"
                  >
                    <div className="flex items-center justify-between select-none">
                      <h4 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        Submit Advance Payment — {advCtx.next_period_label}
                      </h4>
                      <button
                        onClick={() => setShowAdvanceForm(false)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {advFormError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{advFormError}</span>
                      </div>
                    )}

                    {advSuccess && (
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-955/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-xs space-y-1">
                        <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Advance Payment Submitted!</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 font-semibold">
                          Your advance rent payment for {advCtx.next_period_label} is pending admin verification.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
                      {/* Left Column: Hostel UPI & QR Card (5 cols) */}
                      <div className="md:col-span-5 space-y-4">
                        <HostelUpiQrCard
                          upiId={upiId}
                          upiName={upiName}
                          bankName={bankName}
                          qrUrl={earlyQrUrl}
                          upiLink={earlyUpiLink}
                          amount={earlyAmount}
                          copied={copied}
                          onCopyUpi={handleCopyUpi}
                          accentColor="emerald"
                        />
                      </div>

                      {/* Right Column: Advance Payment Submission Form (7 cols) */}
                      <div className="md:col-span-7">
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                          <div className="select-none">
                            <h3 className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span>Submit Advance Payment Details</span>
                            </h3>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
                              Enter your transaction reference code (UTR) and attach payment proof screenshot.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-1.5 select-none">
                              UTR / Transaction Reference <span className="text-red-600">*</span>
                            </label>
                            <input
                              id="adv-utr"
                              value={advUtr}
                              onChange={e => setAdvUtr(e.target.value)}
                              placeholder="Enter 12–22 digit UTR number"
                              className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-mono uppercase"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-1.5 select-none">
                              Amount (₹) <span className="text-stone-400 font-normal text-[9px]">— Leave blank to pay full ₹{advCtx.next_outstanding?.toLocaleString("en-IN")}</span>
                            </label>
                            <input
                              id="adv-amount"
                              type="number"
                              value={advAmount}
                              onChange={e => setAdvAmount(e.target.value)}
                              placeholder={`Max ₹${advCtx.next_outstanding?.toLocaleString("en-IN")}`}
                              min="1"
                              max={advCtx.next_outstanding}
                              className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-2 select-none">
                              Payment Screenshot Proof <span className="text-stone-400 font-normal text-[9px]">(Optional, Max 10MB)</span>
                            </label>
                            <div className="border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-2xl p-3 text-center hover:border-emerald-600 transition cursor-pointer bg-slate-50 dark:bg-zinc-950/20">
                              <input
                                type="file"
                                id="adv-screenshot-file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={e => { if (e.target.files?.[0]) setAdvFile(e.target.files[0]); }}
                                className="hidden"
                              />
                              <label htmlFor="adv-screenshot-file" className="cursor-pointer text-xs font-bold text-stone-500 dark:text-stone-400 flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                {advFile ? advFile.name : "Click to upload screenshot"}
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-1.5 select-none">
                              Remarks <span className="text-stone-400 font-normal text-[9px]">(Optional)</span>
                            </label>
                            <input
                              id="adv-remarks"
                              value={advRemarks}
                              onChange={e => setAdvRemarks(e.target.value)}
                              placeholder={`Advance rent for ${advCtx.next_period_label}`}
                              className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
                            />
                          </div>

                          <Button
                            id="adv-submit-btn"
                            disabled={payAdvanceMutation.isPending || !advUtr.trim()}
                            onClick={async () => {
                              try {
                                setAdvFormError(null);
                                const fd = new FormData();
                                fd.append("utr", advUtr.trim());
                                if (advAmount) fd.append("amount", advAmount);
                                if (advRemarks) fd.append("remarks", advRemarks);
                                if (advFile) fd.append("screenshot", advFile);
                                await payAdvanceMutation.mutateAsync(fd);
                                setAdvSuccess(true);
                                setAdvUtr(""); setAdvAmount(""); setAdvRemarks(""); setAdvFile(null);
                                refetch();
                              } catch (err: any) {
                                const msg = err.response?.data?.detail || "Advance payment submission failed.";
                                setAdvFormError(Array.isArray(msg) ? msg[0]?.msg : msg);
                              }
                            }}
                            className="w-full h-10 text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 select-none cursor-pointer"
                          >
                            {payAdvanceMutation.isPending ? (
                              <><Clock className="w-4 h-4 animate-spin" /> Submitting...</>
                            ) : (
                              <><ShieldCheck className="w-4.5 h-4.5" /> Submit Advance Payment</>  
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* Screenshot Preview Dialog */}
      <AnimatePresence>
        {showScreenshotModal && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
                <span className="text-xs font-black uppercase tracking-wider text-stone-850 dark:text-white">Screenshot Preview</span>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white bg-slate-50 dark:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-200 dark:border-zinc-800 select-none">
                <img src={previewUrl} alt="Payment Screenshot" className="w-full object-contain" />
              </div>
              <div className="text-right select-none">
                <Button onClick={() => setShowScreenshotModal(false)} variant="outline" className="font-bold h-10 px-5 text-xs text-stone-600 dark:text-stone-300 cursor-pointer">
                  Close Preview
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PayRentPage;
