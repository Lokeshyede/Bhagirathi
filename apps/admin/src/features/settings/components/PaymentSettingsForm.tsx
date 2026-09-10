import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Input, Button } from "@bhagirathi/ui";
import { usePaymentSettings, useUpdatePaymentSettings } from "../hooks/useSettings";
import { ImageUploader } from "./ImageUploader";
import { ShieldAlert, CheckCircle } from "lucide-react";

const paymentSettingsSchema = zod.object({
  upi_id: zod.string().min(3, "UPI ID is required").regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID format (e.g., name@bank)"),
  account_holder_name: zod.string().min(2, "Account holder name is required"),
  bank_name: zod.string().min(2, "Bank name is required"),
  payment_instructions: zod.string().optional().nullable().or(zod.literal("")),
  enable_online_payment: zod.boolean().default(true)
});

type PaymentSettingsFormValues = zod.infer<typeof paymentSettingsSchema>;

export const PaymentSettingsForm: React.FC = () => {
  const { data: settings, isLoading } = usePaymentSettings();
  const updateMutation = useUpdatePaymentSettings();
  const [qrFile, setQrFile] = useState<File | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema)
  });

  const enableOnlinePayment = watch("enable_online_payment");

  // Populate data when fetched
  useEffect(() => {
    if (settings) {
      reset({
        upi_id: settings.upi_id,
        account_holder_name: settings.account_holder_name,
        bank_name: settings.bank_name,
        payment_instructions: settings.payment_instructions || "",
        enable_online_payment: settings.enable_online_payment
      });
    }
  }, [settings, reset]);

  const onSubmit = async (values: PaymentSettingsFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      const fd = new FormData();
      fd.append("upi_id", values.upi_id);
      fd.append("account_holder_name", values.account_holder_name);
      fd.append("bank_name", values.bank_name);
      if (values.payment_instructions) {
        fd.append("payment_instructions", values.payment_instructions);
      }
      fd.append("enable_online_payment", values.enable_online_payment ? "true" : "false");
      if (qrFile) {
        fd.append("qr_file", qrFile);
      }

      await updateMutation.mutateAsync(fd);
      setSuccessMsg("UPI payment settings saved successfully!");
      setQrFile(null); // Reset file selection
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to update payment settings.");
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (settings) {
      reset({
        upi_id: settings.upi_id,
        account_holder_name: settings.account_holder_name,
        bank_name: settings.bank_name,
        payment_instructions: settings.payment_instructions || "",
        enable_online_payment: settings.enable_online_payment
      });
      setQrFile(null);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-xs text-gray-500 animate-pulse font-semibold">Loading payment configurations...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-green-50 dark:bg-green-955 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-green-100 dark:border-green-950/30">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100 dark:border-red-950/30">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Toggle switch for Online payments */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-955 rounded-xl border border-gray-150 dark:border-gray-850">
          <div className="space-y-0.5">
            <label className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
              Online Payments Toggle
            </label>
            <p className="text-[10px] text-gray-400">
              If enabled, tenants can scan the UPI QR code to complete checkouts online.
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setValue("enable_online_payment", !enableOnlinePayment)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
              enableOnlinePayment ? "bg-red-600" : "bg-gray-300 dark:bg-gray-800"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enableOnlinePayment ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* UPI ID */}
          <Input
            label="UPI Address ID *"
            placeholder="e.g. pgmanagement@okaxis"
            error={errors.upi_id?.message}
            {...register("upi_id")}
          />

          {/* Account Holder Name */}
          <Input
            label="Account Holder Name *"
            placeholder="e.g. Bhagirathi Hostel PG"
            error={errors.account_holder_name?.message}
            {...register("account_holder_name")}
          />

          {/* Bank Name */}
          <Input
            label="Associated Bank Name *"
            placeholder="e.g. HDFC Bank"
            error={errors.bank_name?.message}
            {...register("bank_name")}
          />

          <div className="md:col-span-2">
            <ImageUploader
              label="UPI Gateway QR Code Image"
              currentImageUrl={settings?.qr_code_image || null}
              onFileSelect={setQrFile}
              maxSizeMB={2}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Special Payment Instructions
            </label>
            <textarea
              {...register("payment_instructions")}
              className="w-full min-h-[90px] p-2.5 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
              placeholder="e.g. Write room number in UPI transaction description..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-850">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="font-bold cursor-pointer h-10 px-6"
        >
          Reset Fields
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={updateMutation.isPending}
          className="font-bold cursor-pointer h-10 px-6"
        >
          Save UPI Settings
        </Button>
      </div>
    </form>
  );
};

export default PaymentSettingsForm;
