import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rentPaymentSchema, RentPaymentInput } from "@bhagirathi/validation";
import { Rent, Tenant } from "@bhagirathi/types";
import { Drawer, Button, Input } from "@bhagirathi/ui";
import { CheckSquare, Plus } from "lucide-react";
import { formatDate, formatCurrency } from "@bhagirathi/utils";

interface RentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rent: Rent;
  tenant?: Tenant | null;
  onRecordPayment: (amount: number, method: string, remarks?: string) => Promise<void>;
  isLoading?: boolean;
}

export const RentDetailsDrawer: React.FC<RentDetailsDrawerProps> = ({
  isOpen,
  onClose,
  rent,
  tenant,
  onRecordPayment,
  isLoading
}) => {
  const [showPayForm, setShowPayForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const balance = Number(rent.total_amount) - Number(rent.paid_amount);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RentPaymentInput>({
    resolver: zodResolver(rentPaymentSchema),
    defaultValues: {
      amount_paid: balance,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "UPI",
      remarks: "",
    },
  });

  const handlePaymentSubmit = async (data: RentPaymentInput) => {
    try {
      setErrorMsg(null);
      if (data.amount_paid > balance) {
        setErrorMsg("Payment exceeds remaining balance.");
        return;
      }
      await onRecordPayment(data.amount_paid, data.payment_method, data.remarks || undefined);
      setShowPayForm(false);
      reset();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to record payment.");
    }
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNum - 1] || "N/A";
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Invoice Ledger Timeline">
      <div className="space-y-6 select-none">
        {/* Tenant Summary block */}
        <div className="p-4 bg-gray-50/60 dark:bg-gray-955/20 border border-border dark:border-gray-850 rounded-card">
          <div className="font-bold text-[9px] text-muted dark:text-gray-500 uppercase tracking-widest">Billing Dossier</div>
          <h5 className="font-extrabold text-sm text-primaryText dark:text-white mt-1">
            {tenant ? tenant.full_name : "Unknown Tenant"}
          </h5>
          <div className="text-[10px] text-secondaryText dark:text-gray-400 mt-1.5 flex justify-between font-medium">
            <span>Bill Cycle: {getMonthName(rent.rent_month)} {rent.rent_year}</span>
            <span className="font-mono">ID: {tenant?.tenant_id}</span>
          </div>
        </div>

        {/* Totals Grid */}
        <div className="grid grid-cols-3 gap-3 border border-border dark:border-gray-800 p-4 rounded-card text-center select-none">
          <div>
            <span className="text-[8px] font-bold text-muted dark:text-gray-500 uppercase tracking-wider block">Grand Total</span>
            <span className="text-xs font-black text-primaryText dark:text-white block mt-1 tabular-nums">
              {formatCurrency(Number(rent.total_amount)).split(".00")[0]}
            </span>
          </div>
          <div>
            <span className="text-[8px] font-bold text-muted dark:text-gray-500 uppercase tracking-wider block">Collected</span>
            <span className="text-xs font-black text-success block mt-1 tabular-nums">
              {formatCurrency(Number(rent.paid_amount)).split(".00")[0]}
            </span>
          </div>
          <div>
            <span className="text-[8px] font-bold text-muted dark:text-gray-500 uppercase tracking-wider block">Remaining</span>
            <span className={`text-xs font-black block mt-1 tabular-nums ${balance > 0 ? "text-danger" : "text-secondaryText dark:text-gray-550"}`}>
              {formatCurrency(balance).split(".00")[0]}
            </span>
          </div>
        </div>

        {/* Invoice Itemized breakdowns */}
        <div className="space-y-3">
          <h6 className="text-[9px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-850 pb-2">Itemized Billings</h6>
          {rent.items && rent.items.length > 0 ? (
            <div className="space-y-2 text-xs font-semibold">
              {rent.items.map((item) => (
                <div key={item.id} className="flex justify-between p-2.5 bg-gray-50/50 dark:bg-gray-850/10 rounded border border-border dark:border-gray-800">
                  <span className="text-secondaryText dark:text-gray-300">{item.name}</span>
                  <span className="text-primaryText dark:text-white tabular-nums">{formatCurrency(Number(item.amount)).split(".00")[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted text-xs italic">No billing details recorded.</div>
          )}
        </div>

        {/* Payments History logs */}
        <div className="space-y-3">
          <h6 className="text-[9px] font-bold text-secondaryText dark:text-gray-400 uppercase tracking-widest border-b border-border dark:border-gray-850 pb-2">Payments Log Timeline</h6>
          {rent.history && rent.history.length > 0 ? (
            <div className="space-y-2.5">
              {rent.history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-border dark:border-gray-805 rounded-card text-xs font-semibold">
                  <div className="p-2 bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 rounded-xl">
                    <CheckSquare className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-black text-primaryText dark:text-white tabular-nums">{formatCurrency(Number(h.amount_paid)).split(".00")[0]}</span>
                      <span className="text-[10px] text-muted dark:text-gray-550 tabular-nums font-bold uppercase">{formatDate(h.payment_date, true)}</span>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <div className="text-[10px] text-secondaryText dark:text-gray-450">Method: {h.payment_method} {h.remarks && `| Note: ${h.remarks}`}</div>
                      {(h as any).receipt_url && (
                        <a 
                          href={(h as any).receipt_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9px] font-black uppercase text-primary hover:underline"
                        >
                          View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted text-xs italic">No payments recorded yet.</div>
          )}
        </div>

        {/* Record payment triggers */}
        {balance > 0 && (
          <div className="border-t border-border dark:border-gray-800 pt-4">
            {!showPayForm ? (
              <Button
                onClick={() => setShowPayForm(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 font-bold cursor-pointer text-xs h-9.5"
              >
                <Plus className="h-4 w-4" />
                <span>Collect Rent Payment</span>
              </Button>
            ) : (
              <form onSubmit={handleSubmit(handlePaymentSubmit)} className="p-4 bg-gray-50/60 dark:bg-gray-950/30 border border-border dark:border-gray-800 rounded-card space-y-4">
                <div className="flex justify-between items-center border-b border-border/80 dark:border-gray-800 pb-2">
                  <span className="text-[10px] font-bold text-secondaryText dark:text-gray-300 uppercase tracking-widest">Record Rent Payment</span>
                  <button
                    type="button"
                    onClick={() => setShowPayForm(false)}
                    className="text-[10px] text-danger font-bold hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 font-bold">{errorMsg}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Amount Paid *"
                    type="number"
                    error={errors.amount_paid?.message}
                    {...register("amount_paid")}
                  />

                  <Input
                    label="Payment Date *"
                    type="date"
                    error={errors.payment_date?.message}
                    {...register("payment_date")}
                  />
                </div>

                <div className="flex flex-col gap-1.5 select-none">
                  <label className="text-xs font-bold text-secondaryText dark:text-gray-300">Payment Mode *</label>
                  <select
                    {...register("payment_method")}
                    className="h-9.5 px-3 border border-border dark:border-gray-800 rounded-input bg-white dark:bg-gray-905 text-xs font-semibold text-primaryText dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all"
                  >
                    <option value="UPI">UPI/QR Code</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="CARD">Debit/Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <Input
                  label="Receipt Note / Remarks"
                  type="text"
                  placeholder="Receipt details..."
                  error={errors.remarks?.message}
                  {...register("remarks")}
                />

                <Button
                  type="submit"
                  className="w-full font-bold cursor-pointer h-9.5 text-white"
                  isLoading={isLoading}
                >
                  Record Payment
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default RentDetailsDrawer;
