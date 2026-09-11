import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { forgotPasswordSchema, ForgotPasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input, BhagirathiLogo } from "@bhagirathi/ui";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const ForgotPassword: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const response = await apiClient.post("/api/v1/auth/forgot-password", data);
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "An error occurred. Please try again.";
      setServerError(typeof msg === "string" ? msg : "Failed to submit request.");
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
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
          <BhagirathiLogo size="lg" className="h-12 w-auto max-h-[48px] mb-3.5" />
          <h2 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-wider leading-tight">
            Forgot Password
          </h2>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-1">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4 font-semibold text-xs text-stone-605">
            <div className="flex justify-center text-green-600">
              <CheckCircle className="h-12 w-12" />
            </div>
            <p className="text-stone-705 dark:text-stone-300 leading-relaxed max-w-xs mx-auto">
              A password reset link has been dispatched to your email address (simulated in backend logs for local test).
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold uppercase tracking-wider text-[10px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-semibold text-xs text-stone-605">
            {serverError && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-xs border border-red-200/50 dark:border-red-900/25">
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                placeholder="user@bhagirathi.com"
                error={errors.email?.message}
                className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-1 focus:ring-red-600"
                {...register("email")}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-black bg-red-600 hover:bg-red-700 h-11 text-white flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer border-none"
              isLoading={mutation.isPending}
            >
              Send Reset Link
            </Button>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-stone-450 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white text-xs font-bold transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
