import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { forgotPasswordSchema, ForgotPasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input } from "@bhagirathi/ui";
import { Building2, ArrowLeft, CheckCircle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-955 p-4 transition-colors select-none">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-lg p-8 space-y-6">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-955/20 text-red-655 flex items-center justify-center shadow-sm mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-stone-850 dark:text-white uppercase tracking-wider">
            Forgot Password
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 text-center leading-normal font-semibold max-w-[280px]">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-5">
            <div className="flex justify-center text-green-600 dark:text-green-500">
              <CheckCircle className="h-16 w-16 animate-bounce" />
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold leading-relaxed">
              A password reset link has been dispatched to your email address (simulated in backend logs for local test).
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-black text-red-655 hover:text-red-700 uppercase tracking-wider"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <p className="text-xs text-red-700 font-bold bg-red-50 dark:bg-red-955/20 p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 select-none">
                {serverError}
              </p>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="user@bhagirathi.com"
              error={errors.email?.message}
              {...register("email")}
              className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
            />

            <Button
              type="submit"
              className="btn-primary-tenant w-full font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer mt-4"
              isLoading={mutation.isPending}
            >
              Send Reset Link
            </Button>

            <div className="text-center mt-4 pt-1 select-none">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white text-xs font-black uppercase tracking-wider transition"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
