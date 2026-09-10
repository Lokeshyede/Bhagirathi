import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAdminPaymentDetails,
  useApprovePayment,
  useRejectPayment,
  useRequestClarification
} from "../hooks/useAdminPayment";
import { ScreenshotViewer } from "../components/ScreenshotViewer";
import { PaymentTimeline } from "../components/PaymentTimeline";
import { ApproveDialog, RejectDialog, ClarificationDialog } from "../components/VerificationDialogs";
import { Button } from "@bhagirathi/ui";
import {
  ArrowLeft,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ClipboardCopy,
  Info,
  Home
} from "lucide-react";
import { motion } from "framer-motion";

export const PaymentDetailsPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  // Dialog Visibility states
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showClarification, setShowClarification] = useState(false);
  
  // Alert banner
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Queries & Mutations
  const { data: details, isLoading, isError, refetch } = useAdminPaymentDetails(paymentId);
  const approveMutation = useApprovePayment();
  const rejectMut = useRejectPayment();
  const clarificationMut = useRequestClarification();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-6">
        <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !details) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card text-center select-none">
        <AlertTriangle className="h-12 w-12 text-danger mb-4" />
        <h4 className="font-extrabold text-sm text-primaryText dark:text-white uppercase tracking-wider">Payment Not Found</h4>
        <p className="text-xs text-muted max-w-xs mb-6">The requested payment statement record could not be loaded or was deleted.</p>
        <Button onClick={() => navigate("/payments/queue")} size="sm">Back to Queue</Button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!paymentId) return;
    setAlert(null);
    try {
      await approveMutation.mutateAsync(paymentId);
      setAlert({ type: "success", message: "Payment verified successfully!" });
      setShowApprove(false);
      refetch();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.detail || "Failed to approve payment."
      });
    }
  };

  const handleReject = async (data: { reason: string; remarks: string }) => {
    if (!paymentId) return;
    setAlert(null);
    try {
      await rejectMut.mutateAsync({
        paymentId,
        reason: data.reason,
        remarks: data.remarks
      });
      setAlert({ type: "success", message: "Payment has been rejected." });
      setShowReject(false);
      refetch();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.detail || "Failed to reject payment."
      });
    }
  };

  const handleClarification = async (data: { reason: string; message: string }) => {
    if (!paymentId) return;
    setAlert(null);
    try {
      await clarificationMut.mutateAsync({
        paymentId,
        reason: data.reason,
        message: data.message
      });
      setAlert({ type: "success", message: "Clarification request sent to resident." });
      setShowClarification(false);
      refetch();
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err?.response?.data?.detail || "Failed to request clarification."
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Determine badge styling based on status
  const getStatusBadge = (pStatus: string) => {
    switch (pStatus) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-250 dark:border-green-900/30">
            <CheckCircle className="h-4 w-4" />
            Verified
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-250 dark:border-red-900/30">
            <XCircle className="h-4 w-4" />
            Rejected
          </span>
        );
      case "Clarification Requested":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400 border border-amber-250 dark:border-amber-900/30">
            <AlertTriangle className="h-4 w-4" />
            Clarification Requested
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">
            <Clock className="h-4 w-4" />
            Under Review
          </span>
        );
      case "Submitted":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-250 dark:border-indigo-900/30">
            <Clock className="h-4 w-4 animate-pulse" />
            Submitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1 rounded-full bg-gray-55 text-muted dark:bg-gray-800 border border-border">
            {pStatus}
          </span>
        );
    }
  };

  // Submission datetime formats
  const submissionTimeFormatted = details.submission_time
    ? new Date(details.submission_time).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
    : "N/A";

  const dueDateFormatted = details.due_date
    ? new Date(details.due_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 select-none"
    >
      {/* Back navigation & page title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/payments/queue")}
            className="p-2 border border-border dark:border-gray-800 bg-white dark:bg-gray-900 text-text-secondary hover:text-primaryText dark:text-gray-400 dark:hover:text-white rounded-card transition cursor-pointer"
            title="Back to Verification Queue"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-md font-black text-primaryText dark:text-white leading-tight uppercase tracking-wide">
              Payment verification workspace
            </h1>
            <span className="text-xxs font-bold text-muted uppercase mt-0.5 block tracking-wider select-all">
              Ref: {details.payment_reference || "N/A"}
            </span>
          </div>
        </div>

        <div className="shrink-0">{getStatusBadge(details.status)}</div>
      </div>

      {/* Response Alert */}
      {alert && (
        <div
          className={`p-3.5 border rounded-card text-xs font-bold leading-normal ${
            alert.type === "success"
              ? "bg-green-50/50 border-green-200 text-green-750 dark:bg-green-950/20 dark:text-green-400"
              : "bg-red-50/50 border-red-200 text-red-650 dark:bg-red-950/20 dark:text-red-400"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tenant info & financials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Resident & Room details */}
          <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 shadow-card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
                  <User className="h-4.5 w-4.5 text-primary" />
                  <h3 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">
                    Resident details
                  </h3>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Full Name</span>
                    <span className="font-bold text-primaryText dark:text-white mt-0.5 block">{details.tenant_info.full_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Phone</span>
                      <span className="font-bold text-primaryText dark:text-white mt-0.5 block select-all">{details.tenant_info.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Email</span>
                      <span className="font-bold text-primaryText dark:text-white mt-0.5 block truncate select-all">{details.tenant_info.email}</span>
                    </div>
                  </div>
                  {details.tenant_info.emergency_contact && (
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Emergency Contact</span>
                      <span className="font-bold text-primaryText dark:text-white mt-0.5 block select-all">{details.tenant_info.emergency_contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Room details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
                  <Home className="h-4.5 w-4.5 text-primary" />
                  <h3 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">
                    Lodging allocation
                  </h3>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Hostel Campus</span>
                    <span className="font-bold text-primaryText dark:text-white mt-0.5 block">{details.room_info.hostel_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Building Block</span>
                      <span className="font-bold text-primaryText dark:text-white mt-0.5 block">{details.room_info.building_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Floor</span>
                      <span className="font-bold text-primaryText dark:text-white mt-0.5 block">{details.room_info.floor_name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Room Number</span>
                      <span className="font-bold text-primaryText dark:text-white mt-0.5 block">Room {details.room_info.room_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Bed Number</span>
                      <span className="font-bold text-primary mt-0.5 block">Bed {details.room_info.bed_number || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract terms summary */}
            {details.contract_info && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-850 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h4 className="font-extrabold text-xxs text-primaryText dark:text-white uppercase tracking-wider">
                    Contract Terms & Rent Settings
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-55 dark:bg-gray-950 p-3 rounded-card border border-border dark:border-gray-850">
                  <div>
                    <span className="text-[9px] text-muted font-bold uppercase block">Agreement Rent</span>
                    <span className="font-bold text-primaryText dark:text-gray-200 mt-0.5 block">₹{details.contract_info.rent_amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted font-bold uppercase block">Security Deposit</span>
                    <span className="font-bold text-primaryText dark:text-gray-200 mt-0.5 block">₹{details.contract_info.security_deposit.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted font-bold uppercase block">Start Date</span>
                    <span className="font-bold text-primaryText dark:text-gray-200 mt-0.5 block">
                      {details.contract_info.start_date ? new Date(details.contract_info.start_date).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted font-bold uppercase block">Expiry Date</span>
                    <span className="font-bold text-primaryText dark:text-gray-200 mt-0.5 block">
                      {details.contract_info.end_date ? new Date(details.contract_info.end_date).toLocaleDateString("en-IN") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Payment splits and transaction UTR details */}
          <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 shadow-card space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
              <CreditCard className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">
                Financial Split & Billing Statement
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Split Factors */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-baseline py-1 border-b border-gray-50 dark:border-gray-850">
                  <span className="text-text-secondary dark:text-gray-400 font-medium">Agreement Base Rent:</span>
                  <span className="font-semibold text-primaryText dark:text-gray-200">₹{details.room_rent.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-baseline py-1 border-b border-gray-50 dark:border-gray-850">
                  <span className="text-text-secondary dark:text-gray-400 font-medium">Rent Split Share:</span>
                  <span className="font-bold text-primary">₹{details.rent_share.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-baseline py-1 border-b border-gray-50 dark:border-gray-850">
                  <span className="text-text-secondary dark:text-gray-400 font-medium">Electricity Consumption Split:</span>
                  <span className="font-bold text-primary">₹{details.electricity_share.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-baseline py-1 border-b border-gray-50 dark:border-gray-850">
                  <span className="text-text-secondary dark:text-gray-400 font-medium">Other Charges / Fine Dues:</span>
                  <span className="font-bold text-primary">₹{details.other_charges.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-baseline py-2 bg-gray-55 dark:bg-gray-950 px-3 rounded border border-border dark:border-gray-850 mt-2">
                  <span className="font-black uppercase text-primaryText dark:text-white text-[10px]">Total resident payable:</span>
                  <span className="font-black text-sm text-primaryText dark:text-white">₹{details.total_amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Submission details */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Due Date</span>
                  <span className="font-bold text-primaryText dark:text-white mt-0.5 block">{dueDateFormatted}</span>
                </div>

                <div>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">UTR / Transaction ID</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-black text-xs text-primary font-mono select-all uppercase tracking-wide">
                      {details.utr || "NOT PROVIDED"}
                    </span>
                    {details.utr && (
                      <button
                        onClick={() => copyToClipboard(details.utr || "")}
                        className="p-1 text-text-muted hover:text-primary transition cursor-pointer"
                        title="Copy UTR"
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Submission Time</span>
                    <span className="font-bold text-primaryText dark:text-white mt-0.5 block">{submissionTimeFormatted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">Payment Type</span>
                    <span className="font-bold text-primaryText dark:text-white mt-0.5 block uppercase">{details.payment_reference ? details.payment_reference.split("-")[0] : "BHG"} (Combined)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action workspace panel (only display if active/reviewable status) */}
          <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
              <Info className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider">
                Verification Decisions
              </h3>
            </div>
            
            <p className="text-xxs text-muted leading-relaxed font-semibold">
              {details.status === "Verified" 
                ? "This transaction has been successfully verified. A digital receipt is linked to this payment."
                : "Before approving, verify that the transaction amount corresponds to the resident's statement split and the UTR details exist in the bank reconciler statement logs."}
            </p>

            {/* Receipt & Fulfillment block */}
            {details.status === "Verified" && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-850">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Receipt Status</span>
                  {details.receipt_status === "Generated" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Generated ({details.receipt_number})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      Generating receipt...
                    </span>
                  )}
                </div>
                
                {details.receipt_url && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.open(details.receipt_url, "_blank")}
                      className="flex-1 bg-white border border-border text-primaryText hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-850 font-bold uppercase tracking-wider text-xs"
                    >
                      View Receipt
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => setShowApprove(true)}
                disabled={
                  details.status === "Verified" ||
                  details.status === "Cancelled" ||
                  details.status === "Rejected"
                }
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Approve Payment
              </Button>
              <Button
                onClick={() => setShowClarification(true)}
                disabled={
                  details.status === "Verified" ||
                  details.status === "Cancelled"
                }
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Request Clarification
              </Button>
              <Button
                onClick={() => setShowReject(true)}
                disabled={
                  details.status === "Verified" ||
                  details.status === "Cancelled" ||
                  details.status === "Rejected"
                }
                className="flex-1 bg-red-600 hover:bg-red-750 text-white font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Reject Payment
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Screenshot & timeline */}
        <div className="space-y-6">
          {/* Screenshot Viewer */}
          <ScreenshotViewer imageUrl={details.screenshot_url} title="Payment Receipt Screen" />

          {/* Timeline Logs */}
          <div className="bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card p-6 shadow-card space-y-4">
            <h3 className="font-extrabold text-xs text-primaryText dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
              Payment Timeline Log
            </h3>
            <PaymentTimeline paymentId={paymentId} />
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <ApproveDialog
        isOpen={showApprove}
        onClose={() => setShowApprove(false)}
        onConfirm={handleApprove}
        isLoading={approveMutation.isPending}
        amount={details.total_amount}
        reference={details.payment_reference || ""}
      />

      <RejectDialog
        isOpen={showReject}
        onClose={() => setShowReject(false)}
        onConfirm={handleReject}
        isLoading={rejectMut.isPending}
      />

      <ClarificationDialog
        isOpen={showClarification}
        onClose={() => setShowClarification(false)}
        onConfirm={handleClarification}
        isLoading={clarificationMut.isPending}
      />
    </motion.div>
  );
};

export default PaymentDetailsPage;
