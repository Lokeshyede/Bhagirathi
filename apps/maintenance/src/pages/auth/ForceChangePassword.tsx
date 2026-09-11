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
import { motion } from "framer-motion";

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
    if (score <= 2) return { label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { label: "Medium", color: "bg-orange-500" };
    return { label: "Strong", color: "bg-green-500" };
  };
  const strengthInfo = getStrengthLabel(pwdStrength);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-900 px-4 py-12 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.04),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-lg p-6 space-y-6 relative z-10"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <BhagirathiLogo size="lg" className="h-12 w-12 mb-3.5" />
          <h2 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-wider">
            Create Secure Password
          </h2>
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-1">
            First-time login security verification required
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl flex items-start gap-3 text-xs font-semibold">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-800 dark:text-green-400">Password Changed</h4>
              <p className="text-[10px] text-green-600 mt-0.5 leading-relaxed">Your credentials have been updated. Redirecting to dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-semibold text-xs text-stone-605">
            {serverError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/25 rounded-2xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="relative">
              <Input
                label="New Secure Password *"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                error={errors.newPassword?.message}
                className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:ring-1 focus:ring-red-600"
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-[10px] font-black text-stone-400 hover:text-stone-705"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            <div className="space-y-1">
              <Input
                label="Confirm Password *"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                error={errors.confirmNewPassword?.message}
                className="h-[42px] rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:ring-1 focus:ring-red-600"
                {...register("confirmNewPassword")}
              />
            </div>

            {watchedPassword && (
              <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-stone-400">Password Strength:</span>
                  <span className={
                    pwdStrength <= 2 ? "text-red-500" : pwdStrength <= 4 ? "text-orange-550" : "text-green-550"
                  }>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthInfo.color} transition-all duration-300`}
                    style={{ width: `${(pwdStrength / 5) * 100}%` }}
                  />
                </div>
                <ul className="text-[10px] text-stone-500 dark:text-stone-400 list-disc list-inside space-y-0.5 mt-1.5 font-semibold">
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
                className="flex-1 font-black h-11 border-slate-200 dark:border-zinc-800 text-stone-600 rounded-xl uppercase tracking-wider text-xs cursor-pointer"
                disabled={mutation.isPending}
              >
                Sign Out
              </Button>
              <Button
                type="submit"
                className="flex-1 font-black bg-red-600 hover:bg-red-700 h-11 text-white flex items-center justify-center gap-1.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer border-none"
                isLoading={mutation.isPending}
                disabled={mutation.isPending}
              >
                Save Password
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForceChangePassword;
