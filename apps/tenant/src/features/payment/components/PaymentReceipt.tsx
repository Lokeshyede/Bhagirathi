import React, { useRef } from "react";
import { X, Printer, CheckCircle, ShieldCheck } from "lucide-react";
import { PaymentReceiptDetails } from "@bhagirathi/types";
import { Button } from "@bhagirathi/ui";

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: PaymentReceiptDetails;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  receipt
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receipt.receipt_number}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; color: #111827; padding: 40px; }
                .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; }
                .header { text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px; }
                .title { font-size: 24px; font-weight: bold; color: #dc2626; margin: 0; }
                .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }
                .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin-top: 16px; font-size: 14px; }
                .label { font-weight: 600; color: #4b5563; }
                .value { font-weight: 500; color: #111827; }
                .amount-box { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; text-align: center; margin-top: 24px; }
                .amount-title { font-size: 12px; font-weight: 600; color: #dc2626; margin: 0; text-transform: uppercase; }
                .amount-val { font-size: 28px; font-weight: 800; color: #b91c1c; margin: 4px 0 0 0; }
                .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <div class="header">
                  <h1 class="title">BHAGIRATHI HOSTEL & PG</h1>
                  <div class="subtitle">Official Rent Payment Receipt</div>
                </div>
                ${printContent}
                <div class="footer">
                  This is a computer generated receipt and does not require a physical signature.
                  <br>Thank you for staying at Bhagirathi Hostel & PG.
                </div>
              </div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 p-4">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative max-w-lg w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-155">
        
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-6 bg-gray-50 dark:bg-gray-950/40 border-b border-gray-100 dark:border-gray-850">
          <div className="flex items-center gap-2 text-red-650">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold text-sm text-gray-900 dark:text-white">Transaction Receipt</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt content wrapper */}
        <div className="flex-1 overflow-y-auto p-6" ref={printAreaRef}>
          <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-gray-100 dark:border-gray-805">
            <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center mb-2 border border-green-200 dark:border-green-900/30">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Verified</h2>
            <p className="text-3xs text-gray-400 font-semibold tracking-wide uppercase mt-0.5">
              Receipt No: <span className="text-gray-700 dark:text-gray-300 font-mono select-all font-bold">{receipt.receipt_number}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 text-center">
              <span className="text-3xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wider block">
                Amount Paid
              </span>
              <span className="text-3xl font-extrabold text-red-750 dark:text-red-500 block mt-0.5">
                ₹{Number(receipt.payment_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs py-2">
              <div>
                <span className="text-3xs text-gray-455 uppercase font-semibold">Tenant Name</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{receipt.tenant_name}</p>
              </div>
              <div>
                <span className="text-3xs text-gray-455 uppercase font-semibold">Hostel / PG Branch</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{receipt.hostel_name}</p>
              </div>
              <div>
                <span className="text-3xs text-gray-455 uppercase font-semibold">Payment Mode</span>
                <p className="font-bold text-gray-950 dark:text-white mt-0.5 uppercase">{receipt.payment_mode}</p>
              </div>
              <div>
                <span className="text-3xs text-gray-455 uppercase font-semibold">UTR Reference Number</span>
                <p className="font-mono font-bold text-gray-900 dark:text-white mt-0.5 select-all">{receipt.utr_number}</p>
              </div>
              <div>
                <span className="text-3xs text-gray-455 uppercase font-semibold">Date Paid</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {new Date(receipt.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <span className="text-3xs text-gray-455 uppercase font-semibold">Generated On</span>
                <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {new Date(receipt.generated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {receipt.remarks && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-3xs text-gray-455 uppercase font-semibold">Remarks / Verification Note</span>
                <p className="text-xxs text-gray-650 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-100 dark:border-gray-850 font-medium">
                  {receipt.remarks}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-955 border-t border-gray-100 dark:border-gray-850">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer font-semibold">
            Close Panel
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} className="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>
        
      </div>
    </div>
  );
};
