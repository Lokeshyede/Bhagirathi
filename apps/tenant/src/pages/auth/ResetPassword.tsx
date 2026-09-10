import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { resetPasswordSchema, ResetPasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input } from "@bhagirathi/ui";
import { KeyRound, CheckCircle, ShieldAlert } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-955 p-4 transition-colors select-none">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-lg p-8 space-y-6">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-955/20 text-red-655 flex items-center justify-center shadow-sm mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-stone-850 dark:text-white uppercase tracking-wider">
            Reset Password
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 text-center leading-normal font-semibold">
            Set your new account password below.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-5 select-none">
            <div className="flex justify-center text-green-600 dark:text-green-500">
              <CheckCircle className="h-16 w-16 animate-bounce" />
            </div>
            <p className="text-xs text-stone-605 dark:text-stone-300 font-semibold leading-relaxed">
              Your password has been reset successfully. You can now sign in using your new credentials.
            </p>
            <Link
              to="/login"
              className="btn-primary-tenant inline-flex items-center justify-center h-10 w-full text-white font-black uppercase tracking-wider text-xs rounded-xl"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(!token || serverError) && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-955/20 text-red-750 dark:text-red-400 rounded-xl text-xs border border-red-200 dark:border-red-950/30">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span className="font-bold leading-normal">{serverError || "Reset token is missing. Please check your reset link."}</span>
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
              className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
            />

            <Button
              type="submit"
              className="btn-primary-tenant w-full font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer mt-4"
              disabled={!token}
              isLoading={mutation.isPending}
            >
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
