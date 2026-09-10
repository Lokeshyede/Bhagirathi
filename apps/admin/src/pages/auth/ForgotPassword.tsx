import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { forgotPasswordSchema, ForgotPasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input } from "@bhagirathi/ui";
import { Building2, ArrowLeft, CheckCircle, Mail, ShieldAlert } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/25 mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bhagirathi Admin</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hostel & PG Management</p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Sent!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                A password reset link has been sent to your email address.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-semibold hover:underline transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Enter your admin email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-950/30"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </motion.div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@bhagirathi.com"
                  error={errors.email?.message}
                  className="pl-9"
                  {...register("email")}
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold cursor-pointer mt-2"
                isLoading={mutation.isPending}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white font-medium transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
