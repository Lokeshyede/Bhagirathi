import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Override Dialog ───────────────────────────────────────────────────────────

const overrideSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  remarks: z.string().optional(),
  confirm: z.literal(true, { errorMap: () => ({ message: "You must confirm the override" }) }),
});

type OverrideForm = z.infer<typeof overrideSchema>;

interface OverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OverrideForm) => void;
  loading?: boolean;
  paymentReference?: string | null;
  riskLevel?: string | null;
}

export const OverrideDialog: React.FC<OverrideDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  paymentReference,
  riskLevel,
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<OverrideForm>({
    resolver: zodResolver(overrideSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Manual Override</h3>
              {paymentReference && (
                <p className="text-xs text-slate-400">{paymentReference} · {riskLevel} Risk</p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mb-5 text-xs text-amber-400">
          ⚠ Overriding a security warning does not verify the payment. The payment will still require normal verification. This action is permanently recorded in the audit log.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Override Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("reason")}
              rows={3}
              placeholder="Explain why this security warning is being overridden (min 10 chars)..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-400">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Remarks (optional)
            </label>
            <input
              {...register("remarks")}
              type="text"
              placeholder="Any additional context..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register("confirm")}
              value="true"
              className="mt-0.5 h-4 w-4 rounded accent-violet-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              I confirm this override is justified and understand it will be permanently recorded in the security audit log.
            </span>
          </label>
          {errors.confirm && (
            <p className="text-xs text-red-400">{errors.confirm.message}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Overriding..." : "Confirm Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ─── Release Hold Dialog ───────────────────────────────────────────────────────

const releaseSchema = z.object({
  override_reason: z.string().min(10, "Release reason must be at least 10 characters"),
  confirm: z.literal(true, { errorMap: () => ({ message: "You must confirm the release" }) }),
});

type ReleaseForm = z.infer<typeof releaseSchema>;

interface ReleaseHoldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReleaseForm) => void;
  loading?: boolean;
  paymentReference?: string | null;
  riskScore?: number | null;
}

export const ReleaseHoldDialog: React.FC<ReleaseHoldDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  paymentReference,
  riskScore,
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReleaseForm>({
    resolver: zodResolver(releaseSchema),
  });

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Release Security Hold</h3>
              {paymentReference && (
                <p className="text-xs text-slate-400">{paymentReference} · Score: {riskScore}/100</p>
              )}
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-5 text-xs text-red-400">
          ⚠ This payment was flagged as <strong>Critical Risk</strong> and locked. Releasing the hold allows it to proceed to verification. This action is permanently audited.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Release Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("override_reason")}
              rows={3}
              placeholder="Explain why this security hold is being released..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
            {errors.override_reason && (
              <p className="mt-1 text-xs text-red-400">{errors.override_reason.message}</p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("confirm")}
              value="true"
              className="mt-0.5 h-4 w-4 rounded accent-emerald-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400">
              I confirm this hold release is justified and understand it will be permanently recorded.
            </span>
          </label>
          {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Releasing..." : "Release Hold"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
