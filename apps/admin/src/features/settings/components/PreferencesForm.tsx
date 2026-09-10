import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button } from "@bhagirathi/ui";
import { useAppPreferences, useUpdatePreferences } from "../hooks/useSettings";
import { ShieldAlert, CheckCircle } from "lucide-react";

const preferencesSchema = zod.object({
  default_currency: zod.string().min(1, "Currency is required"),
  date_format: zod.string().min(1, "Date format is required"),
  time_format: zod.string().min(1, "Time format is required"),
  theme: zod.string().min(1, "Theme selection is required"),
  language: zod.string().min(1, "Default language is required")
});

type PreferencesFormValues = zod.infer<typeof preferencesSchema>;

export const PreferencesForm: React.FC = () => {
  const { data: preferences, isLoading } = useAppPreferences();
  const updateMutation = useUpdatePreferences();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema)
  });

  // Populate data when fetched
  useEffect(() => {
    if (preferences) {
      reset({
        default_currency: preferences.default_currency,
        date_format: preferences.date_format,
        time_format: preferences.time_format,
        theme: preferences.theme,
        language: preferences.language
      });
    }
  }, [preferences, reset]);

  const onSubmit = async (values: PreferencesFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      await updateMutation.mutateAsync(values);
      setSuccessMsg("Application preference parameters saved successfully!");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to update preferences.");
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (preferences) {
      reset({
        default_currency: preferences.default_currency,
        date_format: preferences.date_format,
        time_format: preferences.time_format,
        theme: preferences.theme,
        language: preferences.language
      });
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-xs text-gray-500 animate-pulse font-semibold">Loading preferences...</span>
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
        <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-955 text-red-655 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100 dark:border-red-950/30">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Currency Dropdown */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Default System Currency
          </label>
          <select
            {...register("default_currency")}
            className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-905 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
          </select>
          {errors.default_currency && (
            <p className="text-[10px] text-red-655 font-bold uppercase tracking-wide">{errors.default_currency.message}</p>
          )}
        </div>

        {/* Date Format */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Preferred Date Format
          </label>
          <select
            {...register("date_format")}
            className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-905 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 31/12/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 12/31/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-12-31)</option>
          </select>
          {errors.date_format && (
            <p className="text-[10px] text-red-655 font-bold uppercase tracking-wide">{errors.date_format.message}</p>
          )}
        </div>

        {/* Time Format */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Preferred Time Format
          </label>
          <select
            {...register("time_format")}
            className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-905 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="12h">12-Hour format (e.g. 02:30 PM)</option>
            <option value="24h">24-Hour format (e.g. 14:30)</option>
          </select>
          {errors.time_format && (
            <p className="text-[10px] text-red-655 font-bold uppercase tracking-wide">{errors.time_format.message}</p>
          )}
        </div>

        {/* Theme Settings */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Default Workspace Theme
          </label>
          <select
            {...register("theme")}
            className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-905 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="light">Light Theme Mode</option>
            <option value="dark">Dark Theme Mode</option>
            <option value="system">Follow Device System settings</option>
          </select>
          {errors.theme && (
            <p className="text-[10px] text-red-655 font-bold uppercase tracking-wide">{errors.theme.message}</p>
          )}
        </div>

        {/* Default Language */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Preferred Language
          </label>
          <select
            {...register("language")}
            className="w-full h-10 px-3 bg-gray-50 dark:bg-gray-955 border border-gray-250 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-905 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="en">English (Default)</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="es">Spanish (Español)</option>
          </select>
          {errors.language && (
            <p className="text-[10px] text-red-655 font-bold uppercase tracking-wide">{errors.language.message}</p>
          )}
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-855">
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
          Save Preferences
        </Button>
      </div>
    </form>
  );
};

export default PreferencesForm;
