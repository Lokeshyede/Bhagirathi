import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Printer, CheckCircle2, User, Home, ShieldCheck, BrainCircuit, Activity } from "lucide-react";
import { useReceiptById } from "../hooks/useReceipt";
import { PDFPreviewModal } from "../components/PDFPreviewModal";
import { apiClient } from "@bhagirathi/api-client";

const ReceiptDetailPage: React.FC = () => {
  const { receiptId } = useParams<{ receiptId: string }>();
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: receipt, isLoading } = useReceiptById(receiptId || null);

  const handleDownload = async () => {
    if (!receiptId) return;
    try {
      const res = await apiClient.get(
        `/api/v1/receipts/${receiptId}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        receipt?.receipt_number
          ? `${receipt.receipt_number}.pdf`
          : `receipt-${receiptId.slice(0, 8)}.pdf`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to download receipt.");
    }
  };

  const getTimelineSteps = () => {
    if (!receipt) return [];
    
    const steps = [
      {
        label: "Payment Generated",
        date: receipt.payment_date || "—",
        desc: `Bill generated for ${receipt.billing_month}`,
        completed: true,
      },
      {
        label: "Payment Submitted",
        date: receipt.payment_date || "—",
        desc: `UTR: ${receipt.submitted_utr || "N/A"}`,
        completed: true,
      },
      {
        label: "AI Reconciled",
        date: receipt.verified_at ? new Date(receipt.verified_at).toLocaleDateString() : "—",
        desc: receipt.ai_confidence ? `AI Match: ${receipt.ai_confidence.toFixed(0)}%` : "Auto-matched by rules",
        completed: !!receipt.verified_at,
      },
      {
        label: "Verified",
        date: receipt.verified_at ? new Date(receipt.verified_at).toLocaleDateString() : "—",
        desc: `Verified by ${receipt.verified_by_name || "Admin"}`,
        completed: !!receipt.verified_at,
      },
      {
        label: "Receipt Generated",
        date: new Date(receipt.generated_at).toLocaleDateString(),
        desc: `Receipt No: ${receipt.receipt_number}`,
        completed: true,
      },
    ];
    return steps;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6 max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">Receipt not found.</p>
        <button onClick={() => navigate("/receipts")} className="mt-4 text-indigo-600 font-semibold hover:underline">
          Go back to history
        </button>
      </div>
    );
  }

  const steps = getTimelineSteps();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/receipts")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Receipts
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-semibold"
          >
            <Printer className="h-4 w-4" />
            Preview / Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl transition-colors text-sm font-bold shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receipt Display Sheet (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-indigo-500" />
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-base">{receipt.receipt_number}</h2>
                  <p className="text-xs text-gray-500">Billing Month: {receipt.billing_month}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 rounded-full text-xs font-bold">
                {receipt.status}
              </span>
            </div>

            {/* Tenant details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Tenant Details
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-400">Name:</span> <strong className="text-gray-800 dark:text-gray-200">{receipt.tenant_name}</strong></p>
                  <p><span className="text-gray-400">Phone:</span> <span className="text-gray-700 dark:text-gray-300">{receipt.tenant_phone || "—"}</span></p>
                  <p><span className="text-gray-400">Email:</span> <span className="text-gray-700 dark:text-gray-300">{receipt.tenant_email || "—"}</span></p>
                </div>
              </div>

              <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                  <Home className="h-4 w-4" /> Occupancy Details
                </h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-400">Hostel:</span> <span className="text-gray-700 dark:text-gray-300">{receipt.hostel_name || "—"}</span></p>
                  <p><span className="text-gray-400">Building/Floor:</span> <span className="text-gray-700 dark:text-gray-300">{receipt.building_name || "—"} / {receipt.floor_name || "—"}</span></p>
                  <p><span className="text-gray-400">Room/Bed:</span> <span className="text-gray-700 dark:text-gray-300">Room {receipt.room_number || "—"} (Bed {receipt.bed_number || "—"})</span></p>
                </div>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-850 text-gray-500 font-semibold border-b border-gray-150 dark:border-gray-800 text-left">
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Room Rent Share</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">₹{receipt.rent_share.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Electricity Share Dues</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">₹{receipt.electricity_share.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Other Charges</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">₹{receipt.other_charges.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr className="bg-indigo-50/20 dark:bg-indigo-950/10 font-bold">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">Total Amount Paid</td>
                    <td className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">₹{receipt.total_amount.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Transaction Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-150 dark:border-gray-800">
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-gray-400" /> Transaction details
                </h4>
                <p><span className="text-gray-500">UTR / Transaction ID:</span> <span className="font-mono text-gray-800 dark:text-gray-200">{receipt.submitted_utr || "—"}</span></p>
                <p><span className="text-gray-500">Payment Reference:</span> <span className="text-gray-800 dark:text-gray-200">{receipt.payment_reference || "—"}</span></p>
                <p><span className="text-gray-500">Payment Date:</span> <span className="text-gray-800 dark:text-gray-200">{receipt.payment_date || "—"}</span></p>
                <p><span className="text-gray-500">Payment Method:</span> <span className="text-gray-800 dark:text-gray-200">{receipt.payment_method || "UPI"}</span></p>
              </div>

              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-gray-400" /> Digital Verification
                </h4>
                <p><span className="text-gray-500">Verified By:</span> <span className="text-gray-800 dark:text-gray-200">{receipt.verified_by_name || "System"}</span></p>
                <p><span className="text-gray-500">Verified At:</span> <span className="text-gray-800 dark:text-gray-200">{receipt.verified_at ? new Date(receipt.verified_at).toLocaleString() : "—"}</span></p>
                <p><span className="text-gray-500">Verification Status:</span> <span className="text-gray-800 dark:text-gray-200">{receipt.verification_status || "—"}</span></p>
                {receipt.ai_confidence !== null && (
                  <p><span className="text-gray-500">AI Confidence:</span> <strong className="text-green-600 dark:text-green-400">{receipt.ai_confidence.toFixed(1)}% Match</strong></p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline / Action History (Right 1 column) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-1.5">
              <BrainCircuit className="h-5 w-5 text-indigo-500" /> Receipt Timeline
            </h3>

            {/* Timeline component */}
            <div className="relative pl-6 space-y-6 border-l-2 border-indigo-100 dark:border-indigo-950">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Circle marker */}
                  <div className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full border-2 bg-white dark:bg-gray-900 transition-colors flex items-center justify-center
                    ${step.completed ? "border-indigo-500" : "border-gray-200 dark:border-gray-850"}`}
                  >
                    {step.completed && <CheckCircle2 className="h-3 w-3 text-indigo-500" />}
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${step.completed ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                      {step.label}
                    </h4>
                    <p className="text-[10px] text-gray-400 mb-0.5">{step.date}</p>
                    <p className="text-xs text-gray-500 leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal Frame */}
      <PDFPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfUrl={receipt.pdf_url}
        receiptNumber={receipt.receipt_number}
      />
    </div>
  );
};

export default ReceiptDetailPage;
