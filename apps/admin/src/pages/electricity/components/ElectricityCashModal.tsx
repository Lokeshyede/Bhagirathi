import React, { useState, useEffect } from "react";
import { X, Banknote, Zap } from "lucide-react";
import { Button, Input, Textarea } from "@bhagirathi/ui";
import { useToastStore } from "../../../store/useToastStore";
import { useRecordCashCollection } from "../../../features/rent_collection/hooks/useRentCollection";

interface ElectricityCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: {
    tenant_id: string;
    tenant_name: string;
    room_number: string;
    bill_id: string;
    billing_month: string;
    bill_month: number;
    bill_year: number;
    tenant_share: number;
    amount_paid: number;
    outstanding: number;
  } | null;
}

export const ElectricityCashModal: React.FC<ElectricityCashModalProps> = ({
  isOpen,
  onClose,
  billData
}) => {
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState("Cash collected by Admin for Electricity");
  const toast = useToastStore();
  const recordCollection = useRecordCashCollection();

  useEffect(() => {
    if (isOpen && billData) {
      setAmount(String(billData.outstanding));
      setRemarks("Cash collected by Admin for Electricity");
    } else {
      setAmount("");
    }
  }, [isOpen, billData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billData) return;

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    if (amtNum > billData.outstanding + 0.01) {
      toast.error(`Amount cannot exceed the outstanding balance of ₹${billData.outstanding}`);
      return;
    }

    try {
      await recordCollection.mutateAsync({
        tenant_id: billData.tenant_id,
        amount: amtNum,
        remarks,
        billing_month: billData.bill_month,
        billing_year: billData.bill_year,
        payment_type: "ELECTRICITY",
        electricity_bill_id: billData.bill_id
      });
      toast.success("Electricity cash payment recorded successfully.");
      setAmount("");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to record cash payment collection.");
    }
  };

  if (!isOpen || !billData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative max-w-md w-full bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card overflow-hidden shadow-card flex flex-col z-10">
        <div className="p-5 border-b border-gray-150 dark:border-gray-850 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h3 className="text-base font-extrabold text-primaryText dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Banknote className="h-4.5 w-4.5 text-emerald-600" /> Record Electricity Cash
            </h3>
            <p className="text-[10px] text-muted font-medium mt-1">
              Record cash payment against electricity dues
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-muted hover:text-primaryText rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="bg-gray-50 dark:bg-gray-955 rounded-xl p-4 border border-border space-y-3 shadow-sm select-none">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-850">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">Tenant</span>
              <span className="text-sm font-extrabold text-primaryText dark:text-white">{billData.tenant_name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-850">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">Room</span>
              <span className="text-xs font-semibold text-secondaryText">{billData.room_number}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-850">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">Billing Period</span>
              <span className="text-xs font-semibold text-secondaryText flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500" /> {billData.billing_month}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-850">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">Tenant Share</span>
              <span className="text-sm font-mono font-black text-primaryText dark:text-gray-200">
                ₹{Number(billData.tenant_share).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-850">
              <span className="text-xs text-muted font-bold uppercase tracking-wider">Already Paid</span>
              <span className="text-sm font-mono font-bold text-emerald-600">
                ₹{Number(billData.amount_paid).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-primary font-black uppercase tracking-wider">Outstanding Dues</span>
              <span className="text-base font-mono font-black text-amber-600">
                ₹{Number(billData.outstanding).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-primaryText dark:text-gray-300 uppercase tracking-widest block">
                Amount Received (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                min="1"
                step="0.01"
                max={billData.outstanding}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono text-lg font-bold"
                disabled={billData.outstanding <= 0}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-primaryText dark:text-gray-300 uppercase tracking-widest block">
                Remarks
              </label>
              <Textarea
                rows={2}
                placeholder="Optional remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordCollection.isPending || billData.outstanding <= 0}
              className="h-10 px-5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none cursor-pointer flex items-center gap-2"
            >
              {recordCollection.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
