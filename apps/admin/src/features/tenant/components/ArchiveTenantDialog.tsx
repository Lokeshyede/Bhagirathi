import React, { useState } from "react";
import { Modal, Button } from "@bhagirathi/ui";
import { Archive, AlertTriangle, ShieldCheck, BedDouble, CheckCircle2 } from "lucide-react";

interface ArchiveTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  tenantName: string;
  tenantId?: string;
  roomBedInfo?: string;
  isLoading?: boolean;
}

export const ArchiveTenantDialog: React.FC<ArchiveTenantDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tenantName,
  tenantId: _tenantId,
  roomBedInfo,
  isLoading,
}) => {
  const [reason, setReason] = useState("");
  const [quickReason, setQuickReason] = useState("Stay completed / Shifted out");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason.trim() || quickReason;
    onConfirm(finalReason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Archive Tenant: ${tenantName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning & info banner */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <p className="font-bold text-amber-600 dark:text-amber-400">
              Soft Delete & Historical Preservation
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              This will deactivate <span className="font-semibold text-slate-800 dark:text-slate-200">{tenantName}</span> and move them to the <span className="font-semibold text-slate-800 dark:text-slate-200">Archived Tenants Registry</span>.
            </p>
          </div>
        </div>

        {/* System Safeguards summary */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Automated Archival Actions
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <BedDouble className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>
                {roomBedInfo ? (
                  <>Releases active allocation: <strong className="text-slate-800 dark:text-white">{roomBedInfo}</strong></>
                ) : (
                  <>Releases any active room & bed allocation immediately</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Deactivates tenant login credentials and active app sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>Preserves rent ledgers, payments, electricity bills, and contracts</span>
            </div>
          </div>
        </div>

        {/* Preset quick reasons */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Reason for Archival
          </label>
          <select
            value={quickReason}
            onChange={(e) => setQuickReason(e.target.value)}
            className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="Stay completed / Shifted out">Stay completed / Shifted out</option>
            <option value="College or Course completion">College or Course completion</option>
            <option value="Job relocation or transfer">Job relocation or transfer</option>
            <option value="Left without prior notice">Left without prior notice</option>
            <option value="Non-payment of dues">Non-payment of dues</option>
            <option value="Disciplinary or policy violation">Disciplinary or policy violation</option>
            <option value="Other / Custom Reason">Other / Custom Reason</option>
          </select>
        </div>

        {/* Custom notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Additional Remarks <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Additional context or remarks..."
            className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 cursor-pointer font-bold"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer inline-flex items-center justify-center gap-2"
            isLoading={isLoading}
          >
            <Archive className="h-4 w-4" />
            Archive Tenant
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ArchiveTenantDialog;
