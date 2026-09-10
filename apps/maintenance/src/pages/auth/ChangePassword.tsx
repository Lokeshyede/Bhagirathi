import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { changePasswordSchema, ChangePasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input } from "@bhagirathi/ui";
import { useAuthStore } from "../../store/auth";
import { ShieldAlert, CheckCircle, KeyRound, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const response = await apiClient.post("/api/v1/auth/change-password", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      reset();
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 3000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Failed to change password. Make sure current password is correct.";
      setServerError(typeof msg === "string" ? msg : "Error updating password.");
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xs p-6 select-none"
    >
      <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center border border-red-100 dark:border-red-900/30">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-stone-850 dark:text-white uppercase tracking-wider">Change Password</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold mt-0.5">Update your account credentials</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-3 py-6">
          <div className="flex justify-center text-green-600">
            <CheckCircle className="h-12 w-12" />
          </div>
          <p className="text-xs font-semibold text-stone-605 dark:text-stone-300 leading-relaxed max-w-xs mx-auto">
            Password changed successfully! You will be redirected to the login screen shortly to authenticate with your new credentials.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-semibold text-xs text-stone-605">
          {serverError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-xs border border-red-200/50 dark:border-red-900/25">
              <ShieldAlert className="h-[18px] w-[18px] shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              error={errors.currentPassword?.message}
              className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-1 focus:ring-red-600"
              {...register("currentPassword")}
            />
          </div>

          <div className="space-y-1">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.newPassword?.message}
              className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-1 focus:ring-red-600"
              {...register("newPassword")}
            />
          </div>

          <div className="space-y-1">
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmNewPassword?.message}
              className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 focus:ring-1 focus:ring-red-600"
              {...register("confirmNewPassword")}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-black bg-red-600 hover:bg-red-700 h-11 text-white flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer border-none mt-2"
            isLoading={mutation.isPending}
          >
            <span>Update Password</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}
    </motion.div>
  );
};

export default ChangePassword;
