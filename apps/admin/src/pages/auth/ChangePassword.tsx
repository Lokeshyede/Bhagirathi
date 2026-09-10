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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
        <KeyRound className="h-6 w-6 text-red-600 shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Update your account credentials</p>
        </div>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-3 py-4">
          <div className="flex justify-center text-green-650 dark:text-green-500">
            <CheckCircle className="h-12 w-12" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Password changed successfully! You will be redirected to the login screen shortly to authenticate with your new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-950/30">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />

          <Button
            type="submit"
            className="w-full font-semibold cursor-pointer"
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
