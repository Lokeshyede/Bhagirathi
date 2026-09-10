import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { changePasswordSchema, ChangePasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input } from "@bhagirathi/ui";
import { useAuthStore } from "../../store/auth";
import { ShieldAlert, CheckCircle, KeyRound } from "lucide-react";

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
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4 select-none">
        <KeyRound className="h-6 w-6 text-red-600 shrink-0" />
        <div>
          <h2 className="text-sm font-black text-stone-850 dark:text-white uppercase tracking-wider">Change Password</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-normal font-semibold">Update your account credentials</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-4 py-4 select-none">
          <div className="flex justify-center text-green-600 dark:text-green-500 animate-bounce">
            <CheckCircle className="h-14 w-14" />
          </div>
          <p className="text-xs text-stone-605 dark:text-stone-300 font-semibold leading-relaxed">
            Password changed successfully! You will be redirected to the login screen shortly to authenticate with your new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs text-red-750 dark:text-red-400 select-none">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
            className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register("newPassword")}
            className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
            className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
          />

          <Button
            type="submit"
            className="btn-primary-tenant w-full font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer mt-4 text-white"
            isLoading={mutation.isPending}
          >
            Update Password
          </Button>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
