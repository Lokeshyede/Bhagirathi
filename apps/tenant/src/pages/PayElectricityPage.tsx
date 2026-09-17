import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Button } from "@bhagirathi/ui";
import { ArrowLeft, Upload, AlertTriangle, Zap, Copy, Check, Send, ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const PayElectricityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [utrNumber, setUtrNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  const { data: bill, isLoading: isLoadingBill, isError } = useQuery<any>({
    queryKey: ["my-electricity-bills"],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/my/electricity-bills`);
      const allBills = res.data;
      return allBills.find((b: any) => b.id === id);
    },
    enabled: !!id
  });

  const { data: currentBill, isLoading: isLoadingCurrentBill } = useQuery<any>({
    queryKey: ["tenant-current-bill"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/payments/current");
      return response.data;
    }
  });

  // Synchronize default payment amount when bill is retrieved
  useEffect(() => {
    if (bill && !paymentAmount) {
      const initialAmt = bill.outstanding ?? bill.my_share ?? bill.bill_amount ?? 0;
      if (initialAmt > 0) {
        setPaymentAmount(initialAmt.toString());
      }
    }
  }, [bill, paymentAmount]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
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
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!screenshot) {
      setValidationError("Please upload the payment transaction confirmation screenshot.");
      return;
    }

    const trimmedUtr = (utrNumber || "").replace(/\s+/g, "").toUpperCase();
    if (trimmedUtr.length < 12 || trimmedUtr.length > 22) {
      setValidationError("UTR reference must be between 12 and 22 characters long.");
      return;
    }

    const amountValue = parseFloat(paymentAmount);
    const maxPayable = bill?.outstanding ?? bill?.my_share ?? bill?.bill_amount ?? 0;
    
    if (isNaN(amountValue) || amountValue <= 0) {
      setValidationError("Please enter a valid payment amount (minimum ₹1).");
      return;
    }
    if (amountValue > maxPayable + 0.01) {
      setValidationError(`Payment amount cannot exceed outstanding dues (₹${maxPayable}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("bill_id", id || "");
      formData.append("amount", amountValue.toString());
      formData.append("payment_date", new Date().toISOString().substring(0, 10));
      formData.append("payment_mode", "UPI");
      formData.append("utr_number", trimmedUtr);
      formData.append("remarks", remarks);
      formData.append("screenshot", screenshot);

      await apiClient.post("/api/v1/my/electricity-bills/pay", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Electricity payment receipt submitted successfully! Pending verification by Admin.");
      navigate("/electricity");
    } catch (err: any) {
      setValidationError(err?.response?.data?.detail || "Failed to submit electricity bill payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  if (isLoadingBill || isLoadingCurrentBill) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none max-w-2xl mx-auto">
        <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-32 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
        <div className="h-64 rounded-3xl bg-slate-250 dark:bg-zinc-800" />
      </div>
    );
  }

  if (isError || !bill) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-center shadow-sm select-none max-w-md mx-auto my-12">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-black text-stone-900 dark:text-white mb-2 uppercase tracking-wider">Bill not found</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          The requested electricity bill could not be found or verified.
        </p>
        <Button onClick={() => navigate(-1)} className="btn-primary-tenant font-black h-10 px-6 rounded-xl cursor-pointer">
          Go Back
        </Button>
      </div>
    );
  }

  const paymentDetails = currentBill?.hostel_payment_details || {};
  const upiId = paymentDetails.upi_id; 
  const merchantName = paymentDetails.account_holder || paymentDetails.hostel_name || "Bhagirathi Hostel";
  const maxPayable = bill?.outstanding ?? bill?.my_share ?? bill?.bill_amount ?? 0;
  const parsedAmt = parseFloat(paymentAmount);
  const currentPayable = !isNaN(parsedAmt) && parsedAmt > 0 ? parsedAmt : maxPayable;
  const upiUrl = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${currentPayable}&cu=INR` : "";

  const isUnderReview = bill?.payment_status === "UNDER_REVIEW";
  const isFullyPaid = maxPayable <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-stone-700 dark:text-stone-300" />
        </button>
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white leading-tight uppercase tracking-wider">Submit Utility Payment</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-normal font-semibold">
            Electricity bill verification workflow
          </p>
        </div>
      </div>

      {/* Bill Due Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center select-none border-b border-slate-100 dark:border-zinc-800 pb-3">
          <span className="text-[9px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Electricity Invoice</span>
          <span className="text-xs font-black text-stone-850 dark:text-white uppercase tracking-wider">
            {getMonthName(bill.bill_month)} {bill.bill_year}
          </span>
        </div>
        <div className="flex justify-between items-center select-none text-xs">
          <span className="text-stone-500 font-semibold">Consumption Charge ({bill.units} units)</span>
          <span className="font-mono font-bold text-stone-800 dark:text-stone-300">
            ₹{Number(bill.bill_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800 pt-3 font-black text-xs select-none">
          <span className="text-stone-900 dark:text-white uppercase tracking-wide">Total Room Bill</span>
          <span className="text-stone-805 dark:text-stone-250">
            ₹{Number(bill.bill_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-zinc-800 pt-3 font-black text-xs select-none">
          <span className="text-stone-900 dark:text-white uppercase tracking-wide">Your Total Share</span>
          <span className="text-stone-805 dark:text-stone-250">
            ₹{Number(bill.my_share).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-150 dark:border-zinc-800 pt-3 font-black text-sm select-none">
          <span className="text-red-655 dark:text-red-400 uppercase tracking-wide">Remaining Outstanding</span>
          <span className="text-red-650 dark:text-red-400 select-all">
            ₹{Number(maxPayable).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* UPI QR Payment Directions */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3 select-none">
          <Zap className="h-5 w-5 text-red-650 animate-pulse" />
          <h3 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider">UPI Payment Gateway</h3>
        </div>

        {!upiId ? (
          <div className="text-center p-6 select-none flex flex-col items-center justify-center min-h-[220px]">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-2 animate-pulse" />
            <h4 className="font-black text-xs text-stone-850 dark:text-white uppercase tracking-wider mb-1">UPI Payment Unavailable</h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold leading-relaxed">
              UPI payment details have not been set up by the hostel administrator.
              Please contact the hostel office to complete your electricity bill payment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Dynamic QR Code */}
              <div className="p-3 bg-white border border-slate-250 dark:border-zinc-800 rounded-2xl shrink-0 select-none shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`}
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
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-150 dark:border-zinc-800 rounded-xl font-bold">
                    <span className="select-all text-stone-800 dark:text-stone-300 font-mono text-[11px] truncate max-w-[200px]">{upiId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(upiId, "upi")}
                      className="text-red-650 hover:text-red-700 bg-transparent border-none cursor-pointer outline-none ml-2 shrink-0"
                    >
                      {copiedField === "upi" ? <Check className="h-4 w-4 text-green-600 animate-bounce" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 uppercase font-black tracking-wider block select-none">Paying Amount</span>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-zinc-955 border border-slate-150 dark:border-zinc-800 rounded-xl font-bold">
                    <span className="text-stone-800 dark:text-stone-300 font-mono font-bold">₹{Number(currentPayable).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPayable.toString(), "amount")}
                      className="text-red-650 hover:text-red-700 bg-transparent border-none cursor-pointer outline-none ml-2 shrink-0"
                    >
                      {copiedField === "amount" ? <Check className="h-4 w-4 text-green-600 animate-bounce" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Open UPI App Button */}
            <a
              href={upiUrl}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-xs select-none bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Open UPI App (Pay ₹{Number(currentPayable).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </a>
          </div>
        )}
      </div>

      {/* Submission Form or Status Guard */}
      {isUnderReview ? (
        <div className="p-6 bg-blue-50 dark:bg-blue-955/20 border border-blue-200 dark:border-blue-900/30 rounded-3xl text-center space-y-3 select-none">
          <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto animate-pulse" />
          <h3 className="text-sm font-black text-blue-950 dark:text-blue-300 uppercase tracking-wider">Payment Receipt Under Review</h3>
          <p className="text-xs text-blue-800 dark:text-blue-400 max-w-md mx-auto leading-relaxed">
            Your payment receipt for this electricity bill has already been submitted and is currently pending verification by the administrator.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate("/electricity")} className="btn-primary-tenant font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer">
              Back to Electricity Bills
            </Button>
          </div>
        </div>
      ) : isFullyPaid ? (
        <div className="p-6 bg-green-50 dark:bg-green-955/20 border border-green-200 dark:border-green-900/30 rounded-3xl text-center space-y-3 select-none">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto" />
          <h3 className="text-sm font-black text-green-950 dark:text-green-300 uppercase tracking-wider">Bill Dues Paid in Full</h3>
          <p className="text-xs text-green-800 dark:text-green-400 max-w-md mx-auto leading-relaxed">
            There are no outstanding electricity dues on this bill for your account.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate("/electricity")} className="btn-primary-tenant font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer">
              Back to Electricity Bills
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-5 shadow-sm">
          {/* Payment Amount Input */}
          <div className="flex flex-col gap-1.5 select-none">
            <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Payment Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-400 dark:text-stone-500 font-black">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                max={maxPayable}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full h-10 pl-8 pr-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-mono"
                placeholder={`Remaining: ₹${maxPayable}`}
              />
            </div>
          </div>

          {/* UTR Input */}
          <div className="flex flex-col gap-1.5 select-none">
            <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block">Transaction Reference UTR Number *</label>
            <input
              type="text"
              required
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-mono uppercase"
              placeholder="12-22 digit UTR number"
            />
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider block select-none">Remarks / Payment Notes (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-xs font-semibold text-stone-850 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
              placeholder="Bank used / timestamp details..."
            />
          </div>

          {/* Screenshot Upload */}
          <div className="select-none">
            <label className="block text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider mb-2">
              Upload Transaction Receipt Screenshot *
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-red-600/50 rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all bg-slate-50 dark:bg-zinc-950/20 cursor-pointer">
              <input
                type="file"
                required
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {screenshotPreview ? (
                <div className="space-y-2">
                  <img src={screenshotPreview} alt="Screenshot preview" className="h-20 object-contain rounded-lg mx-auto border border-slate-200 dark:border-zinc-800 shadow-sm" />
                  <span className="text-xxs font-black text-red-600 block truncate max-w-xs">{screenshot?.name}</span>
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

          {/* Submit */}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="btn-primary-tenant w-full flex items-center justify-center gap-1.5 h-10 font-bold uppercase tracking-wider text-white"
          >
            <Send className="h-4 w-4" />
            <span>Submit Bill Payment Proof</span>
          </Button>
        </form>
      )}
    </motion.div>
  );
};

export default PayElectricityPage;
