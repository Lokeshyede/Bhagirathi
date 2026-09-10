import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { resetPasswordSchema, ResetPasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input } from "@bhagirathi/ui";
import { KeyRound, CheckCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const response = await apiClient.post("/api/v1/auth/reset-password", {
        token,
        new_password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Reset failed. Token might be invalid or expired.";
      setServerError(typeof msg === "string" ? msg : "Error updating password.");
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) {
      setServerError("Reset token is missing. Please check your reset link.");
      return;
    }
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-900 p-4 transition-colors select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.04),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden p-8 relative z-10 space-y-6"
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/10 mb-3.5">
            <KeyRound className="h-5.5 w-5.5" />
          </div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-wider leading-tight">
            Reset Password
          </h2>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-1">
            Set your new account password below.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4 font-semibold text-xs text-stone-605">
            <div className="flex justify-center text-green-600">
              <CheckCircle className="h-12 w-12" />
            </div>
            <p className="text-stone-705 dark:text-stone-300 leading-relaxed max-w-xs mx-auto">
              Your password has been reset successfully. You can now sign in using your new credentials.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-1.5 font-black bg-red-600 hover:bg-red-700 h-11 text-white rounded-xl uppercase tracking-wider text-xs cursor-pointer border-none"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-semibold text-xs text-stone-605">
            {(!token || serverError) && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-xs border border-red-200/50 dark:border-red-900/25">
                <ShieldAlert className="h-[18px] w-[18px] shrink-0" />
                <span>{serverError || "Reset token is missing. Please check your reset link."}</span>
              </div>
            )}

            <div className="space-y-1">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-1 focus:ring-red-600"
                {...register("password")}
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-1 focus:ring-red-600"
                {...register("confirmPassword")}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-black bg-red-600 hover:bg-red-700 h-11 text-white flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer border-none mt-2"
              disabled={!token}
              isLoading={mutation.isPending}
            >
              Reset Password
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
