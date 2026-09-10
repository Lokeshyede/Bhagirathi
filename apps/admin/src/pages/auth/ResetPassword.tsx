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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-955 p-4 transition-colors">
      <div className="w-full max-w-md backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/25 mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Set your new account password below.
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center text-green-600 dark:text-green-500">
              <CheckCircle className="h-16 w-16" />
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Your password has been reset successfully. You can now sign in using your new credentials.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-10 w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded transition cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {(!token || serverError) && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-950/30">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{serverError || "Reset token is missing. Please check your reset link."}</span>
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full font-semibold cursor-pointer"
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
