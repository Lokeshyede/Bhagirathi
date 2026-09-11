import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { forceChangePasswordSchema, ForceChangePasswordInput } from "@bhagirathi/validation";
import { apiClient } from "@bhagirathi/api-client";
import { Button, Input, BhagirathiLogo } from "@bhagirathi/ui";
import { useAuthStore } from "../../store/auth";
import { ShieldAlert, CheckCircle } from "lucide-react";

export const ForceChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForceChangePasswordInput>({
    resolver: zodResolver(forceChangePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    }
  });

  const watchedPassword = watch("newPassword") || "";

  const mutation = useMutation({
    mutationFn: async (data: ForceChangePasswordInput) => {
      const response = await apiClient.post("/api/v1/auth/force-change-password", {
        new_password: data.newPassword,
        confirm_password: data.confirmNewPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      if (user) {
        updateUser({
          ...user,
          force_password_change: false,
        });
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || "Failed to update password. Please check strength requirements.";
      setServerError(typeof msg === "string" ? msg : "Error updating password.");
    },
  });

  const onSubmit = (data: ForceChangePasswordInput) => {
    setServerError(null);
    mutation.mutate(data);
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    return score;
  };
  const pwdStrength = getPasswordStrength(watchedPassword);
  const getStrengthLabel = (score: number) => {
    if (score === 0) return { label: "", color: "bg-slate-200" };
    if (score <= 2) return { label: "Weak Strength", color: "bg-red-500" };
    if (score <= 4) return { label: "Medium Strength", color: "bg-orange-500" };
    return { label: "Strong Strength", color: "bg-green-600" };
  };
  const strengthInfo = getStrengthLabel(pwdStrength);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-955 px-4 py-12 select-none">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-lg p-6 space-y-6">
        <div className="flex flex-col items-center justify-center text-center">
          <BhagirathiLogo size="lg" className="h-12 w-12 mb-4" />
          <h2 className="text-base font-black text-stone-850 dark:text-white uppercase tracking-wider">
            Create Secure Password
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 font-semibold">
            First-time login security verification required
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 bg-green-50 dark:bg-green-955/20 border border-green-250 dark:border-green-900/30 rounded-2xl flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wider">Password Changed</h4>
              <p className="text-[10px] text-green-605 mt-1 font-semibold leading-normal">Your credentials have been updated. Redirecting to dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-2 text-xxs font-bold text-red-750 dark:text-red-400">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="relative">
              <Input
                label="New Secure Password *"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                error={errors.newPassword?.message}
                {...register("newPassword")}
                className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[32px] text-xxs font-black text-stone-400 hover:text-red-650 dark:hover:text-red-400 uppercase tracking-wider bg-transparent border-none outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Input
              label="Confirm Password *"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              error={errors.confirmNewPassword?.message}
              {...register("confirmNewPassword")}
              className="rounded-xl border-slate-200 focus:ring-red-650 h-10 text-xs"
            />

            {watchedPassword && (
              <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-850 rounded-2xl">
                <div className="flex justify-between items-center text-xxs font-black uppercase tracking-wider">
                  <span className="text-stone-400">Password Strength:</span>
                  <span className={
                    pwdStrength <= 2 ? "text-red-600" : pwdStrength <= 4 ? "text-orange-600" : "text-green-600"
                  }>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthInfo.color} transition-all duration-350`}
                    style={{ width: `${(pwdStrength / 5) * 100}%` }}
                  />
                </div>
                <ul className="text-[9.5px] text-stone-500 dark:text-stone-400 list-disc list-inside space-y-1 mt-1 font-semibold leading-normal">
                  <li className={watchedPassword.length >= 8 ? "text-green-600 dark:text-green-400" : "text-stone-400"}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-stone-400"}>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-stone-400"}>
                    At least one lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-stone-400"}>
                    At least one number (0-9)
                  </li>
                  <li className={/[@$!%*?&]/.test(watchedPassword) ? "text-green-600 dark:text-green-400" : "text-stone-400"}>
                    At least one special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex-1 font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer bg-slate-50 border-slate-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300"
                disabled={mutation.isPending}
              >
                Sign Out
              </Button>
              <Button
                type="submit"
                className="btn-primary-tenant flex-1 font-black uppercase tracking-wider text-xs h-10 rounded-xl cursor-pointer text-white"
                isLoading={mutation.isPending}
                disabled={mutation.isPending}
              >
                Save Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForceChangePassword;
